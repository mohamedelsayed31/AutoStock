using AutoStock.Application.DTOs.InventoryCost;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class InventoryCostService
    : IInventoryCostService
{
    private readonly AppDbContext
        _context;

    private readonly IAuditLogService
        _auditLogService;


    public InventoryCostService(
        AppDbContext context,
        IAuditLogService auditLogService)
    {
        _context =
            context;

        _auditLogService =
            auditLogService;
    }


    /* =========================================
       Set Legacy Inventory Cost Basis
    ========================================= */

    public async Task<InventoryCostBasisDto>
        SetCostBasisAsync(
            int carId,
            SetInventoryCostBasisDto dto)
    {
        /* =====================================
           Validation
        ===================================== */

        if (
            dto.UnitCost <= 0m
            ||
            dto.UnitCost > 1_000_000_000m)
        {
            throw new ArgumentException(
                "Unit cost must be greater than zero " +
                "and not exceed 1,000,000,000 EGP.");
        }


        var reason =
            string.IsNullOrWhiteSpace(
                dto.Reason)
                ? null
                : dto.Reason.Trim();


        if (
            reason is not null
            &&
            reason.Length > 250)
        {
            throw new ArgumentException(
                "Reason cannot exceed 250 characters.");
        }


        var roundedUnitCost =
            decimal.Round(
                dto.UnitCost,
                2,
                MidpointRounding.AwayFromZero);


        /* =====================================
           Transaction
        ===================================== */

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            /* =================================
               Current Inventory Snapshot
            ================================= */

            var carBefore =
                await _context.Cars
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        car =>
                            car.Id == carId
                            &&
                            car.IsActive);


            if (
                carBefore is null)
            {
                throw new KeyNotFoundException(
                    "Car not found.");
            }


            /*
             * This operation is intentionally
             * ONLY for legacy inventory that
             * already exists but has no known
             * AverageUnitCost.
             *
             * It must never be used as a normal
             * way to overwrite an existing
             * accounting cost basis.
             */

            if (
                carBefore.Quantity <= 0)
            {
                throw new InvalidOperationException(
                    "Inventory cost basis can only be set " +
                    "when current stock is greater than zero. " +
                    "For zero stock, the next Stock In will " +
                    "establish the cost basis automatically.");
            }


            if (
                carBefore.AverageUnitCost
                    .HasValue)
            {
                throw new InvalidOperationException(
                    "Inventory cost basis is already known. " +
                    "This operation is only for legacy inventory " +
                    "with an unknown cost basis.");
            }


            var expectedQuantity =
                carBefore.Quantity;


            var effectiveAt =
                DateTime.UtcNow;


            var inventoryValue =
                decimal.Round(
                    expectedQuantity
                    *
                    roundedUnitCost,
                    2,
                    MidpointRounding.AwayFromZero);


            /* =================================
               Atomic Cost Basis Update
            ================================= */

            var affectedRows =
                await _context.Cars
                    .Where(
                        car =>
                            car.Id == carId
                            &&
                            car.IsActive
                            &&
                            car.Quantity ==
                                expectedQuantity
                            &&
                            car.AverageUnitCost ==
                                null)
                    .ExecuteUpdateAsync(
                        setters =>
                            setters.SetProperty(
                                car =>
                                    car.AverageUnitCost,

                                roundedUnitCost));


            if (
                affectedRows != 1)
            {
                throw new InvalidOperationException(
                    "Inventory quantity or cost changed while " +
                    "setting the cost basis. " +
                    "Please refresh and try again.");
            }


            /* =================================
               Audit Log
            ================================= */

            await _auditLogService
                .LogAsync(
                    "SetInventoryCostBasis",
                    "Car",
                    carBefore.Id.ToString(),
                    $"Inventory cost basis set for " +
                    $"{carBefore.Model}. " +
                    $"Quantity snapshot: {expectedQuantity}. " +
                    $"Average unit cost: " +
                    $"{roundedUnitCost:0.00} EGP. " +
                    $"Inventory value: " +
                    $"{inventoryValue:0.00} EGP." +
                    (
                        reason is null
                            ? string.Empty
                            : $" Reason: {reason}"
                    ));


            await transaction
                .CommitAsync();


            return new InventoryCostBasisDto
            {
                CarId =
                    carBefore.Id,

                CarModel =
                    carBefore.Model,

                Quantity =
                    expectedQuantity,

                PreviousAverageUnitCost =
                    carBefore.AverageUnitCost,

                AverageUnitCost =
                    roundedUnitCost,

                InventoryValue =
                    inventoryValue,

                EffectiveAt =
                    effectiveAt,

                Reason =
                    reason
            };
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }
}

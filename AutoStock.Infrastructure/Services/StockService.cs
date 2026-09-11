using AutoStock.Application.Common;
using AutoStock.Application.DTOs.Stock;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services
{
    public class StockService : IStockService
    {
        private readonly AppDbContext
            _context;

        private readonly INotificationService
            _notificationService;


        public StockService(
            AppDbContext context,
            INotificationService notificationService)
        {
            _context =
                context;

            _notificationService =
                notificationService;
        }


        /* =========================================
           Stock In
        ========================================= */

        public async Task<StockTransactionDto>
            StockInAsync(
                int carId,
                StockOperationDto dto)
        {
            /* =====================================
               Validation
            ===================================== */

            if (
                dto.Quantity <= 0
                ||
                dto.Quantity > 10000)
            {
                throw new ArgumentException(
                    "Quantity must be between 1 and 10000.");
            }


            if (
                !dto.UnitCost.HasValue
                ||
                dto.UnitCost.Value <= 0m
                ||
                dto.UnitCost.Value > 1_000_000_000m)
            {
                throw new ArgumentException(
                    "A valid unit cost is required for Stock In.");
            }


            if (
                dto.Notes is not null
                &&
                dto.Notes.Trim().Length > 250)
            {
                throw new ArgumentException(
                    "Notes cannot exceed 250 characters.");
            }


            var incomingUnitCost =
                decimal.Round(
                    dto.UnitCost.Value,
                    2,
                    MidpointRounding.AwayFromZero);


            var notes =
                string.IsNullOrWhiteSpace(
                    dto.Notes)
                    ? null
                    : dto.Notes.Trim();


            /* =====================================
               Transaction
            ===================================== */

            await using var dbTransaction =
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


                var expectedQuantity =
                    carBefore.Quantity;


                var expectedAverageUnitCost =
                    carBefore.AverageUnitCost;


                /* =================================
                   Weighted Average Cost
                ================================= */

                decimal? newAverageUnitCost;


                /*
                 * No existing inventory:
                 *
                 * Incoming cost becomes
                 * the new inventory cost basis.
                 */
                if (
                    carBefore.Quantity <= 0)
                {
                    newAverageUnitCost =
                        incomingUnitCost;
                }

                /*
                 * Existing inventory has
                 * a known cost basis.
                 */
                else if (
                    carBefore.AverageUnitCost
                        .HasValue)
                {
                    var existingInventoryCost =
                        decimal.Round(
                            carBefore.Quantity
                            *
                            carBefore
                                .AverageUnitCost
                                .Value,
                            2,
                            MidpointRounding
                                .AwayFromZero);


                    var incomingInventoryCost =
                        decimal.Round(
                            dto.Quantity
                            *
                            incomingUnitCost,
                            2,
                            MidpointRounding
                                .AwayFromZero);


                    var newQuantity =
                        carBefore.Quantity
                        +
                        dto.Quantity;


                    newAverageUnitCost =
                        decimal.Round(
                            (
                                existingInventoryCost
                                +
                                incomingInventoryCost
                            )
                            /
                            newQuantity,
                            2,
                            MidpointRounding
                                .AwayFromZero);
                }

                /*
                 * Legacy inventory exists but
                 * its original cost is unknown.
                 *
                 * Do NOT invent a weighted average.
                 *
                 * The cost basis stays unknown until
                 * that legacy inventory reaches zero.
                 */
                else
                {
                    newAverageUnitCost =
                        null;
                }


                /* =================================
                   Atomic Inventory Update
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
                                    expectedAverageUnitCost)
                        .ExecuteUpdateAsync(
                            setters =>
                                setters
                                    .SetProperty(
                                        car =>
                                            car.Quantity,

                                        car =>
                                            car.Quantity
                                            +
                                            dto.Quantity)

                                    .SetProperty(
                                        car =>
                                            car.AverageUnitCost,

                                        newAverageUnitCost));


                /*
                 * Quantity or cost changed after
                 * our snapshot was loaded.
                 *
                 * This protects against:
                 *
                 * - Concurrent Stock In
                 * - Concurrent Stock Out
                 * - Concurrent Sale
                 * - Purchase Order Receive
                 */
                if (
                    affectedRows != 1)
                {
                    throw new InvalidOperationException(
                        "Stock or inventory cost changed while processing Stock In. " +
                        "Please refresh the inventory and try again.");
                }


                /* =================================
                   Reload Updated Car
                ================================= */

                var carAfter =
                    await _context.Cars
                        .AsNoTracking()
                        .FirstAsync(
                            car =>
                                car.Id == carId);


                /* =================================
                   Stock Transaction
                ================================= */

                var inventoryValue =
                    decimal.Round(
                        dto.Quantity
                        *
                        incomingUnitCost,
                        2,
                        MidpointRounding
                            .AwayFromZero);


                var transaction =
                    new StockTransaction
                    {
                        CarId =
                            carAfter.Id,

                        TransactionType =
                            "Stock In",

                        Quantity =
                            dto.Quantity,

                        TransactionDate =
                            DateTime.UtcNow,

                        UnitCost =
                            incomingUnitCost,

                        InventoryValue =
                            inventoryValue,

                        SourceType =
                            "Manual",

                        SourceId =
                            null,

                        Notes =
                            notes
                    };


                _context.StockTransactions
                    .Add(
                        transaction);


                await _context
                    .SaveChangesAsync();


                /* =================================
                   Commit
                ================================= */

                await dbTransaction
                    .CommitAsync();


                /* =================================
                   Response
                ================================= */

                return new StockTransactionDto
                {
                    Id =
                        transaction.Id,

                    CarId =
                        carAfter.Id,

                    CarModel =
                        carAfter.Model,

                    TransactionType =
                        transaction.TransactionType,

                    Quantity =
                        transaction.Quantity,

                    TransactionDate =
                        transaction.TransactionDate,

                    UnitCost =
                        transaction.UnitCost,

                    InventoryValue =
                        transaction.InventoryValue,

                    SourceType =
                        transaction.SourceType,

                    SourceId =
                        transaction.SourceId,

                    Notes =
                        transaction.Notes
                };
            }
            catch
            {
                await dbTransaction
                    .RollbackAsync();

                throw;
            }
        }


        /* =========================================
           Stock Out
        ========================================= */

        public async Task<StockTransactionDto>
            StockOutAsync(
                int carId,
                StockOperationDto dto)
        {
            if (
                dto.Quantity <= 0
                ||
                dto.Quantity > 10000)
            {
                throw new ArgumentException(
                    "Quantity must be between 1 and 10000.");
            }


            if (
                dto.Notes is not null
                &&
                dto.Notes.Trim().Length > 250)
            {
                throw new ArgumentException(
                    "Notes cannot exceed 250 characters.");
            }


            var notes =
                string.IsNullOrWhiteSpace(
                    dto.Notes)
                    ? null
                    : dto.Notes.Trim();


            /*
             * Quantity decrease
             * + Stock Transaction
             * + Notification
             *
             * must all succeed or rollback.
             */

            await using var dbTransaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                /* =================================
                   Read Current Car
                ================================= */

                var carBefore =
                    await _context.Cars
                        .AsNoTracking()
                        .FirstOrDefaultAsync(
                            car =>
                                car.Id ==
                                    carId
                                &&
                                car.IsActive);


                if (
                    carBefore is null)
                {
                    throw new KeyNotFoundException(
                        "Car not found.");
                }


                if (
                    dto.Quantity >
                    carBefore.Quantity)
                {
                    throw new InvalidOperationException(
                        "Insufficient stock.");
                }


                var expectedQuantity =
                    carBefore.Quantity;


                var expectedAverageUnitCost =
                    carBefore.AverageUnitCost;


                /* =================================
                   Atomic Stock Decrease
                ================================= */

                var affectedRows =
                    await _context.Cars
                        .Where(
                            car =>
                                car.Id ==
                                    carId
                                &&
                                car.IsActive
                                &&
                                car.Quantity ==
                                    expectedQuantity
                                &&
                                car.Quantity >=
                                    dto.Quantity
                                &&
                                car.AverageUnitCost ==
                                    expectedAverageUnitCost)
                        .ExecuteUpdateAsync(
                            setters =>
                                setters.SetProperty(
                                    car =>
                                        car.Quantity,

                                    car =>
                                        car.Quantity
                                        -
                                        dto.Quantity));


                if (
                    affectedRows != 1)
                {
                    throw new InvalidOperationException(
                        "Stock or inventory cost changed while processing the operation. " +
                        "Please refresh the inventory and try again.");
                }


                /* =================================
                   Read Updated Stock
                ================================= */

                var carAfter =
                    await _context.Cars
                        .AsNoTracking()
                        .FirstAsync(
                            car =>
                                car.Id ==
                                    carId);


                var beforeQuantity =
                    carAfter.Quantity
                    +
                    dto.Quantity;


                /* =================================
                   Stock Transaction
                ================================= */

                decimal? outgoingUnitCost =
                    carBefore.AverageUnitCost
                        .HasValue
                        ? decimal.Round(
                            carBefore.AverageUnitCost.Value,
                            2,
                            MidpointRounding.AwayFromZero)
                        : null;


                decimal? outgoingInventoryValue =
                    outgoingUnitCost.HasValue
                        ? decimal.Round(
                            outgoingUnitCost.Value
                            *
                            dto.Quantity,
                            2,
                            MidpointRounding.AwayFromZero)
                        : null;


                var stockTransaction =
                    new StockTransaction
                    {
                        CarId =
                            carAfter.Id,

                        TransactionType =
                            "Stock Out",

                        Quantity =
                            dto.Quantity,

                        TransactionDate =
                            DateTime.UtcNow,

                        UnitCost =
                            outgoingUnitCost,

                        InventoryValue =
                            outgoingInventoryValue,

                        SourceType =
                            "Manual",

                        SourceId =
                            null,

                        Notes =
                            notes
                    };


                _context.StockTransactions
                    .Add(
                        stockTransaction);


                await _context
                    .SaveChangesAsync();


                /* =================================
                   Out Of Stock Notification
                ================================= */

                if (
                    beforeQuantity > 0
                    &&
                    carAfter.Quantity == 0)
                {
                    await _notificationService
                        .CreateAsync(
                            NotificationType
                                .OutOfStock,

                            "Out of Stock",

                            $"{carAfter.Model} is now out of stock.",

                            "Car",

                            carAfter.Id
                                .ToString());
                }


                /* =================================
                   Low Stock Notification
                ================================= */

                else if (
                    beforeQuantity >
                        carAfter.ReorderLevel
                    &&
                    carAfter.Quantity <=
                        carAfter.ReorderLevel
                    &&
                    carAfter.Quantity > 0)
                {
                    await _notificationService
                        .CreateAsync(
                            NotificationType
                                .LowStock,

                            "Low Stock Alert",

                            $"{carAfter.Model} stock has reached " +
                            $"{carAfter.Quantity} unit(s). " +
                            $"Reorder level: {carAfter.ReorderLevel}.",

                            "Car",

                            carAfter.Id
                                .ToString());
                }


                /* =================================
                   Commit
                ================================= */

                await dbTransaction
                    .CommitAsync();


                return new StockTransactionDto
                {
                    Id =
                        stockTransaction.Id,

                    CarId =
                        carAfter.Id,

                    CarModel =
                        carAfter.Model,

                    TransactionType =
                        stockTransaction.TransactionType,

                    Quantity =
                        stockTransaction.Quantity,

                    TransactionDate =
                        stockTransaction.TransactionDate,

                    UnitCost =
                        stockTransaction.UnitCost,

                    InventoryValue =
                        stockTransaction.InventoryValue,

                    SourceType =
                        stockTransaction.SourceType,

                    SourceId =
                        stockTransaction.SourceId,

                    Notes =
                        stockTransaction.Notes
                };
            }
            catch
            {
                await dbTransaction
                    .RollbackAsync();

                throw;
            }
        }


        /* =========================================
           Stock History
        ========================================= */

        public async Task<
            PagedResult<StockTransactionDto>>
            GetHistoryAsync(
                int? carId = null,
                string? transactionType = null,
                DateTime? startDate = null,
                DateTime? endDate = null,
                int page = 1,
                int pageSize = 10)
        {
            var query =
                _context
                    .StockTransactions
                    .AsNoTracking()
                    .AsQueryable();


            if (
                carId.HasValue)
            {
                query =
                    query.Where(
                        transaction =>
                            transaction.CarId ==
                            carId.Value);
            }


            if (
                !string.IsNullOrWhiteSpace(
                    transactionType))
            {
                query =
                    query.Where(
                        transaction =>
                            transaction.TransactionType ==
                            transactionType);
            }


            if (
                startDate.HasValue)
            {
                query =
                    query.Where(
                        transaction =>
                            transaction.TransactionDate >=
                            startDate.Value);
            }


            if (
                endDate.HasValue)
            {
                var inclusiveEndDate =
                    endDate.Value.Date
                        .AddDays(1);


                query =
                    query.Where(
                        transaction =>
                            transaction.TransactionDate <
                            inclusiveEndDate);
            }


            var totalCount =
                await query
                    .CountAsync();


            var totalPages =
                (int)Math.Ceiling(
                    totalCount /
                    (double)pageSize);


            var items =
                await query
                    .OrderByDescending(
                        transaction =>
                            transaction.TransactionDate)
                    .Skip(
                        (page - 1) *
                        pageSize)
                    .Take(
                        pageSize)
                    .Select(
                        transaction =>
                            new StockTransactionDto
                            {
                                Id =
                                    transaction.Id,

                                CarId =
                                    transaction.CarId,

                                CarModel =
                                    transaction.Car!.Model,

                                TransactionType =
                                    transaction.TransactionType,

                                Quantity =
                                    transaction.Quantity,

                                TransactionDate =
                                    transaction.TransactionDate,

                                UnitCost =
                                    transaction.UnitCost,

                                InventoryValue =
                                    transaction.InventoryValue,

                                SourceType =
                                    transaction.SourceType,

                                SourceId =
                                    transaction.SourceId,

                                Notes =
                                    transaction.Notes
                            })
                    .ToListAsync();


            return new PagedResult<
                StockTransactionDto>
            {
                Items =
                    items,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalCount =
                    totalCount,

                TotalPages =
                    totalPages
            };
        }
    }
}
using AutoStock.Application.DTOs.Sales;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class SaleService : ISaleService
{
    private readonly AppDbContext _context;

    private readonly IAuditLogService
        _auditLogService;

    private readonly INotificationService
        _notificationService;


    public SaleService(
        AppDbContext context,
        IAuditLogService auditLogService,
        INotificationService notificationService)
    {
        _context =
            context;

        _auditLogService =
            auditLogService;

        _notificationService =
            notificationService;
    }


    /* =========================================
       Get All Sales
    ========================================= */

    public async Task<IReadOnlyList<SaleDto>>
        GetAllAsync()
    {
        var sales =
            await _context.Sales
                .AsNoTracking()
                .OrderByDescending(
                    sale =>
                        sale.SaleDate)
                .Select(
                    sale =>
                        new SaleDto
                        {
                            Id =
                                sale.Id,

                            CustomerId =
                                sale.CustomerId,

                            CustomerName =
                                sale.Customer != null
                                    ? sale.Customer.FullName
                                    : string.Empty,

                            SaleDate =
                                sale.SaleDate,

                            PaymentMethod =
                                sale.PaymentMethod,

                            TotalAmount =
                                sale.TotalAmount,

                            Notes =
                                sale.Notes,

                            Items =
                                sale.SaleItems
                                    .Select(
                                        item =>
                                            new SaleItemDto
                                            {
                                                Id =
                                                    item.Id,

                                                CarId =
                                                    item.CarId,

                                                CarName =
                                                    item.Car != null
                                                        ? item.Car.Model
                                                        : string.Empty,

                                                Quantity =
                                                    item.Quantity,

                                                UnitPrice =
                                                    item.UnitPrice,

                                                LineTotal =
                                                    item.LineTotal,

                                                UnitCost =
                                                    item.UnitCost,

                                                CostOfGoodsSold =
                                                    item.CostOfGoodsSold,

                                                GrossProfit =
                                                    item.GrossProfit
                                            })
                                    .ToList()
                        })
                .ToListAsync();


        foreach (
            var sale in sales)
        {
            ApplyFinancialSummary(
                sale);
        }


        return sales;
    }


    /* =========================================
       Get Sale By Id
    ========================================= */

    public async Task<SaleDto?>
        GetByIdAsync(
            int id)
    {
        var sale =
            await _context.Sales
                .AsNoTracking()
                .Where(
                    sale =>
                        sale.Id == id)
                .Select(
                    sale =>
                        new SaleDto
                        {
                            Id =
                                sale.Id,

                            CustomerId =
                                sale.CustomerId,

                            CustomerName =
                                sale.Customer != null
                                    ? sale.Customer.FullName
                                    : string.Empty,

                            SaleDate =
                                sale.SaleDate,

                            PaymentMethod =
                                sale.PaymentMethod,

                            TotalAmount =
                                sale.TotalAmount,

                            Notes =
                                sale.Notes,

                            Items =
                                sale.SaleItems
                                    .Select(
                                        item =>
                                            new SaleItemDto
                                            {
                                                Id =
                                                    item.Id,

                                                CarId =
                                                    item.CarId,

                                                CarName =
                                                    item.Car != null
                                                        ? item.Car.Model
                                                        : string.Empty,

                                                Quantity =
                                                    item.Quantity,

                                                UnitPrice =
                                                    item.UnitPrice,

                                                LineTotal =
                                                    item.LineTotal,

                                                UnitCost =
                                                    item.UnitCost,

                                                CostOfGoodsSold =
                                                    item.CostOfGoodsSold,

                                                GrossProfit =
                                                    item.GrossProfit
                                            })
                                    .ToList()
                        })
                .FirstOrDefaultAsync();


        if (
            sale is null)
        {
            return null;
        }


        ApplyFinancialSummary(
            sale);


        return sale;
    }


    /* =========================================
       Create Sale
    ========================================= */

    public async Task<SaleDto>
        CreateAsync(
            CreateSaleDto dto)
    {
        /* =====================================
           Basic Validation
        ===================================== */

        if (
            dto.CustomerId <= 0
        )
        {
            throw new ArgumentException(
                "A valid customer is required.");
        }


        if (
            dto.Items is null ||
            dto.Items.Count == 0
        )
        {
            throw new ArgumentException(
                "The sale must contain at least one item.");
        }


        var duplicatedCarIds =
            dto.Items
                .GroupBy(
                    item =>
                        item.CarId)
                .Where(
                    group =>
                        group.Count() > 1)
                .Select(
                    group =>
                        group.Key)
                .ToList();


        if (
            duplicatedCarIds.Count > 0
        )
        {
            throw new ArgumentException(
                "The same car cannot be added more than once to a sale.");
        }


        foreach (
            var item in dto.Items)
        {
            if (
                item.CarId <= 0
            )
            {
                throw new ArgumentException(
                    "A valid car is required.");
            }


            if (
                item.Quantity <= 0
            )
            {
                throw new ArgumentException(
                    "Sale quantity must be greater than zero.");
            }


            if (
                item.UnitPrice <= 0
            )
            {
                throw new ArgumentException(
                    "Unit price must be greater than zero.");
            }
        }


        /* =====================================
           Database Transaction
        ===================================== */

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            /* =================================
               Customer
            ================================= */

            var customer =
                await _context.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        customer =>
                            customer.Id ==
                            dto.CustomerId);


            if (
                customer is null
            )
            {
                throw new InvalidOperationException(
                    "Customer not found.");
            }


            /* =================================
               Load Current Car Snapshot
            ================================= */

            var carIds =
                dto.Items
                    .Select(
                        item =>
                            item.CarId)
                    .Distinct()
                    .ToList();


            var cars =
                await _context.Cars
                    .AsNoTracking()
                    .Where(
                        car =>
                            carIds.Contains(
                                car.Id))
                    .ToListAsync();


            if (
                cars.Count !=
                carIds.Count
            )
            {
                throw new InvalidOperationException(
                    "One or more cars were not found.");
            }


            /* =================================
               Validate Cars + Stock
            ================================= */

            foreach (
                var item in dto.Items)
            {
                var car =
                    cars.First(
                        car =>
                            car.Id ==
                            item.CarId);


                if (
                    !car.IsActive
                )
                {
                    throw new InvalidOperationException(
                        $"{car.Model} is archived and cannot be sold.");
                }


                if (
                    car.Quantity <
                    item.Quantity
                )
                {
                    throw new InvalidOperationException(
                        $"Not enough stock for {car.Model}. " +
                        $"Available: {car.Quantity}, " +
                        $"Requested: {item.Quantity}.");
                }
            }


            /* =================================
               Create Sale
            ================================= */

            var sale =
                new Sale
                {
                    CustomerId =
                        customer.Id,

                    SaleDate =
                        DateTime.UtcNow,

                    PaymentMethod =
                        dto.PaymentMethod,

                    Notes =
                        string.IsNullOrWhiteSpace(
                            dto.Notes)
                            ? null
                            : dto.Notes.Trim()
                };


            decimal totalAmount =
                0m;


            /* =================================
               Create Sale Items
               +
               Cost Accounting Snapshot
            ================================= */

            foreach (
                var itemDto in dto.Items)
            {
                var car =
                    cars.First(
                        car =>
                            car.Id ==
                            itemDto.CarId);


                /* -----------------------------
                   Selling Price
                ----------------------------- */

                var unitPrice =
                    decimal.Round(
                        itemDto.UnitPrice,
                        2,
                        MidpointRounding
                            .AwayFromZero);


                var lineTotal =
                    decimal.Round(
                        unitPrice *
                        itemDto.Quantity,
                        2,
                        MidpointRounding
                            .AwayFromZero);


                /* -----------------------------
                   Inventory Cost Snapshot
                ----------------------------- */

                decimal? unitCost =
                    car.AverageUnitCost
                        .HasValue
                        ? decimal.Round(
                            car.AverageUnitCost
                                .Value,
                            2,
                            MidpointRounding
                                .AwayFromZero)
                        : null;


                /* -----------------------------
                   Cost Of Goods Sold
                ----------------------------- */

                decimal? costOfGoodsSold =
                    unitCost.HasValue
                        ? decimal.Round(
                            unitCost.Value *
                            itemDto.Quantity,
                            2,
                            MidpointRounding
                                .AwayFromZero)
                        : null;


                /* -----------------------------
                   Gross Profit
                ----------------------------- */

                decimal? grossProfit =
                    costOfGoodsSold
                        .HasValue
                        ? decimal.Round(
                            lineTotal -
                            costOfGoodsSold.Value,
                            2,
                            MidpointRounding
                                .AwayFromZero)
                        : null;


                var saleItem =
                    new SaleItem
                    {
                        CarId =
                            itemDto.CarId,

                        Quantity =
                            itemDto.Quantity,

                        UnitPrice =
                            unitPrice,

                        LineTotal =
                            lineTotal,

                        UnitCost =
                            unitCost,

                        CostOfGoodsSold =
                            costOfGoodsSold,

                        GrossProfit =
                            grossProfit
                    };


                sale.SaleItems.Add(
                    saleItem);


                totalAmount +=
                    lineTotal;
            }


            sale.TotalAmount =
                decimal.Round(
                    totalAmount,
                    2,
                    MidpointRounding
                        .AwayFromZero);


            _context.Sales.Add(
                sale);


            /* =================================
               Atomic Stock Decrease
            ================================= */

            foreach (
                var itemDto in dto.Items)
            {
                var carSnapshot =
                    cars.First(
                        car =>
                            car.Id ==
                            itemDto.CarId);


                var expectedQuantity =
                    carSnapshot.Quantity;


                var expectedAverageUnitCost =
                    carSnapshot.AverageUnitCost;


                /*
                 * Protect against:
                 *
                 * - Concurrent Sale
                 * - Concurrent Stock Out
                 * - Concurrent Purchase Receive
                 * - AverageUnitCost changing
                 *
                 * We only deduct stock if both
                 * Quantity and Cost are still
                 * exactly what we used to calculate
                 * the SaleItem cost snapshot.
                 */

                var affectedRows =
                    await _context.Cars
                        .Where(
                            car =>
                                car.Id ==
                                    itemDto.CarId
                                &&
                                car.IsActive
                                &&
                                car.Quantity ==
                                    expectedQuantity
                                &&
                                car.Quantity >=
                                    itemDto.Quantity
                                &&
                                car.AverageUnitCost ==
                                    expectedAverageUnitCost)
                        .ExecuteUpdateAsync(
                            setters =>
                                setters.SetProperty(
                                    car =>
                                        car.Quantity,

                                    car =>
                                        car.Quantity -
                                        itemDto.Quantity));


                if (
                    affectedRows != 1
                )
                {
                    throw new InvalidOperationException(
                        "Stock changed or inventory cost changed while completing the sale. " +
                        "Please refresh the inventory and try again.");
                }
            }


            /*
             * Save Sale + SaleItems.
             *
             * Car quantities were already changed
             * atomically by ExecuteUpdateAsync.
             *
             * Everything is still protected by the
             * same database transaction.
             */

            await _context
                .SaveChangesAsync();


            /* =================================
               Stock Transactions
            ================================= */

            foreach (
                var itemDto in dto.Items)
            {
                /*
                 * SaleItem already contains the
                 * immutable historical cost snapshot.
                 *
                 * Use that snapshot here instead of
                 * reading Car.AverageUnitCost again.
                 */

                var saleItem =
                    sale.SaleItems
                        .First(
                            item =>
                                item.CarId ==
                                itemDto.CarId);


                var stockTransaction =
                    new StockTransaction
                    {
                        CarId =
                            itemDto.CarId,

                        TransactionType =
                            "Stock Out",

                        Quantity =
                            itemDto.Quantity,

                        TransactionDate =
                            sale.SaleDate,

                        UnitCost =
                            saleItem.UnitCost,

                        InventoryValue =
                            saleItem.CostOfGoodsSold,

                        SourceType =
                            "Sale",

                        SourceId =
                            sale.Id,

                        Notes =
                            $"Automatic stock out from Sale #{sale.Id}"
                    };


                _context.StockTransactions.Add(
                    stockTransaction);
            }


            await _context
                .SaveChangesAsync();


            /* =================================
               Reload Updated Stock
            ================================= */

            var updatedCars =
                await _context.Cars
                    .AsNoTracking()
                    .Where(
                        car =>
                            carIds.Contains(
                                car.Id))
                    .ToListAsync();


            /* =================================
               Sale Completed Notification
            ================================= */

            await _notificationService
                .CreateAsync(
                    NotificationType.SaleCompleted,
                    "Sale Completed",
                    $"Sale #{sale.Id} was completed successfully. " +
                    $"Total: {sale.TotalAmount:0.00} EGP.",
                    "Sale",
                    sale.Id.ToString());


            /* =================================
               Stock Notifications
            ================================= */

            foreach (
                var itemDto in dto.Items)
            {
                var beforeCar =
                    cars.First(
                        car =>
                            car.Id ==
                            itemDto.CarId);


                var afterCar =
                    updatedCars.First(
                        car =>
                            car.Id ==
                            itemDto.CarId);


                /*
                 * Out Of Stock
                 *
                 * Notify only when stock
                 * transitions from positive
                 * quantity to zero.
                 */

                if (
                    beforeCar.Quantity > 0
                    &&
                    afterCar.Quantity == 0
                )
                {
                    await _notificationService
                        .CreateAsync(
                            NotificationType.OutOfStock,
                            "Out of Stock",
                            $"{afterCar.Model} is now out of stock.",
                            "Car",
                            afterCar.Id.ToString());
                }


                /*
                 * Low Stock
                 *
                 * Notify only when stock crosses
                 * the reorder threshold.
                 *
                 * Example:
                 *
                 * Before = 4
                 * Reorder = 3
                 * After = 3
                 *
                 * Notification ✅
                 */

                else if (
                    beforeCar.Quantity >
                        beforeCar.ReorderLevel
                    &&
                    afterCar.Quantity <=
                        afterCar.ReorderLevel
                    &&
                    afterCar.Quantity > 0
                )
                {
                    await _notificationService
                        .CreateAsync(
                            NotificationType.LowStock,
                            "Low Stock Alert",
                            $"{afterCar.Model} stock has reached " +
                            $"{afterCar.Quantity} unit(s). " +
                            $"Reorder level: {afterCar.ReorderLevel}.",
                            "Car",
                            afterCar.Id.ToString());
                }
            }


            /* =================================
               Audit Log
            ================================= */

            await _auditLogService
                .LogAsync(
                    "Create",
                    "Sale",
                    sale.Id.ToString(),
                    $"Sale #{sale.Id} completed. " +
                    $"Items: {sale.SaleItems.Count}, " +
                    $"Total: {sale.TotalAmount:0.00} EGP.");


            /* =================================
               Get Created Sale
            ================================= */

            var createdSale =
                await GetByIdAsync(
                    sale.Id);


            if (
                createdSale is null
            )
            {
                throw new InvalidOperationException(
                    "Sale was created but could not be retrieved.");
            }


            /* =================================
               Commit
            ================================= */

            await transaction
                .CommitAsync();


            return createdSale;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }

    private static void
    ApplyFinancialSummary(
        SaleDto sale)
    {
        /* =====================================
           Item Margin
        ===================================== */

        foreach (
            var item in sale.Items)
        {
            if (
                item.GrossProfit.HasValue
                &&
                item.LineTotal > 0m)
            {
                item.GrossMarginPercent =
                    decimal.Round(
                        item.GrossProfit.Value
                        /
                        item.LineTotal
                        *
                        100m,
                        2,
                        MidpointRounding
                            .AwayFromZero);
            }
            else
            {
                item.GrossMarginPercent =
                    null;
            }
        }


        /* =====================================
           Covered Items
        ===================================== */

        var knownCostItems =
            sale.Items
                .Where(
                    item =>
                        item.CostOfGoodsSold
                            .HasValue
                        &&
                        item.GrossProfit
                            .HasValue)
                .ToList();


        sale.RevenueWithKnownCost =
            knownCostItems
                .Sum(
                    item =>
                        item.LineTotal);


        sale.RevenueWithUnknownCost =
            sale.TotalAmount
            -
            sale.RevenueWithKnownCost;


        sale.TotalCogs =
            knownCostItems
                .Sum(
                    item =>
                        item.CostOfGoodsSold
                        ?? 0m);


        sale.GrossProfit =
            knownCostItems
                .Sum(
                    item =>
                        item.GrossProfit
                        ?? 0m);


        /* =====================================
           Gross Margin
        ===================================== */

        sale.GrossMarginPercent =
            sale.RevenueWithKnownCost > 0m
                ? decimal.Round(
                    sale.GrossProfit
                    /
                    sale.RevenueWithKnownCost
                    *
                    100m,
                    2,
                    MidpointRounding
                        .AwayFromZero)
                : 0m;


        /* =====================================
           Cost Coverage
        ===================================== */

        sale.CostCoveragePercent =
            sale.TotalAmount > 0m
                ? decimal.Round(
                    sale.RevenueWithKnownCost
                    /
                    sale.TotalAmount
                    *
                    100m,
                    2,
                    MidpointRounding
                        .AwayFromZero)
                : 0m;
    }
}
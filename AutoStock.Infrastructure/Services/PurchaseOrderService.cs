using AutoStock.Application.DTOs.PurchaseOrders;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class PurchaseOrderService
    : IPurchaseOrderService
{
    private readonly AppDbContext _context;

    private readonly IAuditLogService
        _auditLogService;

    private readonly INotificationService
        _notificationService;


    public PurchaseOrderService(
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
       Get All
    ========================================= */

    public async Task<IReadOnlyList<PurchaseOrderDto>>
        GetAllAsync()
    {
        return await _context.PurchaseOrders
            .AsNoTracking()
            .OrderByDescending(
                order =>
                    order.OrderDate)
            .ThenByDescending(
                order =>
                    order.Id)
            .Select(
                order =>
                    new PurchaseOrderDto
                    {
                        Id =
                            order.Id,

                        SupplierId =
                            order.SupplierId,

                        SupplierName =
                            order.Supplier != null
                                ? order.Supplier.Name
                                : string.Empty,

                        OrderDate =
                            order.OrderDate,

                        Status =
                            order.Status,

                        TotalAmount =
                            order.TotalAmount,

                        Notes =
                            order.Notes,

                        ReceivedAt =
                            order.ReceivedAt,

                        Items =
                            order.Items
                                .Select(
                                    item =>
                                        new PurchaseOrderItemDto
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

                                            UnitCost =
                                                item.UnitCost,

                                            LineTotal =
                                                item.LineTotal
                                        })
                                .ToList()
                    })
            .ToListAsync();
    }


    /* =========================================
       Get By Id
    ========================================= */

    public async Task<PurchaseOrderDto?>
        GetByIdAsync(
            int id)
    {
        return await _context.PurchaseOrders
            .AsNoTracking()
            .Where(
                order =>
                    order.Id == id)
            .Select(
                order =>
                    new PurchaseOrderDto
                    {
                        Id =
                            order.Id,

                        SupplierId =
                            order.SupplierId,

                        SupplierName =
                            order.Supplier != null
                                ? order.Supplier.Name
                                : string.Empty,

                        OrderDate =
                            order.OrderDate,

                        Status =
                            order.Status,

                        TotalAmount =
                            order.TotalAmount,

                        Notes =
                            order.Notes,

                        ReceivedAt =
                            order.ReceivedAt,

                        Items =
                            order.Items
                                .Select(
                                    item =>
                                        new PurchaseOrderItemDto
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

                                            UnitCost =
                                                item.UnitCost,

                                            LineTotal =
                                                item.LineTotal
                                        })
                                .ToList()
                    })
            .FirstOrDefaultAsync();
    }


    /* =========================================
       Supplier Purchase History
    ========================================= */

    public async Task<SupplierPurchaseHistoryDto?>
        GetSupplierHistoryAsync(
            int supplierId)
    {
        var supplier =
            await _context.Suppliers
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    supplier =>
                        supplier.Id ==
                        supplierId);


        if (supplier is null)
        {
            return null;
        }


        var orders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .Where(
                    order =>
                        order.SupplierId ==
                        supplierId)
                .OrderByDescending(
                    order =>
                        order.OrderDate)
                .ThenByDescending(
                    order =>
                        order.Id)
                .Select(
                    order =>
                        new PurchaseOrderDto
                        {
                            Id =
                                order.Id,

                            SupplierId =
                                order.SupplierId,

                            SupplierName =
                                order.Supplier != null
                                    ? order.Supplier.Name
                                    : string.Empty,

                            OrderDate =
                                order.OrderDate,

                            Status =
                                order.Status,

                            TotalAmount =
                                order.TotalAmount,

                            Notes =
                                order.Notes,

                            ReceivedAt =
                                order.ReceivedAt,

                            Items =
                                order.Items
                                    .Select(
                                        item =>
                                            new PurchaseOrderItemDto
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

                                                UnitCost =
                                                    item.UnitCost,

                                                LineTotal =
                                                    item.LineTotal
                                            })
                                    .ToList()
                        })
                .ToListAsync();


        var receivedOrders =
            orders
                .Where(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus
                            .Received)
                .ToList();


        var totalReceivedUnits =
            receivedOrders
                .SelectMany(
                    order =>
                        order.Items)
                .Sum(
                    item =>
                        item.Quantity);


        var totalReceivedValue =
            receivedOrders
                .Sum(
                    order =>
                        order.TotalAmount);


        return new SupplierPurchaseHistoryDto
        {
            SupplierId =
                supplier.Id,

            SupplierName =
                supplier.Name,

            TotalOrders =
                orders.Count,

            DraftOrders =
                orders.Count(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus
                            .Draft),

            SubmittedOrders =
                orders.Count(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus
                            .Submitted),

            ReceivedOrders =
                orders.Count(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus
                            .Received),

            CancelledOrders =
                orders.Count(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus
                            .Cancelled),

            TotalReceivedUnits =
                totalReceivedUnits,

            TotalReceivedValue =
                totalReceivedValue,

            Orders =
                orders
        };
    }


    /* =========================================
       Create
    ========================================= */

    public async Task<PurchaseOrderDto>
        CreateAsync(
            CreatePurchaseOrderDto dto)
    {
        if (
            dto.Items is null ||
            dto.Items.Count == 0
        )
        {
            throw new ArgumentException(
                "Purchase order must contain at least one item.");
        }


        var duplicateCarExists =
            dto.Items
                .GroupBy(
                    item =>
                        item.CarId)
                .Any(
                    group =>
                        group.Count() > 1);


        if (duplicateCarExists)
        {
            throw new ArgumentException(
                "The same car cannot appear more than once in a purchase order.");
        }


        var supplier =
            await _context.Suppliers
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    supplier =>
                        supplier.Id ==
                        dto.SupplierId);


        if (supplier is null)
        {
            throw new KeyNotFoundException(
                "Supplier not found.");
        }


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
            throw new KeyNotFoundException(
                "One or more cars were not found.");
        }


        foreach (
            var item in dto.Items)
        {
            if (
                item.Quantity <= 0
            )
            {
                throw new ArgumentException(
                    "Purchase quantity must be greater than zero.");
            }


            if (
                item.UnitCost <= 0
            )
            {
                throw new ArgumentException(
                    "Unit cost must be greater than zero.");
            }


            var car =
                cars.First(
                    car =>
                        car.Id ==
                        item.CarId);


            if (!car.IsActive)
            {
                throw new InvalidOperationException(
                    $"{car.Model} is inactive.");
            }


            /*
             * Current AutoStock model gives each
             * Car one SupplierId.
             *
             * Therefore all cars in this PO must
             * belong to the selected supplier.
             */

            if (
                car.SupplierId !=
                dto.SupplierId
            )
            {
                throw new InvalidOperationException(
                    $"{car.Model} does not belong to the selected supplier.");
            }
        }


        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            var order =
                new PurchaseOrder
                {
                    SupplierId =
                        supplier.Id,

                    OrderDate =
                        DateTime.UtcNow,

                    Status =
                        PurchaseOrderStatus.Draft,

                    Notes =
                        string.IsNullOrWhiteSpace(
                            dto.Notes)
                            ? null
                            : dto.Notes.Trim()
                };


            decimal totalAmount =
                0m;


            foreach (
                var itemDto in dto.Items)
            {
                var unitCost =
                    decimal.Round(
                        itemDto.UnitCost,
                        2,
                        MidpointRounding.AwayFromZero);


                var lineTotal =
                    decimal.Round(
                        unitCost *
                        itemDto.Quantity,
                        2,
                        MidpointRounding.AwayFromZero);


                order.Items.Add(
                    new PurchaseOrderItem
                    {
                        CarId =
                            itemDto.CarId,

                        Quantity =
                            itemDto.Quantity,

                        UnitCost =
                            unitCost,

                        LineTotal =
                            lineTotal
                    });


                totalAmount +=
                    lineTotal;
            }


            order.TotalAmount =
                decimal.Round(
                    totalAmount,
                    2,
                    MidpointRounding.AwayFromZero);


            _context.PurchaseOrders
                .Add(
                    order);


            await _context
                .SaveChangesAsync();


            await _auditLogService
                .LogAsync(
                    "Create",
                    "PurchaseOrder",
                    order.Id.ToString(),
                    $"Purchase Order #{order.Id} created. " +
                    $"Supplier: {supplier.Name}. " +
                    $"Items: {order.Items.Count}. " +
                    $"Total: {order.TotalAmount:0.00} EGP.");


            var createdOrder =
                await GetByIdAsync(
                    order.Id);


            if (createdOrder is null)
            {
                throw new InvalidOperationException(
                    "Purchase order was created but could not be retrieved.");
            }


            await transaction
                .CommitAsync();


            return createdOrder;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }


    /* =========================================
       Submit
    ========================================= */

    public async Task<bool>
        SubmitAsync(
            int id)
    {
        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            var affectedRows =
                await _context.PurchaseOrders
                    .Where(
                        order =>
                            order.Id == id
                            &&
                            order.Status ==
                            PurchaseOrderStatus.Draft)
                    .ExecuteUpdateAsync(
                        setters =>
                            setters.SetProperty(
                                order =>
                                    order.Status,

                                PurchaseOrderStatus
                                    .Submitted));


            if (
                affectedRows == 0
            )
            {
                var exists =
                    await _context.PurchaseOrders
                        .AsNoTracking()
                        .AnyAsync(
                            order =>
                                order.Id == id);


                if (!exists)
                {
                    return false;
                }


                throw new InvalidOperationException(
                    "Only draft purchase orders can be submitted.");
            }


            await _auditLogService
                .LogAsync(
                    "Submit",
                    "PurchaseOrder",
                    id.ToString(),
                    $"Purchase Order #{id} submitted.");


            await transaction
                .CommitAsync();


            return true;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }


    /* =========================================
       Cancel
    ========================================= */

    public async Task<bool>
        CancelAsync(
            int id)
    {
        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            var affectedRows =
                await _context.PurchaseOrders
                    .Where(
                        order =>
                            order.Id == id
                            &&
                            (
                                order.Status ==
                                    PurchaseOrderStatus.Draft
                                ||
                                order.Status ==
                                    PurchaseOrderStatus.Submitted
                            ))
                    .ExecuteUpdateAsync(
                        setters =>
                            setters.SetProperty(
                                order =>
                                    order.Status,

                                PurchaseOrderStatus
                                    .Cancelled));


            if (
                affectedRows == 0
            )
            {
                var exists =
                    await _context.PurchaseOrders
                        .AsNoTracking()
                        .AnyAsync(
                            order =>
                                order.Id == id);


                if (!exists)
                {
                    return false;
                }


                throw new InvalidOperationException(
                    "Received or cancelled purchase orders cannot be cancelled.");
            }


            await _auditLogService
                .LogAsync(
                    "Cancel",
                    "PurchaseOrder",
                    id.ToString(),
                    $"Purchase Order #{id} cancelled.");


            await transaction
                .CommitAsync();


            return true;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }


    /* =========================================
       Receive
    ========================================= */

    public async Task<bool>
        ReceiveAsync(
            int id)
    {
        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            /*
             * Read purchase order and its items.
             */

            var order =
                await _context.PurchaseOrders
                    .AsNoTracking()
                    .Include(
                        purchaseOrder =>
                            purchaseOrder.Items)
                    .FirstOrDefaultAsync(
                        purchaseOrder =>
                            purchaseOrder.Id ==
                            id);


            if (order is null)
            {
                return false;
            }


            if (
                order.Status !=
                PurchaseOrderStatus.Submitted
            )
            {
                throw new InvalidOperationException(
                    "Only submitted purchase orders can be received.");
            }


            /*
             * Atomically claim this purchase order.
             *
             * If two requests try to receive
             * the same PO concurrently, only
             * one request can successfully change:
             *
             * Submitted -> Received
             */

            var receivedAt =
                DateTime.UtcNow;


            var affectedRows =
                await _context.PurchaseOrders
                    .Where(
                        purchaseOrder =>
                            purchaseOrder.Id ==
                                id
                            &&
                            purchaseOrder.Status ==
                                PurchaseOrderStatus.Submitted)
                    .ExecuteUpdateAsync(
                        setters =>
                            setters
                                .SetProperty(
                                    purchaseOrder =>
                                        purchaseOrder.Status,

                                    PurchaseOrderStatus
                                        .Received)

                                .SetProperty(
                                    purchaseOrder =>
                                        purchaseOrder.ReceivedAt,

                                    receivedAt));


            if (
                affectedRows != 1
            )
            {
                throw new InvalidOperationException(
                    "Purchase order status changed while receiving it. " +
                    "Please refresh and try again.");
            }


            /*
             * Load current inventory state.
             */

            var carIds =
                order.Items
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
                    "One or more purchase order cars no longer exist.");
            }


            /* =========================================
               Receive Items
            ========================================= */

            foreach (
                var item in order.Items)
            {
                var currentCar =
                    cars.First(
                        car =>
                            car.Id ==
                            item.CarId);


                if (!currentCar.IsActive)
                {
                    throw new InvalidOperationException(
                        $"{currentCar.Model} is inactive and cannot receive stock.");
                }


                var expectedQuantity =
                    currentCar.Quantity;


                var expectedAverageUnitCost =
                    currentCar.AverageUnitCost;


                var incomingUnitCost =
                    decimal.Round(
                        item.UnitCost,
                        2,
                        MidpointRounding.AwayFromZero);


                /*
                 * =====================================
                 * Weighted Average Cost
                 * =====================================
                 */

                decimal? newAverageUnitCost;


                /*
                 * No existing inventory:
                 * incoming cost starts a clean basis.
                 */

                if (
                    expectedQuantity <= 0
                )
                {
                    newAverageUnitCost =
                        incomingUnitCost;
                }


                /*
                 * Existing inventory has a known
                 * historical cost basis.
                 */

                else if (
                    expectedAverageUnitCost.HasValue
                )
                {
                    var existingInventoryCost =
                        decimal.Round(
                            expectedQuantity
                            *
                            expectedAverageUnitCost.Value,
                            2,
                            MidpointRounding.AwayFromZero);


                    var incomingInventoryCost =
                        decimal.Round(
                            item.Quantity
                            *
                            incomingUnitCost,
                            2,
                            MidpointRounding.AwayFromZero);


                    var newQuantity =
                        expectedQuantity
                        +
                        item.Quantity;


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
                            MidpointRounding.AwayFromZero);
                }


                /*
                 * Legacy inventory exists but its
                 * original cost is unknown.
                 *
                 * Do not invent a weighted average.
                 */

                else
                {
                    newAverageUnitCost =
                        null;
                }


                /*
                 * Atomic inventory update.
                 *
                 * Guard BOTH Quantity and AverageUnitCost.
                 * This protects the exact snapshot used
                 * by the weighted-average calculation.
                 */

                var stockUpdated =
                    await _context.Cars
                        .Where(
                            storedCar =>
                                storedCar.Id ==
                                    item.CarId
                                &&
                                storedCar.IsActive
                                &&
                                storedCar.Quantity ==
                                    expectedQuantity
                                &&
                                storedCar.AverageUnitCost ==
                                    expectedAverageUnitCost)
                        .ExecuteUpdateAsync(
                            setters =>
                                setters
                                    .SetProperty(
                                        storedCar =>
                                            storedCar.Quantity,

                                        storedCar =>
                                            storedCar.Quantity
                                            +
                                            item.Quantity)

                                    .SetProperty(
                                        storedCar =>
                                            storedCar.AverageUnitCost,

                                        newAverageUnitCost));


                if (
                    stockUpdated != 1
                )
                {
                    throw new InvalidOperationException(
                        $"Stock or inventory cost changed for {currentCar.Model} " +
                        "while receiving the purchase order. " +
                        "Please refresh and try again.");
                }


                /*
                 * Keep local snapshots current in case
                 * this method ever processes the same
                 * car more than once.
                 */

                currentCar.Quantity +=
                    item.Quantity;


                currentCar.AverageUnitCost =
                    newAverageUnitCost;


                /*
                 * Stock History Snapshot
                 */

                var inventoryValue =
                    decimal.Round(
                        item.Quantity
                        *
                        incomingUnitCost,
                        2,
                        MidpointRounding.AwayFromZero);


                _context.StockTransactions
                    .Add(
                        new StockTransaction
                        {
                            CarId =
                                item.CarId,

                            TransactionType =
                                "Stock In",

                            Quantity =
                                item.Quantity,

                            TransactionDate =
                                receivedAt,

                            UnitCost =
                                incomingUnitCost,

                            InventoryValue =
                                inventoryValue,

                            SourceType =
                                "PurchaseOrder",

                            SourceId =
                                order.Id,

                            Notes =
                                $"Automatic stock in from Purchase Order #{order.Id}"
                        });
            }


            /*
             * Save Stock Transactions.
             *
             * Car quantity/cost updates were already
             * executed atomically using ExecuteUpdateAsync.
             */

            await _context
                .SaveChangesAsync();


            var totalUnits =
                order.Items
                    .Sum(
                        item =>
                            item.Quantity);


            /* =========================================
               Audit
            ========================================= */

            await _auditLogService
                .LogAsync(
                    "Receive",
                    "PurchaseOrder",
                    order.Id.ToString(),
                    $"Purchase Order #{order.Id} received. " +
                    $"{totalUnits} unit(s) added to inventory using weighted-average cost accounting.");


            /* =========================================
               Notification
            ========================================= */

            await _notificationService
                .CreateAsync(
                    NotificationType.System,
                    "Purchase Order Received",
                    $"Purchase Order #{order.Id} was received successfully. " +
                    $"{totalUnits} unit(s) were added to inventory.",
                    "PurchaseOrder",
                    order.Id.ToString());


            await transaction
                .CommitAsync();


            return true;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }
}
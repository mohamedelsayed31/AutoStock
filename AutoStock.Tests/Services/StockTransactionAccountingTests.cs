using AutoStock.Application.DTOs.Sales;
using AutoStock.Application.DTOs.Stock;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace AutoStock.Tests.Services;

public class StockTransactionAccountingTests
{
    /* =========================================
       Manual Stock In
    ========================================= */

    [Fact]
    public async Task ManualStockIn_CreatesAccountingSnapshot_AndReturnsItInHistory()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: 800_000m);

        var service =
            new StockService(
                db.Context,
                null!);

        var result =
            await service.StockInAsync(
                car.Id,
                new StockOperationDto
                {
                    Quantity = 3,
                    UnitCost = 900_000m,
                    Notes = "Manual stock in test"
                });

        Assert.Equal(
            900_000m,
            result.UnitCost);

        Assert.Equal(
            2_700_000m,
            result.InventoryValue);

        Assert.Equal(
            "Manual",
            result.SourceType);

        Assert.Null(
            result.SourceId);


        var transaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            "Stock In",
            transaction.TransactionType);

        Assert.Equal(
            3,
            transaction.Quantity);

        Assert.Equal(
            900_000m,
            transaction.UnitCost);

        Assert.Equal(
            2_700_000m,
            transaction.InventoryValue);

        Assert.Equal(
            "Manual",
            transaction.SourceType);

        Assert.Null(
            transaction.SourceId);


        var history =
            await service.GetHistoryAsync(
                carId: car.Id,
                page: 1,
                pageSize: 10);

        var historyItem =
            Assert.Single(
                history.Items);

        Assert.Equal(
            transaction.Id,
            historyItem.Id);

        Assert.Equal(
            900_000m,
            historyItem.UnitCost);

        Assert.Equal(
            2_700_000m,
            historyItem.InventoryValue);

        Assert.Equal(
            "Manual",
            historyItem.SourceType);

        Assert.Null(
            historyItem.SourceId);
    }


    /* =========================================
       Manual Stock Out - Known Cost
    ========================================= */

    [Fact]
    public async Task ManualStockOut_WithKnownCost_CreatesCostSnapshot()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: 800_000m);

        var service =
            new StockService(
                db.Context,
                null!);

        var result =
            await service.StockOutAsync(
                car.Id,
                new StockOperationDto
                {
                    Quantity = 2,
                    Notes = "Manual stock out test"
                });

        Assert.Equal(
            800_000m,
            result.UnitCost);

        Assert.Equal(
            1_600_000m,
            result.InventoryValue);

        Assert.Equal(
            "Manual",
            result.SourceType);

        Assert.Null(
            result.SourceId);


        var transaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            "Stock Out",
            transaction.TransactionType);

        Assert.Equal(
            2,
            transaction.Quantity);

        Assert.Equal(
            800_000m,
            transaction.UnitCost);

        Assert.Equal(
            1_600_000m,
            transaction.InventoryValue);

        Assert.Equal(
            "Manual",
            transaction.SourceType);

        Assert.Null(
            transaction.SourceId);
    }


    /* =========================================
       Manual Stock Out - Unknown Legacy Cost
    ========================================= */

    [Fact]
    public async Task ManualStockOut_WhenLegacyCostIsUnknown_KeepsTransactionCostUnknown()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: null);

        var service =
            new StockService(
                db.Context,
                null!);

        var result =
            await service.StockOutAsync(
                car.Id,
                new StockOperationDto
                {
                    Quantity = 2,
                    Notes = "Legacy unknown cost stock out"
                });

        Assert.Null(
            result.UnitCost);

        Assert.Null(
            result.InventoryValue);

        Assert.Equal(
            "Manual",
            result.SourceType);

        Assert.Null(
            result.SourceId);


        var transaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();

        Assert.Null(
            transaction.UnitCost);

        Assert.Null(
            transaction.InventoryValue);

        Assert.Equal(
            "Manual",
            transaction.SourceType);

        Assert.Null(
            transaction.SourceId);
    }


    /* =========================================
       Purchase Order Receive
    ========================================= */

    [Fact]
    public async Task PurchaseOrderReceive_CreatesPurchaseOrderAccountingSnapshot()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: 800_000m);

        var order =
            new PurchaseOrder
            {
                SupplierId =
                    car.SupplierId,

                OrderDate =
                    DateTime.UtcNow,

                Status =
                    PurchaseOrderStatus.Submitted,

                TotalAmount =
                    4_500_000m,

                Notes =
                    "PO accounting snapshot test",

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                5,

                            UnitCost =
                                900_000m,

                            LineTotal =
                                4_500_000m
                        }
                    }
            };

        db.Context.PurchaseOrders.Add(
            order);

        await db.Context
            .SaveChangesAsync();


        var auditLogService =
            new Mock<IAuditLogService>();

        var notificationService =
            new Mock<INotificationService>();

        var service =
            new PurchaseOrderService(
                db.Context,
                auditLogService.Object,
                notificationService.Object);


        var received =
            await service.ReceiveAsync(
                order.Id);

        Assert.True(
            received);


        var transaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            "Stock In",
            transaction.TransactionType);

        Assert.Equal(
            5,
            transaction.Quantity);

        Assert.Equal(
            900_000m,
            transaction.UnitCost);

        Assert.Equal(
            4_500_000m,
            transaction.InventoryValue);

        Assert.Equal(
            "PurchaseOrder",
            transaction.SourceType);

        Assert.Equal(
            order.Id,
            transaction.SourceId);
    }


    /* =========================================
       Sale
    ========================================= */

    [Fact]
    public async Task Sale_CreatesStockOutSnapshot_FromImmutableSaleItemCost()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: 800_000m);

        var customer =
            new Customer
            {
                FullName =
                    "Accounting Customer",

                PhoneNumber =
                    "01000000002",

                Email =
                    "accounting@test.com",

                Address =
                    "Cairo",

                CreatedAt =
                    DateTime.UtcNow
            };

        db.Context.Customers.Add(
            customer);

        await db.Context
            .SaveChangesAsync();


        var auditLogService =
            new Mock<IAuditLogService>();

        var notificationService =
            new Mock<INotificationService>();

        var service =
            new SaleService(
                db.Context,
                auditLogService.Object,
                notificationService.Object);


        var createdSale =
            await service.CreateAsync(
                new CreateSaleDto
                {
                    CustomerId =
                        customer.Id,

                    PaymentMethod =
                        SalePaymentMethod.Cash,

                    Notes =
                        "Sale accounting snapshot test",

                    Items =
                    [
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                2,

                            UnitPrice =
                                1_000_000m
                        }
                    ]
                });


        var saleItem =
            await db.Context.SaleItems
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            800_000m,
            saleItem.UnitCost);

        Assert.Equal(
            1_600_000m,
            saleItem.CostOfGoodsSold);


        var transaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            "Stock Out",
            transaction.TransactionType);

        Assert.Equal(
            2,
            transaction.Quantity);

        Assert.Equal(
            saleItem.UnitCost,
            transaction.UnitCost);

        Assert.Equal(
            saleItem.CostOfGoodsSold,
            transaction.InventoryValue);

        Assert.Equal(
            "Sale",
            transaction.SourceType);

        Assert.Equal(
            createdSale.Id,
            transaction.SourceId);
    }


    /* =========================================
       Test Data
    ========================================= */

    private static async Task<Car>
        CreateCarAsync(
            AutoStock.Infrastructure.Data.AppDbContext context,
            int quantity,
            decimal? averageUnitCost)
    {
        var brand =
            new Brand
            {
                Name =
                    "Accounting Brand",

                Country =
                    "Japan"
            };


        var category =
            new Category
            {
                Name =
                    "Accounting Cat",

                Description =
                    "Stock transaction accounting tests"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Accounting Supplier",

                Email =
                    "supplier@test.com",

                PhoneNumber =
                    "01000000001",

                Address =
                    "Cairo"
            };


        context.Brands.Add(
            brand);

        context.Categories.Add(
            category);

        context.Suppliers.Add(
            supplier);


        await context
            .SaveChangesAsync();


        var car =
            new Car
            {
                Model =
                    "Accounting Car",

                Year =
                    2026,

                Price =
                    1_500_000m,

                Quantity =
                    quantity,

                AverageUnitCost =
                    averageUnitCost,

                ReorderLevel =
                    2,

                Color =
                    "Black",

                FuelType =
                    "Petrol",

                Transmission =
                    "Automatic",

                BrandId =
                    brand.Id,

                CategoryId =
                    category.Id,

                SupplierId =
                    supplier.Id,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };


        context.Cars.Add(
            car);

        await context
            .SaveChangesAsync();


        return car;
    }
}

using AutoStock.Application.DTOs.Sales;
using AutoStock.Domain.Enums;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class SaleServiceTests
{
    /* =========================================
       Successful Sale
    ========================================= */

    [Fact]
    public async Task CreateSale_WithEnoughStock_CreatesCompleteTransaction()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            await SaleTestData
                .CreateCustomerAsync(
                    db.Context);


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 5,
                    reorderLevel: 2,
                    price: 1_000_000m);


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var request =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                Notes =
                    "Test sale",

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                2,

                            UnitPrice =
                                950_000m
                        }
                    }
            };


        var result =
            await service
                .CreateAsync(
                    request);


        /* Sale */

        Assert.True(
            result.Id > 0);

        Assert.Equal(
            customer.Id,
            result.CustomerId);

        Assert.Equal(
            1_900_000m,
            result.TotalAmount);


        /* Sale Item */

        Assert.Single(
            result.Items);

        Assert.Equal(
            2,
            result.Items[0].Quantity);

        Assert.Equal(
            950_000m,
            result.Items[0].UnitPrice);

        Assert.Equal(
            1_900_000m,
            result.Items[0].LineTotal);


        /* Inventory */

        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            3,
            updatedCar.Quantity);


        /* Stock History */

        var stockTransaction =
            await db.Context
                .StockTransactions
                .AsNoTracking()
                .SingleAsync();


        Assert.Equal(
            car.Id,
            stockTransaction.CarId);

        Assert.Equal(
            "Stock Out",
            stockTransaction.TransactionType);

        Assert.Equal(
            2,
            stockTransaction.Quantity);


        /* Audit */

        var auditLog =
            await db.Context
                .AuditLogs
                .AsNoTracking()
                .SingleAsync(
                    log =>
                        log.EntityName ==
                        "Sale");


        Assert.Equal(
            "Create",
            auditLog.Action);

        Assert.Equal(
            result.Id.ToString(),
            auditLog.EntityId);


        /* Sale Notification */

        var saleNotification =
            await db.Context
                .Notifications
                .AsNoTracking()
                .SingleAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .SaleCompleted);


        Assert.False(
            saleNotification.IsRead);

        Assert.Equal(
            result.Id.ToString(),
            saleNotification.EntityId);
    }


    /* =========================================
       Insufficient Stock
    ========================================= */

    [Fact]
    public async Task CreateSale_WithInsufficientStock_DoesNotChangeDatabase()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            await SaleTestData
                .CreateCustomerAsync(
                    db.Context);


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 1,
                    reorderLevel: 1);


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var request =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                2,

                            UnitPrice =
                                1_000_000m
                        }
                    }
            };


        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () =>
                    service.CreateAsync(
                        request)
            );


        Assert.Contains(
            "Not enough stock",
            exception.Message);


        /* No Sale */

        Assert.Equal(
            0,
            await db.Context.Sales
                .CountAsync());


        /* Stock unchanged */

        var storedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            1,
            storedCar.Quantity);


        /* No Stock Transaction */

        Assert.Equal(
            0,
            await db.Context
                .StockTransactions
                .CountAsync());


        /* No Sale Audit */

        Assert.Equal(
            0,
            await db.Context
                .AuditLogs
                .CountAsync());


        /* No Notification */

        Assert.Equal(
            0,
            await db.Context
                .Notifications
                .CountAsync());
    }


    /* =========================================
       Out Of Stock Notification
    ========================================= */

    [Fact]
    public async Task CreateSale_WhenStockReachesZero_CreatesOutOfStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            await SaleTestData
                .CreateCustomerAsync(
                    db.Context);


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 1,
                    reorderLevel: 1);


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var request =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod.Card,

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                1,

                            UnitPrice =
                                1_000_000m
                        }
                    }
            };


        await service
            .CreateAsync(
                request);


        /* Quantity reaches zero */

        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            0,
            updatedCar.Quantity);


        /* Out Of Stock */

        var outOfStockNotification =
            await db.Context
                .Notifications
                .AsNoTracking()
                .SingleAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .OutOfStock);


        Assert.Equal(
            "Car",
            outOfStockNotification
                .EntityName);

        Assert.Equal(
            car.Id.ToString(),
            outOfStockNotification
                .EntityId);


        /* Also Sale Completed */

        Assert.True(
            await db.Context
                .Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .SaleCompleted)
        );
    }


    /* =========================================
       Low Stock Notification
    ========================================= */

    [Fact]
    public async Task CreateSale_WhenStockReachesReorderLevel_CreatesLowStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            await SaleTestData
                .CreateCustomerAsync(
                    db.Context);


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 3,
                    reorderLevel: 2);


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var request =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod
                        .BankTransfer,

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                1,

                            UnitPrice =
                                1_000_000m
                        }
                    }
            };


        await service
            .CreateAsync(
                request);


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            2,
            updatedCar.Quantity);


        Assert.True(
            await db.Context
                .Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .LowStock)
        );


        Assert.False(
            await db.Context
                .Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .OutOfStock)
        );
    }
}
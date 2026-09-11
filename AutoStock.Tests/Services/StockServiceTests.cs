using AutoStock.Application.DTOs.Stock;
using AutoStock.Application.Interface;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Fakes;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class StockServiceTests
{
    /* =========================================
       Helper
    ========================================= */

    private static StockService CreateService(
        AppDbContext context)
    {
        ICurrentUserService currentUserService =
            new FakeCurrentUserService();


        INotificationService notificationService =
            new NotificationService(
                context,
                currentUserService);


        return new StockService(
            context,
            notificationService);
    }


    /* =========================================
       Low Stock Threshold
    ========================================= */

    [Fact]
    public async Task StockOut_WhenCrossingReorderLevel_CreatesLowStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /*
         * Before:
         *
         * Quantity = 4
         * ReorderLevel = 3
         *
         * Stock Out 1
         *
         * After:
         * Quantity = 3
         *
         * Expected:
         * Low Stock notification.
         */

        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 4,
                    reorderLevel: 3);


        var service =
            CreateService(
                db.Context);


        var request =
            new StockOperationDto
            {
                Quantity =
                    1,

                Notes =
                    "Manual stock out test"
            };


        /* Act */

        var result =
            await service
                .StockOutAsync(
                    car.Id,
                    request);


        /* Stock Transaction */

        Assert.Equal(
            car.Id,
            result.CarId);


        Assert.Equal(
            "Stock Out",
            result.TransactionType);


        Assert.Equal(
            1,
            result.Quantity);


        /* Quantity */

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


        /* Low Stock Notification */

        var lowStockNotification =
            await db.Context.Notifications
                .AsNoTracking()
                .SingleAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.LowStock);


        Assert.Equal(
            "Car",
            lowStockNotification.EntityName);


        Assert.Equal(
            car.Id.ToString(),
            lowStockNotification.EntityId);


        Assert.False(
            lowStockNotification.IsRead);


        /* Not Out Of Stock */

        Assert.False(
            await db.Context.Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.OutOfStock)
        );
    }


    /* =========================================
       Out Of Stock
    ========================================= */

    [Fact]
    public async Task StockOut_WhenQuantityReachesZero_CreatesOutOfStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 1,
                    reorderLevel: 2);


        var service =
            CreateService(
                db.Context);


        var request =
            new StockOperationDto
            {
                Quantity =
                    1,

                Notes =
                    "Remove final unit"
            };


        /* Act */

        await service
            .StockOutAsync(
                car.Id,
                request);


        /* Quantity */

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


        /* Out Of Stock Notification */

        var outOfStockNotification =
            await db.Context.Notifications
                .AsNoTracking()
                .SingleAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.OutOfStock);


        Assert.Equal(
            car.Id.ToString(),
            outOfStockNotification.EntityId);


        Assert.Equal(
            "Car",
            outOfStockNotification.EntityName);


        /* Low Stock must NOT also be created */

        Assert.False(
            await db.Context.Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.LowStock)
        );


        /* One Stock Transaction */

        Assert.Equal(
            1,
            await db.Context.StockTransactions
                .CountAsync());
    }


    /* =========================================
       Avoid Low Stock Spam
    ========================================= */

    [Fact]
    public async Task StockOut_WhenStockWasAlreadyLow_DoesNotCreateDuplicateLowStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /*
         * Already Low:
         *
         * Quantity = 2
         * ReorderLevel = 3
         *
         * Stock Out 1
         *
         * Quantity becomes 1.
         *
         * We do NOT want another
         * Low Stock notification.
         */

        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 2,
                    reorderLevel: 3);


        var service =
            CreateService(
                db.Context);


        var request =
            new StockOperationDto
            {
                Quantity =
                    1,

                Notes =
                    "Already low stock"
            };


        /* Act */

        await service
            .StockOutAsync(
                car.Id,
                request);


        /* Quantity */

        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            1,
            updatedCar.Quantity);


        /* No Low Stock Notification */

        var lowStockCount =
            await db.Context.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.LowStock);


        Assert.Equal(
            0,
            lowStockCount);


        /* No Out Of Stock Either */

        var outOfStockCount =
            await db.Context.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.OutOfStock);


        Assert.Equal(
            0,
            outOfStockCount);


        /* Stock Out itself still happened */

        Assert.Equal(
            1,
            await db.Context.StockTransactions
                .CountAsync());
    }


    /* =========================================
       Insufficient Stock
    ========================================= */

    [Fact]
    public async Task StockOut_WithInsufficientStock_DoesNotChangeDatabase()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 2,
                    reorderLevel: 1);


        var service =
            CreateService(
                db.Context);


        var request =
            new StockOperationDto
            {
                Quantity =
                    5,

                Notes =
                    "Invalid stock out"
            };


        /* Act */

        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () =>
                    service.StockOutAsync(
                        car.Id,
                        request)
            );


        Assert.Equal(
            "Insufficient stock.",
            exception.Message);


        /* Quantity unchanged */

        var storedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            2,
            storedCar.Quantity);


        /* No Stock Transaction */

        Assert.Equal(
            0,
            await db.Context.StockTransactions
                .CountAsync());


        /* No Notification */

        Assert.Equal(
            0,
            await db.Context.Notifications
                .CountAsync());
    }
}
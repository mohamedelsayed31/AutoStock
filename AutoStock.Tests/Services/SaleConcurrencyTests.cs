using AutoStock.Application.DTOs.Sales;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class SaleConcurrencyTests
{
    [Fact]
    [Trait("Category", "Integration")]
    public async Task TwoConcurrentSales_ForLastCar_OnlyOneSucceeds()
    {
        /*
         * This test uses a real temporary SQL Server database.
         *
         * Initial stock:
         * Quantity = 1
         *
         * Two different DbContexts try to sell
         * the same last unit at the same time.
         *
         * Expected:
         * - One request succeeds
         * - One request fails
         * - Final Quantity = 0
         * - Exactly one Sale exists
         */

        await using var database =
            await SqlServerTestDatabase
                .CreateAsync();


        int customerId;
        int carId;


        /* =========================================
           Seed Database
        ========================================= */

        await using (
            var seedContext =
                database.CreateContext())
        {
            var brand =
                new Brand
                {
                    Name =
                        "Dodge",

                    Country =
                        "USA"
                };


            var category =
                new Category
                {
                    Name =
                        "Sedan",

                    Description =
                        "Concurrency test category"
                };


            var supplier =
                new Supplier
                {
                    Name =
                        "Concurrency Test Supplier",

                    Email =
                        "supplier@test.com",

                    PhoneNumber =
                        "01000000000",

                    Address =
                        "Cairo"
                };


            seedContext.Brands.Add(
                brand);

            seedContext.Categories.Add(
                category);

            seedContext.Suppliers.Add(
                supplier);


            await seedContext
                .SaveChangesAsync();


            var customer =
                new Customer
                {
                    FullName =
                        "Concurrency Customer",

                    PhoneNumber =
                        "01111111111",

                    Email =
                        "customer@test.com",

                    Address =
                        "Cairo",

                    CreatedAt =
                        DateTime.UtcNow
                };


            seedContext.Customers.Add(
                customer);


            await seedContext
                .SaveChangesAsync();


            var car =
                new Car
                {
                    Model =
                        "Charger",

                    Year =
                        2026,

                    Price =
                        2_500_000m,

                    Quantity =
                        1,

                    ReorderLevel =
                        1,

                    Color =
                        "Black",

                    FuelType =
                        "Petrol",

                    Transmission =
                        "Automatic",

                    IsActive =
                        true,

                    CreatedAt =
                        DateTime.UtcNow,

                    BrandId =
                        brand.Id,

                    CategoryId =
                        category.Id,

                    SupplierId =
                        supplier.Id
                };


            seedContext.Cars.Add(
                car);


            await seedContext
                .SaveChangesAsync();


            customerId =
                customer.Id;

            carId =
                car.Id;
        }


        /* =========================================
           Start Two Concurrent Sales
        ========================================= */

        var taskA =
            TryCreateSaleAsync(
                database,
                customerId,
                carId);


        var taskB =
            TryCreateSaleAsync(
                database,
                customerId,
                carId);


        var results =
            await Task.WhenAll(
                taskA,
                taskB);


        /* =========================================
           Exactly One Must Succeed
        ========================================= */

        var successfulRequests =
            results.Count(
                result =>
                    result.Success);


        var failedRequests =
            results.Count(
                result =>
                    !result.Success);


        Assert.Equal(
            1,
            successfulRequests);


        Assert.Equal(
            1,
            failedRequests);


        /* =========================================
           Failed Request Must Be Stock Conflict
        ========================================= */

        var failedResult =
            results.Single(
                result =>
                    !result.Success);


        Assert.NotNull(
            failedResult.Exception);


        Assert.IsType<
            InvalidOperationException>(
                failedResult.Exception);


        Assert.Contains(
            "Stock changed",
            failedResult.Exception!
                .Message);


        /* =========================================
           Verify Final Database State
        ========================================= */

        await using var verifyContext =
            database.CreateContext();


        var finalCar =
            await verifyContext.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        carId);


        /* Never oversold */

        Assert.Equal(
            0,
            finalCar.Quantity);


        Assert.True(
            finalCar.Quantity >= 0);


        /* Only one Sale */

        var salesCount =
            await verifyContext.Sales
                .CountAsync();


        Assert.Equal(
            1,
            salesCount);


        /* Only one Sale Item */

        var saleItemsCount =
            await verifyContext.SaleItems
                .CountAsync();


        Assert.Equal(
            1,
            saleItemsCount);


        /* Only one Stock Out */

        var stockOutCount =
            await verifyContext
                .StockTransactions
                .CountAsync(
                    transaction =>
                        transaction.CarId ==
                            carId
                        &&
                        transaction.TransactionType ==
                            "Stock Out");


        Assert.Equal(
            1,
            stockOutCount);


        /* Only one Sale Audit */

        var saleAuditCount =
            await verifyContext.AuditLogs
                .CountAsync(
                    log =>
                        log.EntityName ==
                            "Sale"
                        &&
                        log.Action ==
                            "Create");


        Assert.Equal(
            1,
            saleAuditCount);


        /* One Sale Completed notification */

        var saleNotifications =
            await verifyContext.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .SaleCompleted);


        Assert.Equal(
            1,
            saleNotifications);


        /* One Out Of Stock notification */

        var outOfStockNotifications =
            await verifyContext.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .OutOfStock);


        Assert.Equal(
            1,
            outOfStockNotifications);
    }


    /* =========================================
       Execute One Independent Sale Request
    ========================================= */

    private static async Task<SaleAttemptResult>
        TryCreateSaleAsync(
            SqlServerTestDatabase database,
            int customerId,
            int carId)
    {
        await using var context =
            database.CreateContext();


        var service =
            SaleServiceFactory
                .Create(
                    context);


        var request =
            new CreateSaleDto
            {
                CustomerId =
                    customerId,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                Notes =
                    "Concurrency integration test",

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                carId,

                            Quantity =
                                1,

                            UnitPrice =
                                2_500_000m
                        }
                    }
            };


        try
        {
            await service
                .CreateAsync(
                    request);


            return new SaleAttemptResult
            {
                Success =
                    true
            };
        }
        catch (Exception exception)
        {
            return new SaleAttemptResult
            {
                Success =
                    false,

                Exception =
                    exception
            };
        }
    }


    /* =========================================
       Result
    ========================================= */

    private sealed class SaleAttemptResult
    {
        public bool Success { get; init; }

        public Exception? Exception
        {
            get;
            init;
        }
    }
}
using AutoStock.Application.DTOs.Stock;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class ManualStockConcurrencyTests
{
    [Fact]
    public async Task TwoConcurrentStockIns_DoNotLoseQuantityOrInventoryCost()
    {
        /* =========================================
           Arrange Database
        ========================================= */

        var databaseName =
            $"AutoStock_StockConcurrency_{Guid.NewGuid():N}";


        var options =
            CreateOptions(
                databaseName);


        try
        {
            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                await CreateCarAsync(
                    setupContext);
            }


            int carId;


            await using (
                var readContext =
                    new AppDbContext(
                        options))
            {
                carId =
                    await readContext.Cars
                        .AsNoTracking()
                        .Select(
                            car =>
                                car.Id)
                        .SingleAsync();
            }


            /*
             * Initial Inventory:
             *
             * 10 units
             * @ 800,000 EGP
             */
            const int initialQuantity =
                10;

            const decimal initialAverageCost =
                800_000m;


            /*
             * Request A:
             *
             * 5 units
             * @ 900,000
             */
            var requestA =
                new ConcurrentStockRequest(
                    "Request A",
                    5,
                    900_000m);


            /*
             * Request B:
             *
             * 5 units
             * @ 1,000,000
             */
            var requestB =
                new ConcurrentStockRequest(
                    "Request B",
                    5,
                    1_000_000m);


            /*
             * Gate:
             *
             * Both Tasks are created first.
             * They start the actual stock operation
             * only after the same signal.
             */
            var startGate =
                new TaskCompletionSource<bool>(
                    TaskCreationOptions
                        .RunContinuationsAsynchronously);


            /* =========================================
               Act
            ========================================= */

            var taskA =
                RunStockInAsync(
                    options,
                    carId,
                    requestA,
                    startGate.Task);


            var taskB =
                RunStockInAsync(
                    options,
                    carId,
                    requestB,
                    startGate.Task);


            /*
             * Release both requests.
             */
            startGate.SetResult(
                true);


            var results =
                await Task.WhenAll(
                    taskA,
                    taskB);


            /* =========================================
               Basic Result Validation
            ========================================= */

            var successfulResults =
                results
                    .Where(
                        result =>
                            result.Succeeded)
                    .ToList();


            var failedResults =
                results
                    .Where(
                        result =>
                            !result.Succeeded)
                    .ToList();


            /*
             * At least one request must succeed.
             */
            Assert.NotEmpty(
                successfulResults);


            /*
             * If a request failed because both
             * requests used the same stale inventory
             * snapshot, our StockService should
             * report the concurrency conflict.
             */
            foreach (
                var failedResult
                in failedResults)
            {
                Assert.NotNull(
                    failedResult.Exception);


                Assert.IsType<
                    InvalidOperationException>(
                    failedResult.Exception);


                Assert.Contains(
                    "changed",
                    failedResult
                        .Exception!
                        .Message,
                    StringComparison
                        .OrdinalIgnoreCase);
            }


            /* =========================================
               Read Final Database State
            ========================================= */

            await using var verifyContext =
                new AppDbContext(
                    options);


            var finalCar =
                await verifyContext.Cars
                    .AsNoTracking()
                    .SingleAsync(
                        car =>
                            car.Id ==
                            carId);


            var stockTransactions =
                await verifyContext
                    .StockTransactions
                    .AsNoTracking()
                    .Where(
                        transaction =>
                            transaction.CarId ==
                            carId
                            &&
                            transaction
                                .TransactionType ==
                            "Stock In")
                    .OrderBy(
                        transaction =>
                            transaction.Id)
                    .ToListAsync();


            /* =========================================
               Quantity Must Match Successful Requests
            ========================================= */

            var expectedQuantity =
                initialQuantity
                +
                successfulResults.Sum(
                    result =>
                        result.Request
                            .Quantity);


            Assert.Equal(
                expectedQuantity,
                finalCar.Quantity);


            /*
             * Every successful Stock In
             * must create exactly one
             * StockTransaction.
             *
             * Failed requests must not leave
             * half-completed transactions.
             */
            Assert.Equal(
                successfulResults.Count,
                stockTransactions.Count);


            /* =========================================
               Calculate Expected Cost
            ========================================= */

            decimal expectedAverageCost;


            /*
             * Both succeeded.
             *
             * Final inventory:
             *
             * 10 × 800,000 = 8,000,000
             *  5 × 900,000 = 4,500,000
             *  5 × 1,000,000 = 5,000,000
             *
             * Total:
             *
             * 20 units
             * 17,500,000 cost
             *
             * Average:
             *
             * 875,000
             */
            if (
                successfulResults.Count ==
                2)
            {
                expectedAverageCost =
                    875_000m;
            }

            /*
             * Only one succeeded.
             */
            else
            {
                var succeeded =
                    successfulResults
                        .Single();


                expectedAverageCost =
                    CalculateWeightedAverage(
                        initialQuantity,
                        initialAverageCost,

                        succeeded
                            .Request
                            .Quantity,

                        succeeded
                            .Request
                            .UnitCost);
            }


            Assert.Equal(
                expectedAverageCost,
                finalCar
                    .AverageUnitCost);


            /* =========================================
               Transaction Integrity
            ========================================= */

            foreach (
                var successfulResult
                in successfulResults)
            {
                Assert.Contains(
                    stockTransactions,
                    transaction =>
                        transaction.Notes ==
                        successfulResult
                            .Request
                            .Name);
            }
        }
        finally
        {
            /* =========================================
               Cleanup
            ========================================= */

            await using var cleanupContext =
                new AppDbContext(
                    options);


            await cleanupContext.Database
                .EnsureDeletedAsync();
        }
    }


    /* =========================================
       Run One Concurrent Request
    ========================================= */

    private static async Task<
        ConcurrentStockResult>
        RunStockInAsync(
            DbContextOptions<AppDbContext>
                options,

            int carId,

            ConcurrentStockRequest request,

            Task startSignal)
    {
        /*
         * Important:
         *
         * Every request has its OWN DbContext.
         *
         * Sharing one DbContext between concurrent
         * operations would be invalid because
         * DbContext is not thread-safe.
         */
        await using var context =
            new AppDbContext(
                options);


        var service =
            new StockService(
                context,

                /*
                 * Stock In does not create
                 * low-stock notifications.
                 */
                null!);


        await startSignal;


        try
        {
            await service
                .StockInAsync(
                    carId,
                    new StockOperationDto
                    {
                        Quantity =
                            request.Quantity,

                        UnitCost =
                            request.UnitCost,

                        Notes =
                            request.Name
                    });


            return new ConcurrentStockResult(
                request,
                true,
                null);
        }
        catch (
            Exception exception)
        {
            return new ConcurrentStockResult(
                request,
                false,
                exception);
        }
    }


    /* =========================================
       Weighted Average Helper
    ========================================= */

    private static decimal
        CalculateWeightedAverage(
            int currentQuantity,
            decimal currentAverageCost,
            int incomingQuantity,
            decimal incomingUnitCost)
    {
        var currentValue =
            currentQuantity
            *
            currentAverageCost;


        var incomingValue =
            incomingQuantity
            *
            incomingUnitCost;


        var finalQuantity =
            currentQuantity
            +
            incomingQuantity;


        return decimal.Round(
            (
                currentValue
                +
                incomingValue
            )
            /
            finalQuantity,
            2,
            MidpointRounding
                .AwayFromZero);
    }


    /* =========================================
       SQL Server Options
    ========================================= */

    private static
        DbContextOptions<AppDbContext>
        CreateOptions(
            string databaseName)
    {
        var connectionString =
            "Server=localhost;" +
            $"Database={databaseName};" +
            "Trusted_Connection=True;" +
            "TrustServerCertificate=True;" +
            "MultipleActiveResultSets=True";


        return new DbContextOptionsBuilder<
                AppDbContext>()
            .UseSqlServer(
                connectionString)
            .Options;
    }


    /* =========================================
       Seed Car
    ========================================= */

    private static async Task
        CreateCarAsync(
            AppDbContext context)
    {
        var brand =
            new Brand
            {
                Name =
                    "Concurrency Brand",

                Country =
                    "Japan"
            };


        var category =
            new Category
            {
                Name =
                    "Concurrency Category",

                Description =
                    "Manual Stock concurrency test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Concurrency Supplier",

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
                    "Concurrent Cost Car",

                Year =
                    2026,

                Price =
                    1_200_000m,

                Quantity =
                    10,

                AverageUnitCost =
                    800_000m,

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
    }


    /* =========================================
       Test Models
    ========================================= */

    private sealed record
        ConcurrentStockRequest(
            string Name,
            int Quantity,
            decimal UnitCost);


    private sealed record
        ConcurrentStockResult(
            ConcurrentStockRequest Request,
            bool Succeeded,
            Exception? Exception);
}
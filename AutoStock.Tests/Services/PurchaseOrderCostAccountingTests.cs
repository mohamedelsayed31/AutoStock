using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace AutoStock.Tests.Services;

public class PurchaseOrderCostAccountingTests
{
    /* =========================================
       1. Weighted Average
    ========================================= */

    [Fact]
    public async Task ReceiveAsync_WithKnownExistingCost_CalculatesWeightedAverageCost()
    {
        var options =
            CreateOptions(
                CreateDatabaseName());


        try
        {
            int carId;
            int purchaseOrderId;


            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                var seed =
                    await CreateBaseDataAsync(
                        setupContext,
                        quantity: 10,
                        averageUnitCost: 800_000m);


                carId =
                    seed.CarId;


                purchaseOrderId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 5,
                        unitCost: 900_000m);
            }


            await using (
                var context =
                    new AppDbContext(
                        options))
            {
                var service =
                    CreateService(
                        context);


                var result =
                    await service.ReceiveAsync(
                        purchaseOrderId);


                Assert.True(
                    result);
            }


            await using (
                var verifyContext =
                    new AppDbContext(
                        options))
            {
                var car =
                    await verifyContext.Cars
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                carId);


                /*
                 * Existing:
                 *
                 * 10 × 800,000
                 * = 8,000,000
                 *
                 * Incoming:
                 *
                 * 5 × 900,000
                 * = 4,500,000
                 *
                 * Total:
                 *
                 * 12,500,000 / 15
                 * = 833,333.33
                 */

                Assert.Equal(
                    15,
                    car.Quantity);


                Assert.Equal(
                    833_333.33m,
                    car.AverageUnitCost);


                var order =
                    await verifyContext
                        .PurchaseOrders
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                purchaseOrderId);


                Assert.Equal(
                    PurchaseOrderStatus.Received,
                    order.Status);


                Assert.NotNull(
                    order.ReceivedAt);


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
                        .ToListAsync();


                Assert.Single(
                    stockTransactions);


                Assert.Equal(
                    5,
                    stockTransactions[0]
                        .Quantity);
            }
        }
        finally
        {
            await DeleteDatabaseAsync(
                options);
        }
    }


    /* =========================================
       2. Zero Stock
    ========================================= */

    [Fact]
    public async Task ReceiveAsync_WhenStockIsZero_UsesIncomingCostAsNewCostBasis()
    {
        var options =
            CreateOptions(
                CreateDatabaseName());


        try
        {
            int carId;
            int purchaseOrderId;


            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                /*
                 * AverageUnitCost contains an old
                 * value, but Quantity is zero.
                 *
                 * Therefore the next incoming batch
                 * starts a clean cost basis.
                 */
                var seed =
                    await CreateBaseDataAsync(
                        setupContext,
                        quantity: 0,
                        averageUnitCost: 700_000m);


                carId =
                    seed.CarId;


                purchaseOrderId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 4,
                        unitCost: 950_000m);
            }


            await using (
                var context =
                    new AppDbContext(
                        options))
            {
                var service =
                    CreateService(
                        context);


                var result =
                    await service.ReceiveAsync(
                        purchaseOrderId);


                Assert.True(
                    result);
            }


            await using (
                var verifyContext =
                    new AppDbContext(
                        options))
            {
                var car =
                    await verifyContext.Cars
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                carId);


                Assert.Equal(
                    4,
                    car.Quantity);


                Assert.Equal(
                    950_000m,
                    car.AverageUnitCost);


                Assert.Single(
                    await verifyContext
                        .StockTransactions
                        .AsNoTracking()
                        .Where(
                            transaction =>
                                transaction.CarId ==
                                carId)
                        .ToListAsync());
            }
        }
        finally
        {
            await DeleteDatabaseAsync(
                options);
        }
    }


    /* =========================================
       3. Legacy Unknown Cost
    ========================================= */

    [Fact]
    public async Task ReceiveAsync_WhenLegacyInventoryCostIsUnknown_KeepsAverageCostUnknown()
    {
        var options =
            CreateOptions(
                CreateDatabaseName());


        try
        {
            int carId;
            int purchaseOrderId;


            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                /*
                 * Existing inventory:
                 *
                 * 8 units
                 * Average cost unknown.
                 */
                var seed =
                    await CreateBaseDataAsync(
                        setupContext,
                        quantity: 8,
                        averageUnitCost: null);


                carId =
                    seed.CarId;


                purchaseOrderId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 4,
                        unitCost: 900_000m);
            }


            await using (
                var context =
                    new AppDbContext(
                        options))
            {
                var service =
                    CreateService(
                        context);


                var result =
                    await service.ReceiveAsync(
                        purchaseOrderId);


                Assert.True(
                    result);
            }


            await using (
                var verifyContext =
                    new AppDbContext(
                        options))
            {
                var car =
                    await verifyContext.Cars
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                carId);


                Assert.Equal(
                    12,
                    car.Quantity);


                /*
                 * We know the cost of the
                 * new 4 units, but not the
                 * original 8.
                 *
                 * Therefore we must NOT invent
                 * an average cost.
                 */
                Assert.Null(
                    car.AverageUnitCost);


                var order =
                    await verifyContext
                        .PurchaseOrders
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                purchaseOrderId);


                Assert.Equal(
                    PurchaseOrderStatus.Received,
                    order.Status);
            }
        }
        finally
        {
            await DeleteDatabaseAsync(
                options);
        }
    }


    /* =========================================
       4. Same PO Twice
    ========================================= */

    [Fact]
    public async Task ReceiveAsync_SamePurchaseOrderTwice_DoesNotAddStockTwice()
    {
        var options =
            CreateOptions(
                CreateDatabaseName());


        try
        {
            int carId;
            int purchaseOrderId;


            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                var seed =
                    await CreateBaseDataAsync(
                        setupContext,
                        quantity: 10,
                        averageUnitCost: 800_000m);


                carId =
                    seed.CarId;


                purchaseOrderId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 2,
                        unitCost: 900_000m);
            }


            /* =====================================
               First Receive
            ===================================== */

            await using (
                var firstContext =
                    new AppDbContext(
                        options))
            {
                var firstService =
                    CreateService(
                        firstContext);


                var firstResult =
                    await firstService
                        .ReceiveAsync(
                            purchaseOrderId);


                Assert.True(
                    firstResult);
            }


            /* =====================================
               Second Receive
            ===================================== */

            await using (
                var secondContext =
                    new AppDbContext(
                        options))
            {
                var secondService =
                    CreateService(
                        secondContext);


                var exception =
                    await Assert.ThrowsAsync<
                        InvalidOperationException>(
                        () =>
                            secondService
                                .ReceiveAsync(
                                    purchaseOrderId));


                Assert.Contains(
                    "submitted",
                    exception.Message,
                    StringComparison
                        .OrdinalIgnoreCase);
            }


            /* =====================================
               Verify
            ===================================== */

            await using (
                var verifyContext =
                    new AppDbContext(
                        options))
            {
                var car =
                    await verifyContext.Cars
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                carId);


                /*
                 * Only ONE receive:
                 *
                 * 10 + 2 = 12
                 */
                Assert.Equal(
                    12,
                    car.Quantity);


                /*
                 * (10 × 800,000)
                 * +
                 * (2 × 900,000)
                 *
                 * = 9,800,000
                 *
                 * / 12
                 *
                 * = 816,666.67
                 */
                Assert.Equal(
                    816_666.67m,
                    car.AverageUnitCost);


                var order =
                    await verifyContext
                        .PurchaseOrders
                        .AsNoTracking()
                        .SingleAsync(
                            current =>
                                current.Id ==
                                purchaseOrderId);


                Assert.Equal(
                    PurchaseOrderStatus.Received,
                    order.Status);


                var transactions =
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
                        .ToListAsync();


                /*
                 * Very important:
                 *
                 * Same PO must create
                 * only ONE Stock In.
                 */
                Assert.Single(
                    transactions);


                Assert.Equal(
                    2,
                    transactions[0]
                        .Quantity);
            }
        }
        finally
        {
            await DeleteDatabaseAsync(
                options);
        }
    }


    /* =========================================
       5. Two Different POs Concurrently
    ========================================= */

    [Fact]
    public async Task TwoDifferentPurchaseOrders_ForSameCar_DoNotLoseInventoryCostOrQuantity()
    {
        var options =
            CreateOptions(
                CreateDatabaseName());


        try
        {
            int carId;
            int orderAId;
            int orderBId;


            await using (
                var setupContext =
                    new AppDbContext(
                        options))
            {
                await setupContext.Database
                    .EnsureCreatedAsync();


                var seed =
                    await CreateBaseDataAsync(
                        setupContext,
                        quantity: 10,
                        averageUnitCost: 800_000m);


                carId =
                    seed.CarId;


                /*
                 * PO A:
                 *
                 * +5 @ 900,000
                 */
                orderAId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 5,
                        unitCost: 900_000m,
                        notes: "PO A");


                /*
                 * PO B:
                 *
                 * +5 @ 1,000,000
                 */
                orderBId =
                    await CreateSubmittedOrderAsync(
                        setupContext,
                        seed.SupplierId,
                        carId,
                        quantity: 5,
                        unitCost: 1_000_000m,
                        notes: "PO B");
            }


            var startGate =
                new TaskCompletionSource<bool>(
                    TaskCreationOptions
                        .RunContinuationsAsynchronously);


            var taskA =
                RunReceiveAsync(
                    options,
                    orderAId,
                    startGate.Task);


            var taskB =
                RunReceiveAsync(
                    options,
                    orderBId,
                    startGate.Task);


            /*
             * Release both Receive requests
             * at approximately the same time.
             */
            startGate.SetResult(
                true);


            var results =
                await Task.WhenAll(
                    taskA,
                    taskB);


            var successful =
                results
                    .Where(
                        result =>
                            result.Succeeded)
                    .ToList();


            var failed =
                results
                    .Where(
                        result =>
                            !result.Succeeded)
                    .ToList();


            /*
             * At least one PO must receive.
             */
            Assert.NotEmpty(
                successful);


            /*
             * Any failure must be a controlled
             * concurrency/business failure.
             */
            foreach (
                var failedResult
                in failed)
            {
                Assert.NotNull(
                    failedResult.Exception);


                Assert.IsType<
                    InvalidOperationException>(
                    failedResult.Exception);
            }


            /* =====================================
               Verify Final State
            ===================================== */

            await using var verifyContext =
                new AppDbContext(
                    options);


            var car =
                await verifyContext.Cars
                    .AsNoTracking()
                    .SingleAsync(
                        current =>
                            current.Id ==
                            carId);


            var orderA =
                await verifyContext
                    .PurchaseOrders
                    .AsNoTracking()
                    .SingleAsync(
                        order =>
                            order.Id ==
                            orderAId);


            var orderB =
                await verifyContext
                    .PurchaseOrders
                    .AsNoTracking()
                    .SingleAsync(
                        order =>
                            order.Id ==
                            orderBId);


            var transactions =
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
                    .ToListAsync();


            /* =====================================
               Both Successfully Received
            ===================================== */

            if (
                successful.Count ==
                2)
            {
                /*
                 * Initial:
                 *
                 * 10 × 800,000
                 * = 8,000,000
                 *
                 * PO A:
                 *
                 * 5 × 900,000
                 * = 4,500,000
                 *
                 * PO B:
                 *
                 * 5 × 1,000,000
                 * = 5,000,000
                 *
                 * Total:
                 *
                 * 20 units
                 * 17,500,000
                 *
                 * Average:
                 *
                 * 875,000
                 */

                Assert.Equal(
                    20,
                    car.Quantity);


                Assert.Equal(
                    875_000m,
                    car.AverageUnitCost);


                Assert.Equal(
                    PurchaseOrderStatus.Received,
                    orderA.Status);


                Assert.Equal(
                    PurchaseOrderStatus.Received,
                    orderB.Status);


                Assert.Equal(
                    2,
                    transactions.Count);
            }

            /* =====================================
               Only One Successfully Received
            ===================================== */

            else
            {
                var succeeded =
                    successful.Single();


                Assert.Equal(
                    15,
                    car.Quantity);


                /*
                 * If A won:
                 *
                 * ((10 × 800k)
                 *  + (5 × 900k))
                 * / 15
                 *
                 * = 833,333.33
                 */
                if (
                    succeeded.OrderId ==
                    orderAId)
                {
                    Assert.Equal(
                        833_333.33m,
                        car.AverageUnitCost);


                    Assert.Equal(
                        PurchaseOrderStatus.Received,
                        orderA.Status);


                    /*
                     * B transaction must have
                     * rolled back completely,
                     * including its status claim.
                     */
                    Assert.Equal(
                        PurchaseOrderStatus.Submitted,
                        orderB.Status);
                }

                /*
                 * If B won:
                 *
                 * ((10 × 800k)
                 *  + (5 × 1,000k))
                 * / 15
                 *
                 * = 866,666.67
                 */
                else
                {
                    Assert.Equal(
                        866_666.67m,
                        car.AverageUnitCost);


                    Assert.Equal(
                        PurchaseOrderStatus.Submitted,
                        orderA.Status);


                    Assert.Equal(
                        PurchaseOrderStatus.Received,
                        orderB.Status);
                }


                Assert.Single(
                    transactions);
            }


            /*
             * This is the key invariant:
             *
             * Number of committed Stock In
             * transactions must exactly equal
             * number of successfully received POs.
             */
            Assert.Equal(
                successful.Count,
                transactions.Count);
        }
        finally
        {
            await DeleteDatabaseAsync(
                options);
        }
    }


    /* =========================================
       Concurrent Receive Runner
    ========================================= */

    private static async Task<
        ReceiveResult>
        RunReceiveAsync(
            DbContextOptions<AppDbContext>
                options,

            int orderId,

            Task startSignal)
    {
        await using var context =
            new AppDbContext(
                options);


        var service =
            CreateService(
                context);


        await startSignal;


        try
        {
            var result =
                await service.ReceiveAsync(
                    orderId);


            return new ReceiveResult(
                orderId,
                result,
                null);
        }
        catch (
            Exception exception)
        {
            return new ReceiveResult(
                orderId,
                false,
                exception);
        }
    }


    /* =========================================
       Purchase Order Service
    ========================================= */

    private static PurchaseOrderService
        CreateService(
            AppDbContext context)
    {
        var auditLogService =
            new Mock<
                IAuditLogService>();


        var notificationService =
            new Mock<
                INotificationService>();


        return new PurchaseOrderService(
            context,
            auditLogService.Object,
            notificationService.Object);
    }


    /* =========================================
       Base Data
    ========================================= */

    private static async Task<
        BaseSeed>
        CreateBaseDataAsync(
            AppDbContext context,

            int quantity,

            decimal? averageUnitCost)
    {
        /*
         * Keep names intentionally short.
         *
         * This avoids the SQL Server
         * MaxLength problem we already found
         * in ManualStockConcurrencyTests.
         */

        var brand =
            new Brand
            {
                Name =
                    "PO Cost Brand",

                Country =
                    "Japan"
            };


        var category =
            new Category
            {
                Name =
                    "PO Cost Cat",

                Description =
                    "PO cost test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "PO Supplier",

                Email =
                    "po@test.com",

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
                    "PO Cost Car",

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


        return new BaseSeed(
            car.Id,
            supplier.Id);
    }


    /* =========================================
       Create Submitted PO
    ========================================= */

    private static async Task<int>
        CreateSubmittedOrderAsync(
            AppDbContext context,

            int supplierId,

            int carId,

            int quantity,

            decimal unitCost,

            string? notes = null)
    {
        var roundedUnitCost =
            decimal.Round(
                unitCost,
                2,
                MidpointRounding
                    .AwayFromZero);


        var lineTotal =
            decimal.Round(
                roundedUnitCost
                *
                quantity,
                2,
                MidpointRounding
                    .AwayFromZero);


        var order =
            new PurchaseOrder
            {
                SupplierId =
                    supplierId,

                OrderDate =
                    DateTime.UtcNow,

                Status =
                    PurchaseOrderStatus.Submitted,

                TotalAmount =
                    lineTotal,

                Notes =
                    notes,

                Items =
                    new List<
                        PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                carId,

                            Quantity =
                                quantity,

                            UnitCost =
                                roundedUnitCost,

                            LineTotal =
                                lineTotal
                        }
                    }
            };


        context.PurchaseOrders
            .Add(
                order);


        await context
            .SaveChangesAsync();


        return order.Id;
    }


    /* =========================================
       SQL Server
    ========================================= */

    private static string
        CreateDatabaseName()
    {
        return
            "AutoStock_PO_Cost_"
            +
            Guid.NewGuid()
                .ToString("N");
    }


    private static
        DbContextOptions<AppDbContext>
        CreateOptions(
            string databaseName)
    {
        var connectionString =
            "Server=localhost;"
            +
            $"Database={databaseName};"
            +
            "Trusted_Connection=True;"
            +
            "TrustServerCertificate=True;"
            +
            "MultipleActiveResultSets=True";


        return new DbContextOptionsBuilder<
                AppDbContext>()
            .UseSqlServer(
                connectionString)
            .Options;
    }


    private static async Task
        DeleteDatabaseAsync(
            DbContextOptions<AppDbContext>
                options)
    {
        await using var context =
            new AppDbContext(
                options);


        await context.Database
            .EnsureDeletedAsync();
    }


    /* =========================================
       Test Models
    ========================================= */

    private sealed record
        BaseSeed(
            int CarId,
            int SupplierId);


    private sealed record
        ReceiveResult(
            int OrderId,
            bool Succeeded,
            Exception? Exception);
}
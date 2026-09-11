using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Helpers;

namespace AutoStock.Tests.Services;

public class PurchaseReportServiceTests
{
    /* =========================================
       Empty Report
    ========================================= */

    [Fact]
    public async Task GetReportAsync_WhenNoPurchaseOrders_ReturnsZeroReport()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var service =
            new PurchaseReportService(
                db.Context);


        /* Act */

        var result =
            await service
                .GetReportAsync();


        /* Assert */

        Assert.Equal(
            0,
            result.Summary.TotalOrders);


        Assert.Equal(
            0,
            result.Summary.DraftOrders);


        Assert.Equal(
            0,
            result.Summary.SubmittedOrders);


        Assert.Equal(
            0,
            result.Summary.ReceivedOrders);


        Assert.Equal(
            0,
            result.Summary.CancelledOrders);


        Assert.Equal(
            0,
            result.Summary.TotalUnitsPurchased);


        Assert.Equal(
            0m,
            result.Summary.TotalPurchaseSpend);


        Assert.Empty(
            result.TopSuppliers);


        Assert.Empty(
            result.TopCars);


        Assert.Empty(
            result.MonthlySpend);
    }


    /* =========================================
       Received Orders Only
    ========================================= */

    [Fact]
    public async Task GetReportAsync_CountsOnlyReceivedOrdersInActualPurchaseMetrics()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /* =====================================
           Reference Data
        ===================================== */

        var brand =
            new Brand
            {
                Name =
                    "Toyota",

                Country =
                    "Japan"
            };


        var category =
            new Category
            {
                Name =
                    "Sedan",

                Description =
                    "Purchase report test"
            };


        var supplierA =
            new Supplier
            {
                Name =
                    "Supplier A",

                Email =
                    "a@test.com",

                PhoneNumber =
                    "01000000001",

                Address =
                    "Cairo"
            };


        var supplierB =
            new Supplier
            {
                Name =
                    "Supplier B",

                Email =
                    "b@test.com",

                PhoneNumber =
                    "01000000002",

                Address =
                    "Giza"
            };


        db.Context.Brands.Add(
            brand);

        db.Context.Categories.Add(
            category);

        db.Context.Suppliers.AddRange(
            supplierA,
            supplierB);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           Cars
        ===================================== */

        var corolla =
            new Car
            {
                Model =
                    "Corolla",

                Year =
                    2026,

                Price =
                    1_200_000m,

                Quantity =
                    10,

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
                    supplierA.Id,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };


        var camry =
            new Car
            {
                Model =
                    "Camry",

                Year =
                    2026,

                Price =
                    1_800_000m,

                Quantity =
                    10,

                ReorderLevel =
                    2,

                Color =
                    "White",

                FuelType =
                    "Petrol",

                Transmission =
                    "Automatic",

                BrandId =
                    brand.Id,

                CategoryId =
                    category.Id,

                SupplierId =
                    supplierB.Id,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };


        db.Context.Cars.AddRange(
            corolla,
            camry);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           Received Order - Supplier A
           January
        ===================================== */

        var receivedOrderA =
            new PurchaseOrder
            {
                SupplierId =
                    supplierA.Id,

                OrderDate =
                    new DateTime(
                        2026,
                        1,
                        10,
                        10,
                        0,
                        0,
                        DateTimeKind.Utc),

                ReceivedAt =
                    new DateTime(
                        2026,
                        1,
                        15,
                        12,
                        0,
                        0,
                        DateTimeKind.Utc),

                Status =
                    PurchaseOrderStatus
                        .Received,

                TotalAmount =
                    1300m,

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                corolla.Id,

                            Quantity =
                                3,

                            UnitCost =
                                100m,

                            LineTotal =
                                300m
                        },

                        new()
                        {
                            CarId =
                                camry.Id,

                            Quantity =
                                2,

                            UnitCost =
                                500m,

                            LineTotal =
                                1000m
                        }
                    }
            };


        /* =====================================
           Submitted Order
           MUST NOT enter actual spend
        ===================================== */

        var submittedOrder =
            new PurchaseOrder
            {
                SupplierId =
                    supplierA.Id,

                OrderDate =
                    new DateTime(
                        2026,
                        1,
                        20,
                        10,
                        0,
                        0,
                        DateTimeKind.Utc),

                Status =
                    PurchaseOrderStatus
                        .Submitted,

                TotalAmount =
                    99_900m,

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                corolla.Id,

                            Quantity =
                                100,

                            UnitCost =
                                999m,

                            LineTotal =
                                99_900m
                        }
                    }
            };


        /* =====================================
           Received Order - Supplier B
           February
        ===================================== */

        var receivedOrderB =
            new PurchaseOrder
            {
                SupplierId =
                    supplierB.Id,

                OrderDate =
                    new DateTime(
                        2026,
                        2,
                        5,
                        10,
                        0,
                        0,
                        DateTimeKind.Utc),

                ReceivedAt =
                    new DateTime(
                        2026,
                        2,
                        10,
                        12,
                        0,
                        0,
                        DateTimeKind.Utc),

                Status =
                    PurchaseOrderStatus
                        .Received,

                TotalAmount =
                    2000m,

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                camry.Id,

                            Quantity =
                                5,

                            UnitCost =
                                400m,

                            LineTotal =
                                2000m
                        }
                    }
            };


        /* =====================================
           Cancelled Order
           MUST NOT enter actual spend
        ===================================== */

        var cancelledOrder =
            new PurchaseOrder
            {
                SupplierId =
                    supplierB.Id,

                OrderDate =
                    new DateTime(
                        2026,
                        2,
                        12,
                        10,
                        0,
                        0,
                        DateTimeKind.Utc),

                Status =
                    PurchaseOrderStatus
                        .Cancelled,

                TotalAmount =
                    5600m,

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                corolla.Id,

                            Quantity =
                                8,

                            UnitCost =
                                700m,

                            LineTotal =
                                5600m
                        }
                    }
            };


        db.Context.PurchaseOrders
            .AddRange(
                receivedOrderA,
                submittedOrder,
                receivedOrderB,
                cancelledOrder);


        await db.Context
            .SaveChangesAsync();


        var service =
            new PurchaseReportService(
                db.Context);


        /* =====================================
           Act
        ===================================== */

        var result =
            await service
                .GetReportAsync();


        /* =====================================
           Status Summary
        ===================================== */

        Assert.Equal(
            4,
            result.Summary.TotalOrders);


        Assert.Equal(
            0,
            result.Summary.DraftOrders);


        Assert.Equal(
            1,
            result.Summary.SubmittedOrders);


        Assert.Equal(
            2,
            result.Summary.ReceivedOrders);


        Assert.Equal(
            1,
            result.Summary.CancelledOrders);


        /* =====================================
           Actual Purchase Metrics

           Received A:
           3 + 2 = 5 units
           1300

           Received B:
           5 units
           2000

           Total:
           10 units
           3300
        ===================================== */

        Assert.Equal(
            10,
            result.Summary
                .TotalUnitsPurchased);


        Assert.Equal(
            3300m,
            result.Summary
                .TotalPurchaseSpend);


        /* =====================================
           Top Suppliers
        ===================================== */

        Assert.Equal(
            2,
            result.TopSuppliers.Count);


        /*
         * Supplier B:
         * 2000 spend
         *
         * Supplier A:
         * 1300 spend
         *
         * Therefore Supplier B is first.
         */

        var topSupplier =
            result.TopSuppliers[0];


        Assert.Equal(
            supplierB.Id,
            topSupplier.SupplierId);


        Assert.Equal(
            "Supplier B",
            topSupplier.SupplierName);


        Assert.Equal(
            1,
            topSupplier.ReceivedOrders);


        Assert.Equal(
            5,
            topSupplier.UnitsReceived);


        Assert.Equal(
            2000m,
            topSupplier.PurchaseValue);


        /* =====================================
           Top Cars
        ===================================== */

        Assert.Equal(
            2,
            result.TopCars.Count);


        /*
         * Camry:
         *
         * Received A = 2
         * Received B = 5
         *
         * Total = 7 units
         * Value = 1000 + 2000
         *       = 3000
         */

        var topCar =
            result.TopCars[0];


        Assert.Equal(
            camry.Id,
            topCar.CarId);


        Assert.Equal(
            "Camry",
            topCar.CarName);


        Assert.Equal(
            7,
            topCar.UnitsPurchased);


        Assert.Equal(
            3000m,
            topCar.PurchaseValue);


        /* =====================================
           Monthly Spend
        ===================================== */

        Assert.Equal(
            2,
            result.MonthlySpend.Count);


        var january =
            result.MonthlySpend[0];


        Assert.Equal(
            2026,
            january.Year);


        Assert.Equal(
            1,
            january.Month);


        Assert.Equal(
            "Jan 2026",
            january.MonthLabel);


        Assert.Equal(
            1,
            january.OrdersReceived);


        Assert.Equal(
            5,
            january.UnitsReceived);


        Assert.Equal(
            1300m,
            january.TotalSpend);


        var february =
            result.MonthlySpend[1];


        Assert.Equal(
            2026,
            february.Year);


        Assert.Equal(
            2,
            february.Month);


        Assert.Equal(
            "Feb 2026",
            february.MonthLabel);


        Assert.Equal(
            1,
            february.OrdersReceived);


        Assert.Equal(
            5,
            february.UnitsReceived);


        Assert.Equal(
            2000m,
            february.TotalSpend);
    }
}
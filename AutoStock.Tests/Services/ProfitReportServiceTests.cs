using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Helpers;

namespace AutoStock.Tests.Services;

public class ProfitReportServiceTests
{
    /* =========================================
       Empty Report
    ========================================= */

    [Fact]
    public async Task GetReportAsync_WhenNoSales_ReturnsZeroReport()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var service =
            new ProfitReportService(
                db.Context);


        /* Act */

        var result =
            await service
                .GetReportAsync();


        /* Assert */

        Assert.Equal(
            0m,
            result.Summary.TotalRevenue);

        Assert.Equal(
            0m,
            result.Summary.RevenueWithKnownCost);

        Assert.Equal(
            0m,
            result.Summary.RevenueWithUnknownCost);

        Assert.Equal(
            0m,
            result.Summary.TotalCogs);

        Assert.Equal(
            0m,
            result.Summary.GrossProfit);

        Assert.Equal(
            0m,
            result.Summary.GrossMarginPercent);

        Assert.Equal(
            0m,
            result.Summary.CostCoveragePercent);

        Assert.Equal(
            0,
            result.Summary.TotalUnitsSold);

        Assert.Equal(
            0,
            result.Summary.UnitsWithKnownCost);

        Assert.Empty(
            result.TopCars);

        Assert.Empty(
            result.MonthlyProfit);
    }


    /* =========================================
       Known + Unknown Cost
    ========================================= */

    [Fact]
    public async Task GetReportAsync_CalculatesProfitAndCostCoverageCorrectly()
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
                    "Profit report test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Profit Test Supplier",

                Email =
                    "supplier@profit.test",

                PhoneNumber =
                    "01000000100",

                Address =
                    "Cairo"
            };


        var customer =
            new Customer
            {
                FullName =
                    "Profit Test Customer",

                PhoneNumber =
                    "01000000101",

                Email =
                    "customer@profit.test",

                Address =
                    "Giza",

                CreatedAt =
                    DateTime.UtcNow
            };


        db.Context.Brands.Add(
            brand);

        db.Context.Categories.Add(
            category);

        db.Context.Suppliers.Add(
            supplier);

        db.Context.Customers.Add(
            customer);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           Cars
        ===================================== */

        var charger =
            new Car
            {
                Model =
                    "Charger",

                Year =
                    2026,

                Price =
                    1200m,

                Quantity =
                    10,

                AverageUnitCost =
                    800m,

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


        var civic =
            new Car
            {
                Model =
                    "Civic",

                Year =
                    2026,

                Price =
                    1000m,

                Quantity =
                    10,

                AverageUnitCost =
                    null,

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
                    supplier.Id,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };


        db.Context.Cars.AddRange(
            charger,
            civic);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           January Sale

           Charger:
           Revenue = 2 × 1050 = 2100
           COGS = 2 × 800 = 1600
           Profit = 500

           Civic:
           Revenue = 1000
           Cost = UNKNOWN

           January Total Revenue = 3100
           Known Revenue = 2100
        ===================================== */

        var januarySale =
            new Sale
            {
                CustomerId =
                    customer.Id,

                SaleDate =
                    new DateTime(
                        2026,
                        1,
                        15,
                        12,
                        0,
                        0,
                        DateTimeKind.Utc),

                PaymentMethod =
                    SalePaymentMethod.Cash,

                TotalAmount =
                    3100m,

                SaleItems =
                    new List<SaleItem>
                    {
                        new()
                        {
                            CarId =
                                charger.Id,

                            Quantity =
                                2,

                            UnitPrice =
                                1050m,

                            LineTotal =
                                2100m,

                            UnitCost =
                                800m,

                            CostOfGoodsSold =
                                1600m,

                            GrossProfit =
                                500m
                        },

                        new()
                        {
                            CarId =
                                civic.Id,

                            Quantity =
                                1,

                            UnitPrice =
                                1000m,

                            LineTotal =
                                1000m,

                            UnitCost =
                                null,

                            CostOfGoodsSold =
                                null,

                            GrossProfit =
                                null
                        }
                    }
            };


        /* =====================================
           February Sale

           Charger:
           Revenue = 1200
           COGS = 800
           Profit = 400
        ===================================== */

        var februarySale =
            new Sale
            {
                CustomerId =
                    customer.Id,

                SaleDate =
                    new DateTime(
                        2026,
                        2,
                        10,
                        12,
                        0,
                        0,
                        DateTimeKind.Utc),

                PaymentMethod =
                    SalePaymentMethod.Card,

                TotalAmount =
                    1200m,

                SaleItems =
                    new List<SaleItem>
                    {
                        new()
                        {
                            CarId =
                                charger.Id,

                            Quantity =
                                1,

                            UnitPrice =
                                1200m,

                            LineTotal =
                                1200m,

                            UnitCost =
                                800m,

                            CostOfGoodsSold =
                                800m,

                            GrossProfit =
                                400m
                        }
                    }
            };


        db.Context.Sales.AddRange(
            januarySale,
            februarySale);


        await db.Context
            .SaveChangesAsync();


        var service =
            new ProfitReportService(
                db.Context);


        /* =====================================
           Act
        ===================================== */

        var result =
            await service
                .GetReportAsync();


        /* =====================================
           Overall

           Total Revenue:
           2100 + 1000 + 1200
           = 4300

           Known Revenue:
           2100 + 1200
           = 3300

           Unknown Revenue:
           1000

           COGS:
           1600 + 800
           = 2400

           Profit:
           500 + 400
           = 900
        ===================================== */

        Assert.Equal(
            4300m,
            result.Summary.TotalRevenue);


        Assert.Equal(
            3300m,
            result.Summary.RevenueWithKnownCost);


        Assert.Equal(
            1000m,
            result.Summary.RevenueWithUnknownCost);


        Assert.Equal(
            2400m,
            result.Summary.TotalCogs);


        Assert.Equal(
            900m,
            result.Summary.GrossProfit);


        /*
         * 900 / 3300 × 100
         * = 27.27%
         */

        Assert.Equal(
            27.27m,
            result.Summary.GrossMarginPercent);


        /*
         * 3300 / 4300 × 100
         * = 76.74%
         */

        Assert.Equal(
            76.74m,
            result.Summary.CostCoveragePercent);


        Assert.Equal(
            4,
            result.Summary.TotalUnitsSold);


        Assert.Equal(
            3,
            result.Summary.UnitsWithKnownCost);


        /* =====================================
           Top Profitable Cars

           Unknown-cost Civic must NOT
           participate in profit ranking.
        ===================================== */

        Assert.Single(
            result.TopCars);


        var topCar =
            result.TopCars[0];


        Assert.Equal(
            charger.Id,
            topCar.CarId);


        Assert.Equal(
            "Charger",
            topCar.CarName);


        Assert.Equal(
            3,
            topCar.UnitsSold);


        Assert.Equal(
            3300m,
            topCar.Revenue);


        Assert.Equal(
            2400m,
            topCar.Cogs);


        Assert.Equal(
            900m,
            topCar.GrossProfit);


        Assert.Equal(
            27.27m,
            topCar.GrossMarginPercent);


        /* =====================================
           Monthly
        ===================================== */

        Assert.Equal(
            2,
            result.MonthlyProfit.Count);


        /* January */

        var january =
            result.MonthlyProfit[0];


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
            3100m,
            january.Revenue);


        Assert.Equal(
            2100m,
            january.RevenueWithKnownCost);


        Assert.Equal(
            1600m,
            january.Cogs);


        Assert.Equal(
            500m,
            january.GrossProfit);


        /*
         * 500 / 2100
         * = 23.81%
         */

        Assert.Equal(
            23.81m,
            january.GrossMarginPercent);


        /*
         * 2100 / 3100
         * = 67.74%
         */

        Assert.Equal(
            67.74m,
            january.CostCoveragePercent);


        /* February */

        var february =
            result.MonthlyProfit[1];


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
            1200m,
            february.Revenue);


        Assert.Equal(
            1200m,
            february.RevenueWithKnownCost);


        Assert.Equal(
            800m,
            february.Cogs);


        Assert.Equal(
            400m,
            february.GrossProfit);


        Assert.Equal(
            33.33m,
            february.GrossMarginPercent);


        Assert.Equal(
            100m,
            february.CostCoveragePercent);
    }
}
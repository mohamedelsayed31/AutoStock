using AutoStock.Application.DTOs.Reports.Profit;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class ProfitReportService
    : IProfitReportService
{
    private readonly AppDbContext
        _context;


    public ProfitReportService(
        AppDbContext context)
    {
        _context =
            context;
    }


    public async Task<ProfitReportDto>
        GetReportAsync()
    {
        /*
         * Load sale item accounting data first.
         *
         * We intentionally calculate decimal
         * aggregates in C# instead of SQL.
         *
         * This keeps the service compatible
         * with both:
         *
         * SQL Server
         * SQLite unit tests
         */

        var saleItems =
            await _context.SaleItems
                .AsNoTracking()
                .Select(
                    item =>
                        new
                        {
                            item.CarId,

                            CarName =
                                item.Car != null
                                    ? item.Car.Model
                                    : string.Empty,

                            item.Quantity,

                            item.LineTotal,

                            item.CostOfGoodsSold,

                            item.GrossProfit,

                            SaleDate =
                                item.Sale != null
                                    ? item.Sale.SaleDate
                                    : DateTime.MinValue
                        })
                .ToListAsync();


        /* =========================================
           Overall Revenue
        ========================================= */

        var totalRevenue =
            saleItems.Sum(
                item =>
                    item.LineTotal);


        var totalUnitsSold =
            saleItems.Sum(
                item =>
                    item.Quantity);


        /* =========================================
           Known Cost Lines
        ========================================= */

        var knownCostItems =
            saleItems
                .Where(
                    item =>
                        item.CostOfGoodsSold
                            .HasValue
                        &&
                        item.GrossProfit
                            .HasValue)
                .ToList();


        var revenueWithKnownCost =
            knownCostItems.Sum(
                item =>
                    item.LineTotal);


        var unitsWithKnownCost =
            knownCostItems.Sum(
                item =>
                    item.Quantity);


        var totalCogs =
            knownCostItems.Sum(
                item =>
                    item.CostOfGoodsSold
                        ?? 0m);


        var grossProfit =
            knownCostItems.Sum(
                item =>
                    item.GrossProfit
                        ?? 0m);


        var revenueWithUnknownCost =
            totalRevenue -
            revenueWithKnownCost;


        /* =========================================
           Gross Margin

           IMPORTANT:

           Margin denominator is only revenue
           with known cost.

           We must not mix unknown-cost revenue
           into the profitability calculation.
        ========================================= */

        var grossMarginPercent =
            revenueWithKnownCost > 0m
                ? decimal.Round(
                    grossProfit
                    /
                    revenueWithKnownCost
                    *
                    100m,
                    2,
                    MidpointRounding.AwayFromZero)
                : 0m;


        /* =========================================
           Cost Coverage

           Example:

           Total Revenue = 1,000,000

           Known Cost Revenue = 800,000

           Coverage = 80%
        ========================================= */

        var costCoveragePercent =
            totalRevenue > 0m
                ? decimal.Round(
                    revenueWithKnownCost
                    /
                    totalRevenue
                    *
                    100m,
                    2,
                    MidpointRounding.AwayFromZero)
                : 0m;


        /* =========================================
           Top Profitable Cars

           Only accounting-covered sale lines
           participate in profit ranking.
        ========================================= */

        var topCars =
            knownCostItems
                .GroupBy(
                    item =>
                        new
                        {
                            item.CarId,

                            item.CarName
                        })
                .Select(
                    group =>
                    {
                        var revenue =
                            group.Sum(
                                item =>
                                    item.LineTotal);


                        var cogs =
                            group.Sum(
                                item =>
                                    item.CostOfGoodsSold
                                    ?? 0m);


                        var profit =
                            group.Sum(
                                item =>
                                    item.GrossProfit
                                    ?? 0m);


                        var margin =
                            revenue > 0m
                                ? decimal.Round(
                                    profit
                                    /
                                    revenue
                                    *
                                    100m,
                                    2,
                                    MidpointRounding
                                        .AwayFromZero)
                                : 0m;


                        return new TopProfitableCarDto
                        {
                            CarId =
                                group.Key.CarId,

                            CarName =
                                group.Key.CarName,

                            UnitsSold =
                                group.Sum(
                                    item =>
                                        item.Quantity),

                            Revenue =
                                revenue,

                            Cogs =
                                cogs,

                            GrossProfit =
                                profit,

                            GrossMarginPercent =
                                margin
                        };
                    })
                .OrderByDescending(
                    car =>
                        car.GrossProfit)
                .ThenByDescending(
                    car =>
                        car.Revenue)
                .Take(5)
                .ToList();


        /* =========================================
           Monthly Profit
        ========================================= */

        var monthlyProfit =
            saleItems
                .Where(
                    item =>
                        item.SaleDate !=
                        DateTime.MinValue)
                .GroupBy(
                    item =>
                        new
                        {
                            Year =
                                item.SaleDate.Year,

                            Month =
                                item.SaleDate.Month
                        })
                .OrderBy(
                    group =>
                        group.Key.Year)
                .ThenBy(
                    group =>
                        group.Key.Month)
                .Select(
                    group =>
                    {
                        var monthItems =
                            group.ToList();


                        var monthRevenue =
                            monthItems.Sum(
                                item =>
                                    item.LineTotal);


                        var coveredItems =
                            monthItems
                                .Where(
                                    item =>
                                        item.CostOfGoodsSold
                                            .HasValue
                                        &&
                                        item.GrossProfit
                                            .HasValue)
                                .ToList();


                        var coveredRevenue =
                            coveredItems.Sum(
                                item =>
                                    item.LineTotal);


                        var monthCogs =
                            coveredItems.Sum(
                                item =>
                                    item.CostOfGoodsSold
                                    ?? 0m);


                        var monthProfit =
                            coveredItems.Sum(
                                item =>
                                    item.GrossProfit
                                    ?? 0m);


                        var margin =
                            coveredRevenue > 0m
                                ? decimal.Round(
                                    monthProfit
                                    /
                                    coveredRevenue
                                    *
                                    100m,
                                    2,
                                    MidpointRounding
                                        .AwayFromZero)
                                : 0m;


                        var coverage =
                            monthRevenue > 0m
                                ? decimal.Round(
                                    coveredRevenue
                                    /
                                    monthRevenue
                                    *
                                    100m,
                                    2,
                                    MidpointRounding
                                        .AwayFromZero)
                                : 0m;


                        return new MonthlyProfitDto
                        {
                            Year =
                                group.Key.Year,

                            Month =
                                group.Key.Month,

                            MonthLabel =
                                new DateTime(
                                    group.Key.Year,
                                    group.Key.Month,
                                    1)
                                    .ToString(
                                        "MMM yyyy"),

                            Revenue =
                                monthRevenue,

                            RevenueWithKnownCost =
                                coveredRevenue,

                            Cogs =
                                monthCogs,

                            GrossProfit =
                                monthProfit,

                            GrossMarginPercent =
                                margin,

                            CostCoveragePercent =
                                coverage
                        };
                    })
                .ToList();


        /* =========================================
           Final Report
        ========================================= */

        return new ProfitReportDto
        {
            Summary =
                new ProfitSummaryDto
                {
                    TotalRevenue =
                        totalRevenue,

                    RevenueWithKnownCost =
                        revenueWithKnownCost,

                    RevenueWithUnknownCost =
                        revenueWithUnknownCost,

                    TotalCogs =
                        totalCogs,

                    GrossProfit =
                        grossProfit,

                    GrossMarginPercent =
                        grossMarginPercent,

                    CostCoveragePercent =
                        costCoveragePercent,

                    TotalUnitsSold =
                        totalUnitsSold,

                    UnitsWithKnownCost =
                        unitsWithKnownCost
                },


            TopCars =
                topCars,


            MonthlyProfit =
                monthlyProfit
        };
    }
}
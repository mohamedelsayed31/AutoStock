using AutoStock.Application.DTOs.Reports.Sales;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class SalesReportService
    : ISalesReportService
{
    private readonly AppDbContext _context;


    public SalesReportService(
        AppDbContext context)
    {
        _context = context;
    }


    public async Task<SalesReportDto>
        GetReportAsync()
    {
        /* =========================================
           Total Sales
        ========================================= */

        var totalSales =
            await _context.Sales
                .AsNoTracking()
                .CountAsync();


        /* =========================================
           Total Revenue
        ========================================= */

        var totalRevenue =
            await _context.Sales
                .AsNoTracking()
                .SumAsync(
                    sale =>
                        (decimal?)
                        sale.TotalAmount)
            ?? 0m;


        /* =========================================
           Total Cars Sold
        ========================================= */

        var totalCarsSold =
            await _context.SaleItems
                .AsNoTracking()
                .SumAsync(
                    item =>
                        (int?)
                        item.Quantity)
            ?? 0;


        /* =========================================
           Average Sale Value
        ========================================= */

        var averageSaleValue =
            totalSales == 0
                ? 0m
                : decimal.Round(
                    totalRevenue /
                    totalSales,
                    2,
                    MidpointRounding.AwayFromZero
                );


        /* =========================================
           Top Selling Cars
        ========================================= */

        var topSellingCars =
            await _context.SaleItems
                .AsNoTracking()

                .Join(
                    _context.Cars
                        .AsNoTracking(),

                    item =>
                        item.CarId,

                    car =>
                        car.Id,

                    (
                        item,
                        car
                    ) =>
                        new
                        {
                            Item = item,
                            Car = car
                        }
                )

                .GroupBy(
                    record =>
                        new
                        {
                            record.Item.CarId,
                            record.Car.Model
                        }
                )

                .Select(
                    group =>
                        new TopSellingCarDto
                        {
                            CarId =
                                group.Key.CarId,

                            CarName =
                                group.Key.Model,

                            QuantitySold =
                                group.Sum(
                                    record =>
                                        record.Item.Quantity
                                ),

                            Revenue =
                                group.Sum(
                                    record =>
                                        record.Item.LineTotal
                                )
                        }
                )

                .OrderByDescending(
                    car =>
                        car.QuantitySold
                )

                .ThenByDescending(
                    car =>
                        car.Revenue
                )

                .Take(5)

                .ToListAsync();


        /* =========================================
           Sales By Payment Method
        ========================================= */

        var salesByPaymentMethod =
            await _context.Sales
                .AsNoTracking()

                .GroupBy(
                    sale =>
                        sale.PaymentMethod
                )

                .Select(
                    group =>
                        new PaymentMethodSalesDto
                        {
                            PaymentMethod =
                                group.Key,

                            SalesCount =
                                group.Count(),

                            Revenue =
                                group.Sum(
                                    sale =>
                                        sale.TotalAmount
                                )
                        }
                )

                .OrderByDescending(
                    method =>
                        method.SalesCount
                )

                .ToListAsync();


        /* =========================================
           Final Report
        ========================================= */

        return new SalesReportDto
        {
            Summary =
                new SalesSummaryDto
                {
                    TotalSales =
                        totalSales,

                    TotalRevenue =
                        totalRevenue,

                    TotalCarsSold =
                        totalCarsSold,

                    AverageSaleValue =
                        averageSaleValue
                },

            TopSellingCars =
                topSellingCars,

            SalesByPaymentMethod =
                salesByPaymentMethod
        };
    }
}
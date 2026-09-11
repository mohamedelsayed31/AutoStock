using AutoStock.Application.DTOs.Reports.Purchases;
using AutoStock.Application.Interface;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class PurchaseReportService
    : IPurchaseReportService
{
    private readonly AppDbContext _context;


    public PurchaseReportService(
        AppDbContext context)
    {
        _context = context;
    }


    public async Task<PurchaseReportDto>
        GetReportAsync()
    {
        /* =========================================
           Status Counts
        ========================================= */

        var totalOrders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .CountAsync();


        var draftOrders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .CountAsync(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus.Draft);


        var submittedOrders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .CountAsync(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus.Submitted);


        var receivedOrdersCount =
            await _context.PurchaseOrders
                .AsNoTracking()
                .CountAsync(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus.Received);


        var cancelledOrders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .CountAsync(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus.Cancelled);


        /* =========================================
           Load Received Orders

           Important:
           SQLite cannot execute SUM(decimal)
           reliably in SQL.

           So we load only Received orders first,
           then calculate decimal totals in C#.
        ========================================= */

        var receivedOrders =
            await _context.PurchaseOrders
                .AsNoTracking()
                .Where(
                    order =>
                        order.Status ==
                        PurchaseOrderStatus.Received)
                .Include(
                    order =>
                        order.Supplier)
                .Include(
                    order =>
                        order.Items)
                    .ThenInclude(
                        item =>
                            item.Car)
                .ToListAsync();


        /* =========================================
           Actual Purchase Metrics

           Received Orders ONLY
        ========================================= */

        var totalPurchaseSpend =
            receivedOrders
                .Sum(
                    order =>
                        order.TotalAmount);


        var totalUnitsPurchased =
            receivedOrders
                .SelectMany(
                    order =>
                        order.Items)
                .Sum(
                    item =>
                        item.Quantity);


        /* =========================================
           Top Suppliers

           Received Orders ONLY
        ========================================= */

        var topSuppliers =
            receivedOrders
                .GroupBy(
                    order =>
                        new
                        {
                            order.SupplierId,

                            SupplierName =
                                order.Supplier?.Name
                                ?? string.Empty
                        })
                .Select(
                    group =>
                        new TopPurchaseSupplierDto
                        {
                            SupplierId =
                                group.Key.SupplierId,

                            SupplierName =
                                group.Key.SupplierName,

                            ReceivedOrders =
                                group.Count(),

                            UnitsReceived =
                                group
                                    .SelectMany(
                                        order =>
                                            order.Items)
                                    .Sum(
                                        item =>
                                            item.Quantity),

                            PurchaseValue =
                                group.Sum(
                                    order =>
                                        order.TotalAmount)
                        })
                .OrderByDescending(
                    supplier =>
                        supplier.PurchaseValue)
                .ThenByDescending(
                    supplier =>
                        supplier.UnitsReceived)
                .Take(5)
                .ToList();


        /* =========================================
           Top Purchased Cars

           Received Orders ONLY
        ========================================= */

        var topCars =
            receivedOrders
                .SelectMany(
                    order =>
                        order.Items)
                .GroupBy(
                    item =>
                        new
                        {
                            item.CarId,

                            CarName =
                                item.Car?.Model
                                ?? string.Empty
                        })
                .Select(
                    group =>
                        new TopPurchasedCarDto
                        {
                            CarId =
                                group.Key.CarId,

                            CarName =
                                group.Key.CarName,

                            UnitsPurchased =
                                group.Sum(
                                    item =>
                                        item.Quantity),

                            PurchaseValue =
                                group.Sum(
                                    item =>
                                        item.LineTotal)
                        })
                .OrderByDescending(
                    car =>
                        car.UnitsPurchased)
                .ThenByDescending(
                    car =>
                        car.PurchaseValue)
                .Take(5)
                .ToList();


        /* =========================================
           Monthly Purchase Spend

           Based on ReceivedAt
           Received Orders ONLY
        ========================================= */

        var monthlySpend =
            receivedOrders
                .Where(
                    order =>
                        order.ReceivedAt
                            .HasValue)
                .GroupBy(
                    order =>
                        new
                        {
                            Year =
                                order.ReceivedAt!
                                    .Value.Year,

                            Month =
                                order.ReceivedAt
                                    .Value.Month
                        })
                .OrderBy(
                    group =>
                        group.Key.Year)
                .ThenBy(
                    group =>
                        group.Key.Month)
                .Select(
                    group =>
                        new MonthlyPurchaseSpendDto
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

                            OrdersReceived =
                                group.Count(),

                            UnitsReceived =
                                group
                                    .SelectMany(
                                        order =>
                                            order.Items)
                                    .Sum(
                                        item =>
                                            item.Quantity),

                            TotalSpend =
                                group.Sum(
                                    order =>
                                        order.TotalAmount)
                        })
                .ToList();


        /* =========================================
           Final Report
        ========================================= */

        return new PurchaseReportDto
        {
            Summary =
                new PurchaseSummaryDto
                {
                    TotalOrders =
                        totalOrders,

                    DraftOrders =
                        draftOrders,

                    SubmittedOrders =
                        submittedOrders,

                    ReceivedOrders =
                        receivedOrdersCount,

                    CancelledOrders =
                        cancelledOrders,

                    TotalUnitsPurchased =
                        totalUnitsPurchased,

                    TotalPurchaseSpend =
                        totalPurchaseSpend
                },


            TopSuppliers =
                topSuppliers,


            TopCars =
                topCars,


            MonthlySpend =
                monthlySpend
        };
    }
}
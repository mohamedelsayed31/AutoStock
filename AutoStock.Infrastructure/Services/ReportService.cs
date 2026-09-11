using AutoStock.Application.DTOs.Reports;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;


    public ReportService(
        AppDbContext context)
    {
        _context = context;
    }


    public async Task<
        List<InventoryReportItemDto>>
        GetInventoryReportAsync()
    {
        return await _context.Cars
            .AsNoTracking()
            .Where(car =>
                car.IsActive)
            .OrderBy(car =>
                car.Brand!.Name)
            .ThenBy(car =>
                car.Model)
            .Select(car =>
                new InventoryReportItemDto
                {
                    CarId =
                        car.Id,

                    Model =
                        car.Model,

                    BrandName =
                        car.Brand!.Name,

                    CategoryName =
                        car.Category!.Name,

                    SupplierName =
                        car.Supplier!.Name,

                    Year =
                        car.Year,

                    Price =
                        car.Price,

                    Quantity =
                        car.Quantity,

                    ReorderLevel =
                        car.ReorderLevel,

                    StockStatus =
                        car.Quantity == 0
                            ? "Out of Stock"
                            : car.Quantity <=
                              car.ReorderLevel
                                ? "Low Stock"
                                : "In Stock",

                    InventoryValue =
                        car.Price *
                        car.Quantity
                })
            .ToListAsync();
    }


    public async Task<
        List<LowStockReportItemDto>>
        GetLowStockReportAsync()
    {
        return await _context.Cars
            .AsNoTracking()
            .Where(car =>
                car.IsActive &&
                car.Quantity <=
                car.ReorderLevel)
            .OrderBy(car =>
                car.Quantity)
            .ThenBy(car =>
                car.Model)
            .Select(car =>
                new LowStockReportItemDto
                {
                    CarId =
                        car.Id,

                    Model =
                        car.Model,

                    BrandName =
                        car.Brand!.Name,

                    Quantity =
                        car.Quantity,

                    ReorderLevel =
                        car.ReorderLevel,

                    NeededQuantity =
                        car.ReorderLevel -
                        car.Quantity,

                    StockStatus =
                        car.Quantity == 0
                            ? "Out of Stock"
                            : "Low Stock"
                })
            .ToListAsync();
    }


    public async Task<
        StockMovementSummaryDto>
        GetStockMovementSummaryAsync(
            DateTime? startDate,
            DateTime? endDate)
    {
        var query =
            _context
                .StockTransactions
                .AsNoTracking()
                .AsQueryable();


        if (startDate.HasValue)
        {
            query =
                query.Where(
                    transaction =>
                        transaction
                            .TransactionDate >=
                        startDate.Value);
        }


        if (endDate.HasValue)
        {
            var inclusiveEndDate =
                endDate.Value.Date
                    .AddDays(1);

            query =
                query.Where(
                    transaction =>
                        transaction
                            .TransactionDate <
                        inclusiveEndDate);
        }


        var totalTransactions =
            await query.CountAsync();


        var totalStockIn =
            await query
                .Where(transaction =>
                    transaction
                        .TransactionType ==
                    "Stock In")
                .SumAsync(
                    transaction =>
                        (int?)
                        transaction.Quantity)
                ?? 0;


        var totalStockOut =
            await query
                .Where(transaction =>
                    transaction
                        .TransactionType ==
                    "Stock Out")
                .SumAsync(
                    transaction =>
                        (int?)
                        transaction.Quantity)
                ?? 0;


        return new StockMovementSummaryDto
        {
            TotalTransactions =
                totalTransactions,

            TotalStockIn =
                totalStockIn,

            TotalStockOut =
                totalStockOut,

            NetMovement =
                totalStockIn -
                totalStockOut,

            StartDate =
                startDate,

            EndDate =
                endDate
        };
    }
}
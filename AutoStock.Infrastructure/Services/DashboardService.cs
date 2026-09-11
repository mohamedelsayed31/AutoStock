using AutoStock.Application.DTOs.Dashboard;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;


    public DashboardService(
        AppDbContext context)
    {
        _context = context;
    }


    public async Task<DashboardDto>
        GetDashboardAsync()
    {
        var activeCars =
            _context.Cars
                .AsNoTracking()
                .Where(car =>
                    car.IsActive);


        var totalCars =
            await activeCars
                .CountAsync();


        var totalStock =
            await activeCars
                .SumAsync(car =>
                    car.Quantity);


        var lowStockCars =
            await activeCars
                .CountAsync(car =>
                    car.Quantity > 0 &&
                    car.Quantity <=
                    car.ReorderLevel);


        var outOfStockCars =
            await activeCars
                .CountAsync(car =>
                    car.Quantity == 0);


        var totalInventoryValue =
            await activeCars
                .SumAsync(car =>
                    car.Price *
                    car.Quantity);


        var totalBrands =
            await _context.Brands
                .AsNoTracking()
                .CountAsync();


        var totalCategories =
            await _context.Categories
                .AsNoTracking()
                .CountAsync();


        var totalSuppliers =
            await _context.Suppliers
                .AsNoTracking()
                .CountAsync();


        var recentTransactions =
            await _context
                .StockTransactions
                .AsNoTracking()
                .OrderByDescending(
                    transaction =>
                        transaction
                            .TransactionDate)
                .Take(5)
                .Select(
                    transaction =>
                        new DashboardRecentTransactionDto
                        {
                            Id =
                                transaction.Id,

                            CarId =
                                transaction.CarId,

                            CarModel =
                                transaction.Car!
                                    .Model,

                            TransactionType =
                                transaction
                                    .TransactionType,

                            Quantity =
                                transaction
                                    .Quantity,

                            TransactionDate =
                                transaction
                                    .TransactionDate,

                            Notes =
                                transaction
                                    .Notes
                        })
                .ToListAsync();


        var stockAlerts =
            await activeCars
                .Where(car =>
                    car.Quantity <=
                    car.ReorderLevel)
                .OrderBy(car =>
                    car.Quantity)
                .ThenBy(car =>
                    car.Model)
                .Take(5)
                .Select(car =>
                    new DashboardStockAlertDto
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

                        StockStatus =
                            car.Quantity == 0
                                ? "Out of Stock"
                                : "Low Stock"
                    })
                .ToListAsync();


        return new DashboardDto
        {
            TotalCars =
                totalCars,

            TotalStock =
                totalStock,

            LowStockCars =
                lowStockCars,

            OutOfStockCars =
                outOfStockCars,

            TotalBrands =
                totalBrands,

            TotalCategories =
                totalCategories,

            TotalSuppliers =
                totalSuppliers,

            TotalInventoryValue =
                totalInventoryValue,

            RecentTransactions =
                recentTransactions,

            StockAlerts =
                stockAlerts
        };
    }
}
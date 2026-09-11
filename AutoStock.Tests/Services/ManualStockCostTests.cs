using AutoStock.Application.DTOs.Stock;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class ManualStockCostTests
{
    /* =========================================
       Missing Unit Cost
    ========================================= */

    [Fact]
    public async Task StockInAsync_WithoutUnitCost_ThrowsArgumentException()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 10,
                averageUnitCost: 800_000m);


        /*
         * Stock In does not create
         * notifications, so the notification
         * dependency is not used in these tests.
         */
        var service =
            new StockService(
                db.Context,
                null!);


        var dto =
            new StockOperationDto
            {
                Quantity = 5,

                UnitCost = null,

                Notes =
                    "Manual restock"
            };


        var exception =
            await Assert.ThrowsAsync<
                ArgumentException>(
                () =>
                    service.StockInAsync(
                        car.Id,
                        dto));


        Assert.Contains(
            "unit cost",
            exception.Message,
            StringComparison
                .OrdinalIgnoreCase);
    }


    /* =========================================
       Empty Inventory
    ========================================= */

    [Fact]
    public async Task StockInAsync_WhenInventoryIsEmpty_SetsIncomingCostAsAverageCost()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 0,

                /*
                 * Could contain an old historical
                 * value. When quantity is zero,
                 * the new batch starts a clean
                 * cost basis.
                 */
                averageUnitCost:
                    700_000m);


        var service =
            new StockService(
                db.Context,
                null!);


        var dto =
            new StockOperationDto
            {
                Quantity =
                    5,

                UnitCost =
                    900_000m,

                Notes =
                    "New inventory batch"
            };


        var transaction =
            await service
                .StockInAsync(
                    car.Id,
                    dto);


        /*
         * ExecuteUpdateAsync bypasses
         * EF's tracked entity state.
         *
         * Clear the tracker before reading
         * the updated row.
         */
        db.Context
            .ChangeTracker
            .Clear();


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    current =>
                        current.Id ==
                        car.Id);


        Assert.Equal(
            5,
            updatedCar.Quantity);


        Assert.Equal(
            900_000m,
            updatedCar
                .AverageUnitCost);


        Assert.Equal(
            "Stock In",
            transaction
                .TransactionType);


        Assert.Equal(
            5,
            transaction.Quantity);


        var savedTransaction =
            await db.Context
                .StockTransactions
                .AsNoTracking()
                .SingleAsync();


        Assert.Equal(
            car.Id,
            savedTransaction.CarId);


        Assert.Equal(
            "Stock In",
            savedTransaction
                .TransactionType);


        Assert.Equal(
            5,
            savedTransaction.Quantity);
    }


    /* =========================================
       Weighted Average
    ========================================= */

    [Fact]
    public async Task StockInAsync_WithKnownExistingCost_CalculatesWeightedAverageCost()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /*
         * Existing:
         *
         * 10 × 800,000
         * = 8,000,000
         */
        var car =
            await CreateCarAsync(
                db.Context,
                quantity:
                    10,

                averageUnitCost:
                    800_000m);


        var service =
            new StockService(
                db.Context,
                null!);


        /*
         * Incoming:
         *
         * 5 × 900,000
         * = 4,500,000
         *
         * Total Cost
         * = 12,500,000
         *
         * Total Quantity
         * = 15
         *
         * Weighted Average
         * = 833,333.33
         */
        var dto =
            new StockOperationDto
            {
                Quantity =
                    5,

                UnitCost =
                    900_000m,

                Notes =
                    "Manual weighted average test"
            };


        await service
            .StockInAsync(
                car.Id,
                dto);


        db.Context
            .ChangeTracker
            .Clear();


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    current =>
                        current.Id ==
                        car.Id);


        Assert.Equal(
            15,
            updatedCar.Quantity);


        Assert.Equal(
            833_333.33m,
            updatedCar
                .AverageUnitCost);


        var transaction =
            await db.Context
                .StockTransactions
                .AsNoTracking()
                .SingleAsync();


        Assert.Equal(
            "Stock In",
            transaction
                .TransactionType);


        Assert.Equal(
            5,
            transaction.Quantity);


        Assert.Equal(
            "Manual weighted average test",
            transaction.Notes);
    }


    /* =========================================
       Legacy Unknown Cost
    ========================================= */

    [Fact]
    public async Task StockInAsync_WhenExistingInventoryCostIsUnknown_KeepsAverageCostUnknown()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /*
         * Legacy inventory:
         *
         * Quantity exists,
         * but its historical acquisition
         * cost is unknown.
         */
        var car =
            await CreateCarAsync(
                db.Context,
                quantity:
                    10,

                averageUnitCost:
                    null);


        var service =
            new StockService(
                db.Context,
                null!);


        var dto =
            new StockOperationDto
            {
                Quantity =
                    5,

                UnitCost =
                    900_000m,

                Notes =
                    "Restock legacy inventory"
            };


        await service
            .StockInAsync(
                car.Id,
                dto);


        db.Context
            .ChangeTracker
            .Clear();


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    current =>
                        current.Id ==
                        car.Id);


        Assert.Equal(
            15,
            updatedCar.Quantity);


        /*
         * Important:
         *
         * We know the cost of the 5 new
         * units, but not the original 10.
         *
         * Therefore:
         *
         * AverageUnitCost must NOT become
         * 900,000 or any invented average.
         */
        Assert.Null(
            updatedCar
                .AverageUnitCost);


        Assert.Single(
            await db.Context
                .StockTransactions
                .AsNoTracking()
                .ToListAsync());
    }


    /* =========================================
       Stock Out Must Preserve Cost
    ========================================= */

    [Fact]
    public async Task StockOutAsync_DoesNotChangeAverageUnitCost()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var car =
            await CreateCarAsync(
                db.Context,
                quantity:
                    10,

                averageUnitCost:
                    825_000m);


        /*
         * Quantity 10 -> 8 does not cross
         * a low-stock threshold, so the
         * notification dependency is not used.
         */
        var service =
            new StockService(
                db.Context,
                null!);


        var dto =
            new StockOperationDto
            {
                Quantity =
                    2,

                Notes =
                    "Manual stock adjustment"
            };


        await service
            .StockOutAsync(
                car.Id,
                dto);


        db.Context
            .ChangeTracker
            .Clear();


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    current =>
                        current.Id ==
                        car.Id);


        Assert.Equal(
            8,
            updatedCar.Quantity);


        Assert.Equal(
            825_000m,
            updatedCar
                .AverageUnitCost);
    }


    /* =========================================
       Test Data
    ========================================= */

    private static async Task<Car>
        CreateCarAsync(
            AutoStock.Infrastructure.Data
                .AppDbContext context,

            int quantity,

            decimal? averageUnitCost)
    {
        var brand =
            new Brand
            {
                Name =
                    $"Test Brand {Guid.NewGuid():N}",

                Country =
                    "Test Country"
            };


        var category =
            new Category
            {
                Name =
                    $"Test Category {Guid.NewGuid():N}",

                Description =
                    "Manual stock cost tests"
            };


        var supplier =
            new Supplier
            {
                Name =
                    $"Test Supplier {Guid.NewGuid():N}",

                Email =
                    $"{Guid.NewGuid():N}@test.com",

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
                    $"Cost Test Car {Guid.NewGuid():N}",

                Year =
                    2026,

                Price =
                    1_200_000m,

                Quantity =
                    quantity,

                AverageUnitCost =
                    averageUnitCost,

                /*
                 * Keep it low enough that
                 * StockOut 10 -> 8 does not
                 * create a notification.
                 */
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


        return car;
    }
}
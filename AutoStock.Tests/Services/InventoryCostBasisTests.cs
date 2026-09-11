using AutoStock.Application.DTOs.InventoryCost;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace AutoStock.Tests.Services;

public class InventoryCostBasisTests
{
    [Fact]
    public async Task SetCostBasis_WhenLegacyCostUnknown_SetsAverageCost()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 4,
                averageUnitCost: null);

        var audit =
            new Mock<IAuditLogService>();

        var service =
            new InventoryCostService(
                db.Context,
                audit.Object);


        var result =
            await service.SetCostBasisAsync(
                car.Id,
                new SetInventoryCostBasisDto
                {
                    UnitCost =
                        6_200_000m,

                    Reason =
                        "Opening inventory reconciliation"
                });


        Assert.Equal(
            6_200_000m,
            result.AverageUnitCost);

        Assert.Equal(
            24_800_000m,
            result.InventoryValue);

        Assert.Equal(
            4,
            result.Quantity);


        var storedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                        car.Id);


        Assert.Equal(
            6_200_000m,
            storedCar.AverageUnitCost);
    }


    [Fact]
    public async Task SetCostBasis_WhenCostAlreadyKnown_RejectsOverwrite()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 4,
                averageUnitCost: 5_500_000m);

        var audit =
            new Mock<IAuditLogService>();

        var service =
            new InventoryCostService(
                db.Context,
                audit.Object);


        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () =>
                    service.SetCostBasisAsync(
                        car.Id,
                        new SetInventoryCostBasisDto
                        {
                            UnitCost =
                                6_200_000m
                        }));


        Assert.Contains(
            "already known",
            exception.Message,
            StringComparison.OrdinalIgnoreCase);
    }


    [Fact]
    public async Task SetCostBasis_WhenStockIsZero_RejectsOperation()
    {
        await using var db =
            await TestDbFactory.CreateAsync();

        var car =
            await CreateCarAsync(
                db.Context,
                quantity: 0,
                averageUnitCost: null);

        var audit =
            new Mock<IAuditLogService>();

        var service =
            new InventoryCostService(
                db.Context,
                audit.Object);


        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () =>
                    service.SetCostBasisAsync(
                        car.Id,
                        new SetInventoryCostBasisDto
                        {
                            UnitCost =
                                6_200_000m
                        }));


        Assert.Contains(
            "greater than zero",
            exception.Message,
            StringComparison.OrdinalIgnoreCase);
    }


    private static async Task<Car>
        CreateCarAsync(
            AutoStock.Infrastructure.Data.AppDbContext context,
            int quantity,
            decimal? averageUnitCost)
    {
        var brand =
            new Brand
            {
                Name =
                    "CostBasis Brand",

                Country =
                    "Germany"
            };


        var category =
            new Category
            {
                Name =
                    "CostBasis Cat",

                Description =
                    "Cost basis tests"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "CostBasis Supplier",

                Email =
                    "costbasis@test.com",

                PhoneNumber =
                    "01000000003",

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
                    "Cost Basis Car",

                Year =
                    2026,

                Price =
                    7_000_000m,

                Quantity =
                    quantity,

                AverageUnitCost =
                    averageUnitCost,

                ReorderLevel =
                    1,

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

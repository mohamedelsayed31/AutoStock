using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;

namespace AutoStock.Tests.Helpers;

public static class PurchaseOrderTestData
{
    public static async Task<(
        Supplier Supplier,
        Car Car)>
        CreateSupplierAndCarAsync(
            AppDbContext context,
            int quantity = 5,
            int reorderLevel = 2)
    {
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
                    "Purchase order test category"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Test Auto Supplier",

                Email =
                    "supplier@test.com",

                PhoneNumber =
                    "01000000000",

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
                    "Corolla",

                Year =
                    2026,

                Price =
                    1_200_000m,

                Quantity =
                    quantity,

                ReorderLevel =
                    reorderLevel,

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


        return (
            supplier,
            car);
    }
}
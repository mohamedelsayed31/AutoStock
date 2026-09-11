using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Helpers;

public static class SaleTestData
{
    public static async Task<Customer>
        CreateCustomerAsync(
            AppDbContext context)
    {
        var customer =
            new Customer
            {
                FullName =
                    "Test Customer",

                PhoneNumber =
                    "01000000000",

                Email =
                    "customer@test.com",

                Address =
                    "Cairo",

                CreatedAt =
                    DateTime.UtcNow
            };


        context.Customers.Add(
            customer);


        await context
            .SaveChangesAsync();


        return customer;
    }


    public static async Task<Car>
        CreateCarAsync(
            AppDbContext context,
            int quantity = 5,
            int reorderLevel = 2,
            decimal price = 1_000_000m)
    {
        /*
         * For these service tests we only need
         * the Car itself.
         *
         * Disable SQLite FK checks because
         * Brand/Category/Supplier behavior is
         * outside the scope of SaleService tests.
         */

        await context.Database
            .ExecuteSqlRawAsync(
                "PRAGMA foreign_keys = OFF;");


        var car =
            new Car
            {
                Model =
                    "Test Car",

                Year =
                    2026,

                Price =
                    price,

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

                CreatedAt =
                    DateTime.UtcNow,

                IsActive =
                    true,

                BrandId =
                    1,

                CategoryId =
                    1,

                SupplierId =
                    1
            };


        context.Cars.Add(
            car);


        await context
            .SaveChangesAsync();


        return car;
    }
}
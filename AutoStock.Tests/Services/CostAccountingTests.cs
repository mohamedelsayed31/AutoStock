using AutoStock.Application.DTOs.Sales;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class CostAccountingTests
{
    /* =========================================
       Purchase Receive
       Weighted Average Cost
    ========================================= */

    [Fact]
    public async Task ReceivePurchaseOrder_CalculatesWeightedAverageUnitCost()
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
                    "Cost accounting test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Cost Test Supplier",

                Email =
                    "supplier@test.com",

                PhoneNumber =
                    "01000000001",

                Address =
                    "Cairo"
            };


        db.Context.Brands.Add(
            brand);

        db.Context.Categories.Add(
            category);

        db.Context.Suppliers.Add(
            supplier);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           Existing Inventory

           10 × 800
           = 8,000
        ===================================== */

        var car =
            new Car
            {
                Model =
                    "Corolla",

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


        db.Context.Cars.Add(
            car);


        await db.Context
            .SaveChangesAsync();


        /* =====================================
           Incoming Purchase

           5 × 900
           = 4,500

           New Quantity:
           10 + 5 = 15

           New Average Cost:

           (8,000 + 4,500) / 15
           = 833.33
        ===================================== */

        var purchaseOrder =
            new PurchaseOrder
            {
                SupplierId =
                    supplier.Id,

                OrderDate =
                    DateTime.UtcNow,

                Status =
                    PurchaseOrderStatus.Submitted,

                TotalAmount =
                    4500m,

                Items =
                    new List<PurchaseOrderItem>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                5,

                            UnitCost =
                                900m,

                            LineTotal =
                                4500m
                        }
                    }
            };


        db.Context.PurchaseOrders.Add(
            purchaseOrder);


        await db.Context
            .SaveChangesAsync();


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        /* =====================================
           Act
        ===================================== */

        var received =
            await service
                .ReceiveAsync(
                    purchaseOrder.Id);


        /* =====================================
           Assert
        ===================================== */

        Assert.True(
            received);


        db.Context.ChangeTracker
            .Clear();


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    storedCar =>
                        storedCar.Id ==
                        car.Id);


        Assert.Equal(
            15,
            updatedCar.Quantity);


        Assert.Equal(
            833.33m,
            updatedCar.AverageUnitCost);


        var updatedOrder =
            await db.Context.PurchaseOrders
                .AsNoTracking()
                .SingleAsync(
                    order =>
                        order.Id ==
                        purchaseOrder.Id);


        Assert.Equal(
            PurchaseOrderStatus.Received,
            updatedOrder.Status);


        Assert.NotNull(
            updatedOrder.ReceivedAt);


        var stockTransaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync(
                    transaction =>
                        transaction.CarId ==
                        car.Id
                        &&
                        transaction.TransactionType ==
                        "Stock In");


        Assert.Equal(
            5,
            stockTransaction.Quantity);
    }


    /* =========================================
       Sale
       COGS + Gross Profit
    ========================================= */

    [Fact]
    public async Task CreateSale_WithKnownAverageCost_CapturesCostAndGrossProfit()
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
                    "Muscle",

                Description =
                    "Cost accounting test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "US Motors",

                Email =
                    "motors@test.com",

                PhoneNumber =
                    "01000000002",

                Address =
                    "Cairo"
            };


        var customer =
            new Customer
            {
                FullName =
                    "Cost Test Customer",

                PhoneNumber =
                    "01000000003",

                Email =
                    "customer@test.com",

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
           Inventory

           Cost = 800
           Quantity = 5
        ===================================== */

        var car =
            new Car
            {
                Model =
                    "Charger",

                Year =
                    2026,

                Price =
                    1050m,

                Quantity =
                    5,

                AverageUnitCost =
                    800m,

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


        db.Context.Cars.Add(
            car);


        await db.Context
            .SaveChangesAsync();


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        /* =====================================
           Sale

           Sell:
           2 × 1050
           = Revenue 2100

           Cost:
           2 × 800
           = COGS 1600

           Profit:
           2100 - 1600
           = 500
        ===================================== */

        var dto =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                Notes =
                    "Cost accounting test",

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                2,

                            UnitPrice =
                                1050m
                        }
                    }
            };


        /* =====================================
           Act
        ===================================== */

        var result =
            await service
                .CreateAsync(
                    dto);


        /* =====================================
           Assert
        ===================================== */

        Assert.NotNull(
            result);


        Assert.Equal(
            2100m,
            result.TotalAmount);


        db.Context.ChangeTracker
            .Clear();


        var saleItem =
            await db.Context.SaleItems
                .AsNoTracking()
                .SingleAsync();


        Assert.Equal(
            800m,
            saleItem.UnitCost);


        Assert.Equal(
            1600m,
            saleItem.CostOfGoodsSold);


        Assert.Equal(
            500m,
            saleItem.GrossProfit);


        Assert.Equal(
            2100m,
            saleItem.LineTotal);


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    storedCar =>
                        storedCar.Id ==
                        car.Id);


        Assert.Equal(
            3,
            updatedCar.Quantity);


        /*
         * Selling stock must NOT change
         * the weighted average cost.
         */

        Assert.Equal(
            800m,
            updatedCar.AverageUnitCost);
    }


    /* =========================================
       Unknown Historical Cost
    ========================================= */

    [Fact]
    public async Task CreateSale_WithUnknownAverageCost_DoesNotInventProfit()
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
                    "Honda",

                Country =
                    "Japan"
            };


        var category =
            new Category
            {
                Name =
                    "Compact",

                Description =
                    "Unknown cost test"
            };


        var supplier =
            new Supplier
            {
                Name =
                    "Honda Supplier",

                Email =
                    "honda@test.com",

                PhoneNumber =
                    "01000000004",

                Address =
                    "Alexandria"
            };


        var customer =
            new Customer
            {
                FullName =
                    "Legacy Customer",

                PhoneNumber =
                    "01000000005",

                Email =
                    "legacy@test.com",

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
           Legacy Inventory

           Quantity exists,
           but historical purchase cost
           is unknown.
        ===================================== */

        var car =
            new Car
            {
                Model =
                    "Civic",

                Year =
                    2025,

                Price =
                    1000m,

                Quantity =
                    5,

                AverageUnitCost =
                    null,

                ReorderLevel =
                    1,

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


        db.Context.Cars.Add(
            car);


        await db.Context
            .SaveChangesAsync();


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var dto =
            new CreateSaleDto
            {
                CustomerId =
                    customer.Id,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                Items =
                    new List<CreateSaleItemDto>
                    {
                        new()
                        {
                            CarId =
                                car.Id,

                            Quantity =
                                1,

                            UnitPrice =
                                1000m
                        }
                    }
            };


        /* =====================================
           Act
        ===================================== */

        await service
            .CreateAsync(
                dto);


        /* =====================================
           Assert
        ===================================== */

        db.Context.ChangeTracker
            .Clear();


        var saleItem =
            await db.Context.SaleItems
                .AsNoTracking()
                .SingleAsync();


        Assert.Null(
            saleItem.UnitCost);


        Assert.Null(
            saleItem.CostOfGoodsSold);


        Assert.Null(
            saleItem.GrossProfit);


        Assert.Equal(
            1000m,
            saleItem.LineTotal);


        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    storedCar =>
                        storedCar.Id ==
                        car.Id);


        Assert.Equal(
            4,
            updatedCar.Quantity);


        Assert.Null(
            updatedCar.AverageUnitCost);
    }
}
using AutoStock.Application.DTOs.Sales;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Fakes;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class CustomerServiceTests
{
    /* =========================================
       Helper
    ========================================= */

    private static CustomerService
        CreateService(
            AutoStock.Infrastructure.Data.AppDbContext context)
    {
        ICurrentUserService currentUserService =
            new FakeCurrentUserService();


        IAuditLogService auditLogService =
            new AuditLogService(
                context,
                currentUserService);


        return new CustomerService(
            context,
            auditLogService);
    }


    /* =========================================
       Delete Customer Without Sales
    ========================================= */

    [Fact]
    public async Task DeleteCustomer_WithoutSales_DeletesCustomerAndCreatesAuditLog()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            new Customer
            {
                FullName =
                    "Ahmed Mohamed",

                PhoneNumber =
                    "01012345678",

                Email =
                    "ahmed@test.com",

                Address =
                    "Cairo",

                CreatedAt =
                    DateTime.UtcNow
            };


        db.Context.Customers.Add(
            customer);


        await db.Context
            .SaveChangesAsync();


        var service =
            CreateService(
                db.Context);


        /* Act */

        var result =
            await service
                .DeleteAsync(
                    customer.Id);


        /* Assert */

        Assert.True(
            result);


        var customerExists =
            await db.Context.Customers
                .AsNoTracking()
                .AnyAsync(
                    item =>
                        item.Id ==
                        customer.Id);


        Assert.False(
            customerExists);


        var auditLog =
            await db.Context.AuditLogs
                .AsNoTracking()
                .SingleAsync(
                    log =>
                        log.EntityName ==
                            "Customer"
                        &&
                        log.Action ==
                            "Delete");


        Assert.Equal(
            customer.Id.ToString(),
            auditLog.EntityId);


        Assert.Contains(
            "Ahmed Mohamed",
            auditLog.Details);
    }


    /* =========================================
       Delete Customer With Sales
    ========================================= */

    [Fact]
    public async Task DeleteCustomer_WithSales_ThrowsAndKeepsHistory()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        /* Customer */

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


        db.Context.Customers.Add(
            customer);


        await db.Context
            .SaveChangesAsync();


        /* Existing Sale */

        var sale =
            new Sale
            {
                CustomerId =
                    customer.Id,

                SaleDate =
                    DateTime.UtcNow,

                PaymentMethod =
                    SalePaymentMethod.Cash,

                TotalAmount =
                    1_000_000m,

                Notes =
                    "Existing sales history"
            };


        db.Context.Sales.Add(
            sale);


        await db.Context
            .SaveChangesAsync();


        var service =
            CreateService(
                db.Context);


        /* Act */

        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                async () =>
                    await service
                        .DeleteAsync(
                            customer.Id)
            );


        /* Business Error */

        Assert.Equal(
            "Cannot delete this customer because sales history exists.",
            exception.Message);


        /* Customer Must Remain */

        var customerExists =
            await db.Context.Customers
                .AsNoTracking()
                .AnyAsync(
                    item =>
                        item.Id ==
                        customer.Id);


        Assert.True(
            customerExists);


        /* Sale Must Remain */

        var saleExists =
            await db.Context.Sales
                .AsNoTracking()
                .AnyAsync(
                    item =>
                        item.Id ==
                        sale.Id);


        Assert.True(
            saleExists);


        /* No Delete Audit */

        var deleteAuditExists =
            await db.Context.AuditLogs
                .AsNoTracking()
                .AnyAsync(
                    log =>
                        log.EntityName ==
                            "Customer"
                        &&
                        log.EntityId ==
                            customer.Id
                                .ToString()
                        &&
                        log.Action ==
                            "Delete");


        Assert.False(
            deleteAuditExists);
    }


    /* =========================================
       Delete Missing Customer
    ========================================= */

    [Fact]
    public async Task DeleteCustomer_WhenCustomerDoesNotExist_ReturnsFalse()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var service =
            CreateService(
                db.Context);


        var result =
            await service
                .DeleteAsync(
                    999999);


        Assert.False(
            result);


        Assert.Equal(
            0,
            await db.Context
                .AuditLogs
                .CountAsync());
    }


    [Fact]
    public async Task CreateSale_WhenStockWasAlreadyLow_DoesNotCreateDuplicateLowStockNotification()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var customer =
            await SaleTestData
                .CreateCustomerAsync(
                    db.Context);


        /*
         * Stock is already below
         * the reorder level.
         *
         * Quantity = 2
         * ReorderLevel = 3
         */
        var car =
            await SaleTestData
                .CreateCarAsync(
                    db.Context,
                    quantity: 2,
                    reorderLevel: 3);


        var service =
            SaleServiceFactory
                .Create(
                    db.Context);


        var request =
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
                            1_000_000m
                    }
                    }
            };


        await service
            .CreateAsync(
                request);


        /* Quantity became 1 */

        var updatedCar =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.Id ==
                            car.Id);


        Assert.Equal(
            1,
            updatedCar.Quantity);


        /* No duplicate Low Stock notification */

        var lowStockCount =
            await db.Context.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.LowStock);


        Assert.Equal(
            0,
            lowStockCount);


        /* Sale Completed still exists */

        Assert.True(
            await db.Context.Notifications
                .AnyAsync(
                    notification =>
                        notification.Type ==
                        NotificationType
                            .SaleCompleted)
        );
    }
}
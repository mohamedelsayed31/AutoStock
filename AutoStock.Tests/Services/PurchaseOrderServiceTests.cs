using AutoStock.Application.DTOs.PurchaseOrders;
using AutoStock.Domain.Enums;
using AutoStock.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services;

public class PurchaseOrderServiceTests
{
    /* =========================================
       Create Draft
    ========================================= */

    [Fact]
    public async Task CreatePurchaseOrder_WithValidData_CreatesDraftWithoutChangingStock()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context,
                    quantity: 5);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        var request =
            new CreatePurchaseOrderDto
            {
                SupplierId =
                    data.Supplier.Id,

                Notes =
                    "New inventory order",

                Items =
                    new List<CreatePurchaseOrderItemDto>
                    {
                        new()
                        {
                            CarId =
                                data.Car.Id,

                            Quantity =
                                3,

                            UnitCost =
                                900_000m
                        }
                    }
            };


        /* Act */

        var result =
            await service.CreateAsync(
                request);


        /* Purchase Order */

        Assert.True(
            result.Id > 0);


        Assert.Equal(
            PurchaseOrderStatus.Draft,
            result.Status);


        Assert.Equal(
            data.Supplier.Id,
            result.SupplierId);


        Assert.Equal(
            2_700_000m,
            result.TotalAmount);


        Assert.Null(
            result.ReceivedAt);


        /* Item */

        Assert.Single(
            result.Items);


        Assert.Equal(
            3,
            result.Items[0].Quantity);


        Assert.Equal(
            900_000m,
            result.Items[0].UnitCost);


        Assert.Equal(
            2_700_000m,
            result.Items[0].LineTotal);


        /* Stock must NOT change yet */

        var car =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            5,
            car.Quantity);


        /* No Stock In yet */

        Assert.Equal(
            0,
            await db.Context.StockTransactions
                .CountAsync());


        /* Create Audit */

        Assert.True(
            await db.Context.AuditLogs
                .AnyAsync(
                    log =>
                        log.Action ==
                            "Create"
                        &&
                        log.EntityName ==
                            "PurchaseOrder"
                        &&
                        log.EntityId ==
                            result.Id.ToString())
        );
    }


    /* =========================================
       Submit Draft
    ========================================= */

    [Fact]
    public async Task SubmitPurchaseOrder_WhenDraft_ChangesStatusToSubmitted()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        var order =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                            new()
                            {
                                CarId =
                                    data.Car.Id,

                                Quantity =
                                    2,

                                UnitCost =
                                    800_000m
                            }
                        }
                });


        /* Act */

        var result =
            await service.SubmitAsync(
                order.Id);


        Assert.True(
            result);


        var updatedOrder =
            await service.GetByIdAsync(
                order.Id);


        Assert.NotNull(
            updatedOrder);


        Assert.Equal(
            PurchaseOrderStatus.Submitted,
            updatedOrder!.Status);


        /* Still no inventory change */

        var car =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            5,
            car.Quantity);


        Assert.Equal(
            0,
            await db.Context.StockTransactions
                .CountAsync());


        /* Submit Audit */

        Assert.True(
            await db.Context.AuditLogs
                .AnyAsync(
                    log =>
                        log.Action ==
                            "Submit"
                        &&
                        log.EntityName ==
                            "PurchaseOrder"
                        &&
                        log.EntityId ==
                            order.Id.ToString())
        );
    }


    /* =========================================
       Receive Submitted
    ========================================= */

    [Fact]
    public async Task ReceivePurchaseOrder_WhenSubmitted_AddsStockAndCreatesHistory()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context,
                    quantity: 4);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        var order =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                            new()
                            {
                                CarId =
                                    data.Car.Id,

                                Quantity =
                                    3,

                                UnitCost =
                                    850_000m
                            }
                        }
                });


        await service.SubmitAsync(
            order.Id);


        /* Act */

        var received =
            await service.ReceiveAsync(
                order.Id);


        Assert.True(
            received);


        /* Status */

        var storedOrder =
            await service.GetByIdAsync(
                order.Id);


        Assert.NotNull(
            storedOrder);


        Assert.Equal(
            PurchaseOrderStatus.Received,
            storedOrder!.Status);


        Assert.NotNull(
            storedOrder.ReceivedAt);


        /* Stock: 4 + 3 = 7 */

        var car =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            7,
            car.Quantity);


        /* Stock In */

        var stockTransaction =
            await db.Context.StockTransactions
                .AsNoTracking()
                .SingleAsync();


        Assert.Equal(
            data.Car.Id,
            stockTransaction.CarId);


        Assert.Equal(
            "Stock In",
            stockTransaction.TransactionType);


        Assert.Equal(
            3,
            stockTransaction.Quantity);


        Assert.Contains(
            $"Purchase Order #{order.Id}",
            stockTransaction.Notes);


        /* Receive Audit */

        Assert.True(
            await db.Context.AuditLogs
                .AnyAsync(
                    log =>
                        log.Action ==
                            "Receive"
                        &&
                        log.EntityName ==
                            "PurchaseOrder"
                        &&
                        log.EntityId ==
                            order.Id.ToString())
        );


        /* System Notification */

        var notification =
            await db.Context.Notifications
                .AsNoTracking()
                .SingleAsync(
                    notification =>
                        notification.Type ==
                        NotificationType.System
                        &&
                        notification.EntityName ==
                            "PurchaseOrder"
                        &&
                        notification.EntityId ==
                            order.Id.ToString());


        Assert.False(
            notification.IsRead);


        Assert.Equal(
            "Purchase Order Received",
            notification.Title);
    }


    /* =========================================
       Cancel
    ========================================= */

    [Fact]
    public async Task CancelPurchaseOrder_WhenSubmitted_CancelsWithoutChangingStock()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context,
                    quantity: 5);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        var order =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                            new()
                            {
                                CarId =
                                    data.Car.Id,

                                Quantity =
                                    4,

                                UnitCost =
                                    700_000m
                            }
                        }
                });


        await service.SubmitAsync(
            order.Id);


        /* Act */

        var cancelled =
            await service.CancelAsync(
                order.Id);


        Assert.True(
            cancelled);


        var storedOrder =
            await service.GetByIdAsync(
                order.Id);


        Assert.NotNull(
            storedOrder);


        Assert.Equal(
            PurchaseOrderStatus.Cancelled,
            storedOrder!.Status);


        Assert.Null(
            storedOrder.ReceivedAt);


        /* No Stock Change */

        var car =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            5,
            car.Quantity);


        Assert.Equal(
            0,
            await db.Context.StockTransactions
                .CountAsync());


        /* Cancel Audit */

        Assert.True(
            await db.Context.AuditLogs
                .AnyAsync(
                    log =>
                        log.Action ==
                            "Cancel"
                        &&
                        log.EntityName ==
                            "PurchaseOrder"
                        &&
                        log.EntityId ==
                            order.Id.ToString())
        );
    }


    /* =========================================
       Double Receive Protection
    ========================================= */

    [Fact]
    public async Task ReceivePurchaseOrder_Twice_DoesNotAddStockTwice()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context,
                    quantity: 2);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        var order =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                            new()
                            {
                                CarId =
                                    data.Car.Id,

                                Quantity =
                                    3,

                                UnitCost =
                                    800_000m
                            }
                        }
                });


        await service.SubmitAsync(
            order.Id);


        /* First Receive */

        var firstResult =
            await service.ReceiveAsync(
                order.Id);


        Assert.True(
            firstResult);


        /*
         * Initial Quantity = 2
         * Received = 3
         *
         * Quantity must now be 5.
         */

        var afterFirstReceive =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            5,
            afterFirstReceive.Quantity);


        /* Second Receive must fail */

        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () =>
                    service.ReceiveAsync(
                        order.Id)
            );


        Assert.Contains(
            "Only submitted purchase orders can be received",
            exception.Message);


        /* Quantity must STILL be 5 */

        var afterSecondAttempt =
            await db.Context.Cars
                .AsNoTracking()
                .SingleAsync(
                    car =>
                        car.Id ==
                        data.Car.Id);


        Assert.Equal(
            5,
            afterSecondAttempt.Quantity);


        /* Only one Stock In */

        Assert.Equal(
            1,
            await db.Context.StockTransactions
                .CountAsync(
                    transaction =>
                        transaction.TransactionType ==
                            "Stock In"));


        /* Only one Receive Audit */

        Assert.Equal(
            1,
            await db.Context.AuditLogs
                .CountAsync(
                    log =>
                        log.Action ==
                            "Receive"
                        &&
                        log.EntityName ==
                            "PurchaseOrder"
                        &&
                        log.EntityId ==
                            order.Id.ToString()));


        /* Only one Received Notification */

        Assert.Equal(
            1,
            await db.Context.Notifications
                .CountAsync(
                    notification =>
                        notification.Type ==
                            NotificationType.System
                        &&
                        notification.EntityName ==
                            "PurchaseOrder"
                        &&
                        notification.EntityId ==
                            order.Id.ToString()));
    }

    [Fact]
    public async Task GetSupplierHistory_ReturnsOnlyReceivedValueAndUnitsInTotals()
    {
        await using var db =
            await TestDbFactory
                .CreateAsync();


        var data =
            await PurchaseOrderTestData
                .CreateSupplierAndCarAsync(
                    db.Context,
                    quantity: 5);


        var service =
            PurchaseOrderServiceFactory
                .Create(
                    db.Context);


        /* =========================
           Received Order
        ========================= */

        var receivedOrder =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                        new()
                        {
                            CarId =
                                data.Car.Id,

                            Quantity =
                                3,

                            UnitCost =
                                100m
                        }
                        }
                });


        await service.SubmitAsync(
            receivedOrder.Id);


        await service.ReceiveAsync(
            receivedOrder.Id);


        /* =========================
           Cancelled Order
        ========================= */

        var cancelledOrder =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                        new()
                        {
                            CarId =
                                data.Car.Id,

                            Quantity =
                                10,

                            UnitCost =
                                500m
                        }
                        }
                });


        await service.CancelAsync(
            cancelledOrder.Id);


        /* =========================
           Submitted Order
        ========================= */

        var submittedOrder =
            await service.CreateAsync(
                new CreatePurchaseOrderDto
                {
                    SupplierId =
                        data.Supplier.Id,

                    Items =
                        new List<CreatePurchaseOrderItemDto>
                        {
                        new()
                        {
                            CarId =
                                data.Car.Id,

                            Quantity =
                                4,

                            UnitCost =
                                200m
                        }
                        }
                });


        await service.SubmitAsync(
            submittedOrder.Id);


        /* =========================
           Act
        ========================= */

        var history =
            await service
                .GetSupplierHistoryAsync(
                    data.Supplier.Id);


        Assert.NotNull(
            history);


        Assert.Equal(
            3,
            history!.TotalOrders);


        Assert.Equal(
            0,
            history.DraftOrders);


        Assert.Equal(
            1,
            history.SubmittedOrders);


        Assert.Equal(
            1,
            history.ReceivedOrders);


        Assert.Equal(
            1,
            history.CancelledOrders);


        /*
         * Only received:
         *
         * 3 × 100 = 300
         */

        Assert.Equal(
            3,
            history.TotalReceivedUnits);


        Assert.Equal(
            300m,
            history.TotalReceivedValue);


        Assert.Equal(
            3,
            history.Orders.Count);
    }
}
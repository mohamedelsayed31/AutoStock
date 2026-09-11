using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Services;
using AutoStock.Tests.Fakes;

namespace AutoStock.Tests.Helpers;

public static class PurchaseOrderServiceFactory
{
    public static PurchaseOrderService Create(
        AppDbContext context)
    {
        var currentUserService =
            new FakeCurrentUserService();


        var auditLogService =
            new AuditLogService(
                context,
                currentUserService);


        var notificationService =
            new NotificationService(
                context,
                currentUserService);


        return new PurchaseOrderService(
            context,
            auditLogService,
            notificationService);
    }
}
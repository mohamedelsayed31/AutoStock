using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;

namespace AutoStock.Infrastructure.Services;

public class AuditLogService
    : IAuditLogService
{
    private readonly AppDbContext _context;

    private readonly ICurrentUserService
        _currentUserService;


    public AuditLogService(
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _context =
            context;

        _currentUserService =
            currentUserService;
    }


    public async Task LogAsync(
        string action,
        string entityName,
        string? entityId = null,
        string? details = null)
    {
        if (
            string.IsNullOrWhiteSpace(
                action)
        )
        {
            throw new ArgumentException(
                "Audit action is required.");
        }


        if (
            string.IsNullOrWhiteSpace(
                entityName)
        )
        {
            throw new ArgumentException(
                "Audit entity name is required.");
        }


        var auditLog =
            new AuditLog
            {
                UserId =
                    Limit(
                        _currentUserService
                            .UserId,
                        450),

                UserEmail =
                    Limit(
                        _currentUserService
                            .UserEmail,
                        256),

                Action =
                    Limit(
                        action,
                        50)
                    ?? string.Empty,

                EntityName =
                    Limit(
                        entityName,
                        100)
                    ?? string.Empty,

                EntityId =
                    Limit(
                        entityId,
                        100),

                Details =
                    Limit(
                        details,
                        1000),

                CreatedAt =
                    DateTime.UtcNow
            };


        _context.AuditLogs.Add(
            auditLog);


        await _context
            .SaveChangesAsync();
    }


    private static string? Limit(
        string? value,
        int maxLength)
    {
        if (
            string.IsNullOrWhiteSpace(
                value)
        )
        {
            return null;
        }


        var trimmed =
            value.Trim();


        return trimmed.Length <=
               maxLength
            ? trimmed
            : trimmed[
                ..maxLength];
    }
}
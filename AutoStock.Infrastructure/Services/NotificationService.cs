using AutoStock.Application.DTOs.Notifications;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Domain.Enums;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class NotificationService
    : INotificationService
{
    private readonly AppDbContext _context;

    private readonly ICurrentUserService
        _currentUserService;


    public NotificationService(
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _context =
            context;

        _currentUserService =
            currentUserService;
    }


    /* =========================================
       Create Notification
    ========================================= */

    public async Task CreateAsync(
        NotificationType type,
        string title,
        string message,
        string? entityName = null,
        string? entityId = null)
    {
        var userId =
            _currentUserService
                .UserId;


        if (
            string.IsNullOrWhiteSpace(
                userId)
        )
        {
            throw new InvalidOperationException(
                "Authenticated user was not found.");
        }


        if (
            string.IsNullOrWhiteSpace(
                title)
        )
        {
            throw new ArgumentException(
                "Notification title is required.");
        }


        if (
            string.IsNullOrWhiteSpace(
                message)
        )
        {
            throw new ArgumentException(
                "Notification message is required.");
        }


        var notification =
            new Notification
            {
                RecipientUserId =
                    userId,

                Type =
                    type,

                Title =
                    Limit(
                        title,
                        150)
                    ?? string.Empty,

                Message =
                    Limit(
                        message,
                        500)
                    ?? string.Empty,

                EntityName =
                    Limit(
                        entityName,
                        100),

                EntityId =
                    Limit(
                        entityId,
                        100),

                IsRead =
                    false,

                ReadAt =
                    null,

                CreatedAt =
                    DateTime.UtcNow
            };


        _context.Notifications.Add(
            notification);


        await _context
            .SaveChangesAsync();
    }


    /* =========================================
       Get My Notifications
    ========================================= */

    public async Task<IReadOnlyList<NotificationDto>>
        GetMineAsync(
            int take = 20)
    {
        var userId =
            GetRequiredUserId();


        if (take < 1)
        {
            take = 20;
        }


        if (take > 100)
        {
            take = 100;
        }


        return await _context.Notifications
            .AsNoTracking()
            .Where(
                notification =>
                    notification
                        .RecipientUserId ==
                    userId)
            .OrderByDescending(
                notification =>
                    notification.CreatedAt)
            .ThenByDescending(
                notification =>
                    notification.Id)
            .Take(
                take)
            .Select(
                notification =>
                    new NotificationDto
                    {
                        Id =
                            notification.Id,

                        Type =
                            notification.Type,

                        Title =
                            notification.Title,

                        Message =
                            notification.Message,

                        EntityName =
                            notification.EntityName,

                        EntityId =
                            notification.EntityId,

                        IsRead =
                            notification.IsRead,

                        ReadAt =
                            notification.ReadAt,

                        CreatedAt =
                            notification.CreatedAt
                    })
            .ToListAsync();
    }


    /* =========================================
       Unread Count
    ========================================= */

    public async Task<int>
        GetUnreadCountAsync()
    {
        var userId =
            GetRequiredUserId();


        return await _context.Notifications
            .AsNoTracking()
            .CountAsync(
                notification =>
                    notification
                        .RecipientUserId ==
                    userId
                    &&
                    !notification.IsRead);
    }


    /* =========================================
       Mark One As Read
    ========================================= */

    public async Task<bool>
        MarkAsReadAsync(
            int id)
    {
        var userId =
            GetRequiredUserId();


        var notification =
            await _context.Notifications
                .FirstOrDefaultAsync(
                    notification =>
                        notification.Id ==
                            id
                        &&
                        notification
                            .RecipientUserId ==
                            userId);


        if (notification is null)
        {
            return false;
        }


        if (notification.IsRead)
        {
            return true;
        }


        notification.IsRead =
            true;

        notification.ReadAt =
            DateTime.UtcNow;


        await _context
            .SaveChangesAsync();


        return true;
    }


    /* =========================================
       Mark All As Read
    ========================================= */

    public async Task<int>
        MarkAllAsReadAsync()
    {
        var userId =
            GetRequiredUserId();


        var notifications =
            await _context.Notifications
                .Where(
                    notification =>
                        notification
                            .RecipientUserId ==
                        userId
                        &&
                        !notification.IsRead)
                .ToListAsync();


        if (
            notifications.Count ==
            0
        )
        {
            return 0;
        }


        var now =
            DateTime.UtcNow;


        foreach (
            var notification in notifications)
        {
            notification.IsRead =
                true;

            notification.ReadAt =
                now;
        }


        await _context
            .SaveChangesAsync();


        return notifications.Count;
    }


    /* =========================================
       Helpers
    ========================================= */

    private string
        GetRequiredUserId()
    {
        var userId =
            _currentUserService
                .UserId;


        if (
            string.IsNullOrWhiteSpace(
                userId)
        )
        {
            throw new InvalidOperationException(
                "Authenticated user was not found.");
        }


        return userId;
    }


    private static string?
        Limit(
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
using AutoStock.Application.DTOs.Notifications;
using AutoStock.Domain.Enums;

namespace AutoStock.Application.Interface;

public interface INotificationService
{
    Task CreateAsync(
        NotificationType type,
        string title,
        string message,
        string? entityName = null,
        string? entityId = null);


    Task<IReadOnlyList<NotificationDto>>
        GetMineAsync(
            int take = 20);


    Task<int>
        GetUnreadCountAsync();


    Task<bool>
        MarkAsReadAsync(
            int id);


    Task<int>
        MarkAllAsReadAsync();
}
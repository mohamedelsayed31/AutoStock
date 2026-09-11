using AutoStock.Domain.Enums;

namespace AutoStock.Application.DTOs.Notifications;

public class NotificationDto
{
    public int Id { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; }
        = string.Empty;

    public string Message { get; set; }
        = string.Empty;

    public string? EntityName { get; set; }

    public string? EntityId { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
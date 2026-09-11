using AutoStock.Domain.Enums;

namespace AutoStock.Domain.Entities;

public class Notification
{
    public int Id { get; set; }

    public string RecipientUserId { get; set; }
        = string.Empty;

    public NotificationType Type { get; set; }

    public string Title { get; set; }
        = string.Empty;

    public string Message { get; set; }
        = string.Empty;

    public string? EntityName { get; set; }

    public string? EntityId { get; set; }

    public bool IsRead { get; set; }
        = false;

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}
namespace AutoStock.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }

    public string? UserId { get; set; }

    public string? UserEmail { get; set; }

    public string Action { get; set; }
        = string.Empty;

    public string EntityName { get; set; }
        = string.Empty;

    public string? EntityId { get; set; }

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}
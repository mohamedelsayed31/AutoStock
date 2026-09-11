namespace AutoStock.Application.Interface;

public interface IAuditLogService
{
    Task LogAsync(
        string action,
        string entityName,
        string? entityId = null,
        string? details = null);
}
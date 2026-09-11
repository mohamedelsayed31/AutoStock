using AutoStock.Application.DTOs.AuditLogs;

namespace AutoStock.Application.Interface;

public interface IAuditLogReadService
{
    Task<AuditLogsResponseDto> GetAsync(
        string? search,
        string? action,
        string? entityName,
        int page,
        int pageSize);
}
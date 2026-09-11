using AutoStock.Application.DTOs.AuditLogs;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class AuditLogReadService
    : IAuditLogReadService
{
    private readonly AppDbContext _context;


    public AuditLogReadService(
        AppDbContext context)
    {
        _context = context;
    }


    public async Task<AuditLogsResponseDto>
        GetAsync(
            string? search,
            string? action,
            string? entityName,
            int page,
            int pageSize)
    {
        /* =========================
           Normalize Pagination
        ========================= */

        if (page < 1)
        {
            page = 1;
        }


        if (pageSize < 1)
        {
            pageSize = 20;
        }


        if (pageSize > 100)
        {
            pageSize = 100;
        }


        /* =========================
           Base Query
        ========================= */

        var query =
            _context.AuditLogs
                .AsNoTracking()
                .AsQueryable();


        /* =========================
           Search
        ========================= */

        if (
            !string.IsNullOrWhiteSpace(
                search)
        )
        {
            var value =
                search.Trim();


            query =
                query.Where(
                    log =>
                        (
                            log.UserEmail != null &&
                            log.UserEmail.Contains(value)
                        )
                        ||
                        log.Action.Contains(value)
                        ||
                        log.EntityName.Contains(value)
                        ||
                        (
                            log.EntityId != null &&
                            log.EntityId.Contains(value)
                        )
                        ||
                        (
                            log.Details != null &&
                            log.Details.Contains(value)
                        )
                );
        }


        /* =========================
           Action Filter
        ========================= */

        if (
            !string.IsNullOrWhiteSpace(
                action)
        )
        {
            var value =
                action.Trim();


            query =
                query.Where(
                    log =>
                        log.Action == value
                );
        }


        /* =========================
           Entity Filter
        ========================= */

        if (
            !string.IsNullOrWhiteSpace(
                entityName)
        )
        {
            var value =
                entityName.Trim();


            query =
                query.Where(
                    log =>
                        log.EntityName == value
                );
        }


        /* =========================
           Count
        ========================= */

        var totalCount =
            await query
                .CountAsync();


        var totalPages =
            totalCount == 0
                ? 0
                : (int)Math.Ceiling(
                    totalCount /
                    (double)pageSize
                );


        /* =========================
           Get Page
        ========================= */

        var items =
            await query
                .OrderByDescending(
                    log => log.CreatedAt)
                .ThenByDescending(
                    log => log.Id)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(
                    log =>
                        new AuditLogDto
                        {
                            Id =
                                log.Id,

                            UserId =
                                log.UserId,

                            UserEmail =
                                log.UserEmail,

                            Action =
                                log.Action,

                            EntityName =
                                log.EntityName,

                            EntityId =
                                log.EntityId,

                            Details =
                                log.Details,

                            CreatedAt =
                                log.CreatedAt
                        }
                )
                .ToListAsync();


        return new AuditLogsResponseDto
        {
            Items =
                items,

            Page =
                page,

            PageSize =
                pageSize,

            TotalCount =
                totalCount,

            TotalPages =
                totalPages
        };
    }
}
using AutoStock.Application.DTOs.AuditLogs;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogReadService
        _auditLogReadService;


    public AuditLogsController(
        IAuditLogReadService auditLogReadService)
    {
        _auditLogReadService =
            auditLogReadService;
    }


    [HttpGet]
    public async Task<ActionResult<AuditLogsResponseDto>>
        Get(
            [FromQuery] string? search = null,
            [FromQuery] string? action = null,
            [FromQuery] string? entityName = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
    {
        var result =
            await _auditLogReadService
                .GetAsync(
                    search,
                    action,
                    entityName,
                    page,
                    pageSize
                );


        return Ok(
            result
        );
    }
}
using AutoStock.Application.DTOs.Reports.Sales;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SalesReportsController : ControllerBase
{
    private readonly ISalesReportService
        _salesReportService;


    public SalesReportsController(
        ISalesReportService salesReportService)
    {
        _salesReportService =
            salesReportService;
    }


    [HttpGet]
    public async Task<ActionResult<SalesReportDto>>
        GetReport()
    {
        var report =
            await _salesReportService
                .GetReportAsync();

        return Ok(report);
    }
}
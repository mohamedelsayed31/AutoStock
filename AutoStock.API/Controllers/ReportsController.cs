using AutoStock.Application.DTOs.Reports;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService
        _reportService;


    public ReportsController(
        IReportService reportService)
    {
        _reportService =
            reportService;
    }


    [HttpGet("inventory")]
    public async Task<
        ActionResult<
            List<InventoryReportItemDto>>>
        GetInventoryReport()
    {
        var result =
            await _reportService
                .GetInventoryReportAsync();

        return Ok(result);
    }


    [HttpGet("low-stock")]
    public async Task<
        ActionResult<
            List<LowStockReportItemDto>>>
        GetLowStockReport()
    {
        var result =
            await _reportService
                .GetLowStockReportAsync();

        return Ok(result);
    }


    [HttpGet("stock-movement")]
    public async Task<
        ActionResult<
            StockMovementSummaryDto>>
        GetStockMovementSummary(
            [FromQuery]
            DateTime? startDate,

            [FromQuery]
            DateTime? endDate)
    {
        if (
            startDate.HasValue &&
            endDate.HasValue &&
            startDate.Value >
            endDate.Value)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title =
                        "Invalid date range",

                    Detail =
                        "Start date cannot be after end date.",

                    Status = 400
                });
        }


        var result =
            await _reportService
                .GetStockMovementSummaryAsync(
                    startDate,
                    endDate);

        return Ok(result);
    }
}
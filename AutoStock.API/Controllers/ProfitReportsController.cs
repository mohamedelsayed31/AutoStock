using AutoStock.Application.DTOs.Reports.Profit;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ProfitReportsController
    : ControllerBase
{
    private readonly IProfitReportService
        _profitReportService;


    public ProfitReportsController(
        IProfitReportService profitReportService)
    {
        _profitReportService =
            profitReportService;
    }


    [HttpGet]
    public async Task<
        ActionResult<ProfitReportDto>>
        GetReport()
    {
        var result =
            await _profitReportService
                .GetReportAsync();


        return Ok(
            result);
    }
}     
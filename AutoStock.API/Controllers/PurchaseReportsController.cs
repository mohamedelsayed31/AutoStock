using AutoStock.Application.DTOs.Reports.Purchases;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PurchaseReportsController
    : ControllerBase
{
    private readonly IPurchaseReportService
        _purchaseReportService;


    public PurchaseReportsController(
        IPurchaseReportService purchaseReportService)
    {
        _purchaseReportService =
            purchaseReportService;
    }


    [HttpGet]
    public async Task<
        ActionResult<PurchaseReportDto>>
        GetReport()
    {
        return Ok(
            await _purchaseReportService
                .GetReportAsync());
    }
}
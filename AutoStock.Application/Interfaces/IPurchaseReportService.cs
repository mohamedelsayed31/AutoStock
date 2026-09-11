using AutoStock.Application.DTOs.Reports.Purchases;

namespace AutoStock.Application.Interface;

public interface IPurchaseReportService
{
    Task<PurchaseReportDto>
        GetReportAsync();
}
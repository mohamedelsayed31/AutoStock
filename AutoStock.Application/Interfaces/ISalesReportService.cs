using AutoStock.Application.DTOs.Reports.Sales;

namespace AutoStock.Application.Interface;

public interface ISalesReportService
{
    Task<SalesReportDto> GetReportAsync();
}
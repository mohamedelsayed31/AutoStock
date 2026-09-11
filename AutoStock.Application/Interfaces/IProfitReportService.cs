using AutoStock.Application.DTOs.Reports.Profit;

namespace AutoStock.Application.Interface;

public interface IProfitReportService
{
    Task<ProfitReportDto>
        GetReportAsync();
}
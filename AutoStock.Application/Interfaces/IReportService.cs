using AutoStock.Application.DTOs.Reports;

namespace AutoStock.Application.Interface;

public interface IReportService
{
    Task<List<InventoryReportItemDto>>
        GetInventoryReportAsync();

    Task<List<LowStockReportItemDto>>
        GetLowStockReportAsync();

    Task<StockMovementSummaryDto>
        GetStockMovementSummaryAsync(
            DateTime? startDate,
            DateTime? endDate);
}
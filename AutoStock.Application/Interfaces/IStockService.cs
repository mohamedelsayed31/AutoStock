using AutoStock.Application.Common;
using AutoStock.Application.DTOs.Common;
using AutoStock.Application.DTOs.Stock;

namespace AutoStock.Application.Interface
{
    public interface IStockService
    {
        Task<StockTransactionDto>
            StockInAsync(
                int carId,
                StockOperationDto dto);

        Task<StockTransactionDto>
            StockOutAsync(
                int carId,
                StockOperationDto dto);

        Task<PagedResult<StockTransactionDto>>
            GetHistoryAsync(
                int? carId = null,
                string? transactionType = null,
                DateTime? startDate = null,
                DateTime? endDate = null,
                int page = 1,
                int pageSize = 10);
    }
}
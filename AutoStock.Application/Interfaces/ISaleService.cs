using AutoStock.Application.DTOs.Sales;

namespace AutoStock.Application.Interface;

public interface ISaleService
{
    Task<IReadOnlyList<SaleDto>> GetAllAsync();

    Task<SaleDto?> GetByIdAsync(int id);

    Task<SaleDto> CreateAsync(
        CreateSaleDto dto);
}
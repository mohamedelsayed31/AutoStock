using AutoStock.Application.DTOs.InventoryCost;

namespace AutoStock.Application.Interface;

public interface IInventoryCostService
{
    Task<InventoryCostBasisDto>
        SetCostBasisAsync(
            int carId,
            SetInventoryCostBasisDto dto);
}

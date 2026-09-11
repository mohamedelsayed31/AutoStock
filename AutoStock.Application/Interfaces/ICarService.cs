using AutoStock.Application.DTOs.Cars;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoStock.Application.Common;

namespace AutoStock.Application.Interface
{
    public interface ICarService
    {
        Task<PagedResult<CarDto>> GetAllAsync(
            CarQueryParameters parameters);

        Task<CarDto?> GetByIdAsync(int id);

        Task<CarDto> CreateAsync(CreateCarDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateCarDto dto);

        Task<bool> DeleteAsync(int id);

        Task<bool> BrandExistsAsync(int brandId);

        Task<bool> CategoryExistsAsync(int categoryId);

        Task<bool> SupplierExistsAsync(int supplierId);

        Task<List<CarDto>>
            GetArchivedCarsAsync();

        Task RestoreCarAsync(
            int id);

        Task<string?>
            UpdateImageAsync(
                int carId,
                string imagePath);

                Task<string?>
                    RemoveImageAsync(
                        int carId);
    }
}

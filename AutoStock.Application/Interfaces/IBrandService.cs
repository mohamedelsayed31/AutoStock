using AutoStock.Application.DTOs.Brands;

namespace AutoStock.Application.Interface
{
    public interface IBrandService
    {
        Task<IEnumerable<BrandDto>>
            GetAllAsync();

        Task<BrandDto?>
            GetByIdAsync(int id);

        Task<BrandDto>
            CreateAsync(CreateBrandDto dto);

        Task<bool>
            UpdateAsync(
                int id,
                UpdateBrandDto dto);

        Task<bool>
            DeleteAsync(int id);
    }
}
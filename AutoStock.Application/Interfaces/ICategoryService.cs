using AutoStock.Application.DTOs.Categories;

namespace AutoStock.Application.Interface
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>>
            GetAllAsync();

        Task<CategoryDto?>
            GetByIdAsync(int id);

        Task<CategoryDto>
            CreateAsync(CreateCategoryDto dto);

        Task<bool>
            UpdateAsync(
                int id,
                UpdateCategoryDto dto);

        Task<bool>
            DeleteAsync(int id);
    }
}
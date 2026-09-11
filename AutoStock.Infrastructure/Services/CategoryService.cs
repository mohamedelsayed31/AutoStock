using AutoStock.Application.DTOs.Categories;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;


        public CategoryService(
            AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<CategoryDto>>
            GetAllAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();
        }


        public async Task<CategoryDto?>
            GetByIdAsync(int id)
        {
            return await _context.Categories
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();
        }


        public async Task<CategoryDto>
            CreateAsync(
                CreateCategoryDto dto)
        {
            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Category name is required.");
            }


            var exists =
                await _context.Categories
                    .AnyAsync(
                        c => c.Name == name);


            if (exists)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists.");
            }


            var category =
                new Category
                {
                    Name = name,

                    Description =
                        string.IsNullOrWhiteSpace(
                            dto.Description)
                            ? null
                            : dto.Description.Trim()
                };


            _context.Categories
                .Add(category);


            await _context
                .SaveChangesAsync();


            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description =
                    category.Description
            };
        }


        public async Task<bool>
            UpdateAsync(
                int id,
                UpdateCategoryDto dto)
        {
            var category =
                await _context.Categories
                    .FindAsync(id);


            if (category is null)
            {
                return false;
            }


            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Category name is required.");
            }


            var duplicate =
                await _context.Categories
                    .AnyAsync(
                        c =>
                            c.Id != id &&
                            c.Name == name);


            if (duplicate)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists.");
            }


            category.Name = name;

            category.Description =
                string.IsNullOrWhiteSpace(
                    dto.Description)
                    ? null
                    : dto.Description.Trim();


            await _context
                .SaveChangesAsync();


            return true;
        }


        public async Task<bool>
            DeleteAsync(int id)
        {
            var category =
                await _context.Categories
                    .FindAsync(id);


            if (category is null)
            {
                return false;
            }


            var isUsed =
                await _context.Cars
                    .AnyAsync(
                        c => c.CategoryId == id);


            if (isUsed)
            {
                throw new InvalidOperationException(
                    "Category cannot be deleted because it is used by one or more cars.");
            }


            _context.Categories
                .Remove(category);


            await _context
                .SaveChangesAsync();


            return true;
        }
    }
}
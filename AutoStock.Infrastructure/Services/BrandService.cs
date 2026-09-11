using AutoStock.Application.DTOs.Brands;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services
{
    public class BrandService : IBrandService
    {
        private readonly AppDbContext _context;


        public BrandService(
            AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<BrandDto>>
            GetAllAsync()
        {
            return await _context.Brands
                .AsNoTracking()
                .OrderBy(b => b.Name)
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Country = b.Country
                })
                .ToListAsync();
        }


        public async Task<BrandDto?>
            GetByIdAsync(int id)
        {
            return await _context.Brands
                .AsNoTracking()
                .Where(b => b.Id == id)
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Country = b.Country
                })
                .FirstOrDefaultAsync();
        }


        public async Task<BrandDto>
            CreateAsync(
                CreateBrandDto dto)
        {
            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Brand name is required.");
            }


            var exists =
                await _context.Brands
                    .AnyAsync(
                        b => b.Name == name);


            if (exists)
            {
                throw new InvalidOperationException(
                    "A brand with this name already exists.");
            }


            var brand = new Brand
            {
                Name = name,

                Country =
                    string.IsNullOrWhiteSpace(
                        dto.Country)
                        ? null
                        : dto.Country.Trim()
            };


            _context.Brands.Add(brand);

            await _context.SaveChangesAsync();


            return new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Country = brand.Country
            };
        }


        public async Task<bool>
            UpdateAsync(
                int id,
                UpdateBrandDto dto)
        {
            var brand =
                await _context.Brands
                    .FindAsync(id);


            if (brand is null)
            {
                return false;
            }


            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Brand name is required.");
            }


            var duplicate =
                await _context.Brands
                    .AnyAsync(
                        b =>
                            b.Id != id &&
                            b.Name == name);


            if (duplicate)
            {
                throw new InvalidOperationException(
                    "A brand with this name already exists.");
            }


            brand.Name = name;

            brand.Country =
                string.IsNullOrWhiteSpace(
                    dto.Country)
                    ? null
                    : dto.Country.Trim();


            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool>
            DeleteAsync(int id)
        {
            var brand =
                await _context.Brands
                    .FindAsync(id);


            if (brand is null)
            {
                return false;
            }


            var isUsed =
                await _context.Cars
                    .AnyAsync(
                        c => c.BrandId == id);


            if (isUsed)
            {
                throw new InvalidOperationException(
                    "Brand cannot be deleted because it is used by one or more cars.");
            }


            _context.Brands.Remove(brand);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
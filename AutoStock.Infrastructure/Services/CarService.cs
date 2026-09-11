using AutoStock.Application.DTOs.Cars;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using AutoStock.Application.Common;

namespace AutoStock.Infrastructure.Services
{
    public class CarService : ICarService
    {
        private readonly AppDbContext _context;


        public CarService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<PagedResult<CarDto>> GetAllAsync(
            CarQueryParameters parameters)
        {
            var query = _context.Cars
                .AsNoTracking()
                .AsQueryable();


            // Soft Delete Filter
            if (!parameters.IncludeInactive)
            {
                query = query.Where(c => c.IsActive);
            }


            // Search
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                string search = parameters.Search.Trim();

                query = query.Where(c =>
                    c.Model.Contains(search) ||
                    (c.Brand != null &&
                     c.Brand.Name.Contains(search)) ||
                    (c.Category != null &&
                     c.Category.Name.Contains(search)) ||
                    (c.Supplier != null &&
                     c.Supplier.Name.Contains(search)));
            }


            // Brand Filter
            if (parameters.BrandId.HasValue)
            {
                query = query.Where(c =>
                    c.BrandId == parameters.BrandId.Value);
            }


            // Category Filter
            if (parameters.CategoryId.HasValue)
            {
                query = query.Where(c =>
                    c.CategoryId == parameters.CategoryId.Value);
            }


            // Supplier Filter
            if (parameters.SupplierId.HasValue)
            {
                query = query.Where(c =>
                    c.SupplierId == parameters.SupplierId.Value);
            }


            // Year Filter
            if (parameters.Year.HasValue)
            {
                query = query.Where(c =>
                    c.Year == parameters.Year.Value);
            }


            // Minimum Price
            if (parameters.MinPrice.HasValue)
            {
                query = query.Where(c =>
                    c.Price >= parameters.MinPrice.Value);
            }


            // Maximum Price
            if (parameters.MaxPrice.HasValue)
            {
                query = query.Where(c =>
                    c.Price <= parameters.MaxPrice.Value);
            }


            // Stock Status Filter
            if (!string.IsNullOrWhiteSpace(
                parameters.StockStatus))
            {
                string stockStatus =
                    parameters.StockStatus
                        .Trim()
                        .ToLower();


                query = stockStatus switch
                {
                    "in stock" =>
                        query.Where(c =>
                            c.IsActive &&
                            c.Quantity > c.ReorderLevel),

                    "low stock" =>
                        query.Where(c =>
                            c.IsActive &&
                            c.Quantity > 0 &&
                            c.Quantity <= c.ReorderLevel),

                    "out of stock" =>
                        query.Where(c =>
                            c.IsActive &&
                            c.Quantity == 0),

                    "inactive" =>
                        query.Where(c =>
                            !c.IsActive),

                    _ => query
                };
            }


            // Sorting
            string sortBy =
                parameters.SortBy.Trim().ToLower();

            bool descending =
                parameters.SortDirection
                    .Equals(
                        "desc",
                        StringComparison.OrdinalIgnoreCase);


            query = sortBy switch
            {
                "model" => descending
                    ? query.OrderByDescending(c => c.Model)
                    : query.OrderBy(c => c.Model),

                "year" => descending
                    ? query.OrderByDescending(c => c.Year)
                    : query.OrderBy(c => c.Year),

                "price" => descending
                    ? query.OrderByDescending(c => c.Price)
                    : query.OrderBy(c => c.Price),

                "quantity" => descending
                    ? query.OrderByDescending(c => c.Quantity)
                    : query.OrderBy(c => c.Quantity),

                "createdat" => descending
                    ? query.OrderByDescending(c => c.CreatedAt)
                    : query.OrderBy(c => c.CreatedAt),

                _ => descending
                    ? query.OrderByDescending(c => c.Id)
                    : query.OrderBy(c => c.Id)
            };


            // Count BEFORE pagination
            int totalCount =
                await query.CountAsync();


            int totalPages =
                (int)Math.Ceiling(
                    totalCount /
                    (double)parameters.PageSize);


            var cars = await query
                .Skip(
                    (parameters.Page - 1) *
                    parameters.PageSize)
                .Take(parameters.PageSize)
                .Select(c => new CarDto
                {
                    Id = c.Id,
                    Model = c.Model,
                    Year = c.Year,
                    Price = c.Price,
                    Quantity = c.Quantity,
                    ReorderLevel = c.ReorderLevel,
                    Color = c.Color,
                    FuelType = c.FuelType,
                    Transmission = c.Transmission,
                    ImagePath = c.ImagePath,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.IsActive,

                    BrandId = c.BrandId,

                    BrandName = c.Brand != null
                        ? c.Brand.Name
                        : string.Empty,

                    CategoryId = c.CategoryId,

                    CategoryName = c.Category != null
                        ? c.Category.Name
                        : string.Empty,

                    SupplierId = c.SupplierId,

                    SupplierName = c.Supplier != null
                        ? c.Supplier.Name
                        : string.Empty,

                    StockStatus =
                        !c.IsActive
                            ? "Inactive"
                        : c.Quantity == 0
                            ? "Out of Stock"
                        : c.Quantity <= c.ReorderLevel
                            ? "Low Stock"
                        : "In Stock"
                })
                .ToListAsync();


            return new PagedResult<CarDto>
            {
                Items = cars,
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }


        public async Task<CarDto?> GetByIdAsync(int id)
        {
            return await GetCarsQuery(false)
                .FirstOrDefaultAsync(c => c.Id == id);
        }


        public async Task<CarDto> CreateAsync(
            CreateCarDto dto)
        {
            var car = new Car
            {
                Model = dto.Model.Trim(),
                Year = dto.Year,
                Price = dto.Price,
                Quantity = dto.Quantity,
                ReorderLevel = dto.ReorderLevel,
                Color = dto.Color.Trim(),
                FuelType = dto.FuelType.Trim(),
                Transmission = dto.Transmission.Trim(),
                ImagePath = dto.ImagePath,

                BrandId = dto.BrandId,
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,

                CreatedAt = DateTime.Now,
                IsActive = true
            };


            _context.Cars.Add(car);

            await _context.SaveChangesAsync();


            return await GetCarsQuery(true)
                .FirstAsync(c => c.Id == car.Id);
        }


        public async Task<bool> UpdateAsync(
            int id,
            UpdateCarDto dto)
        {
            var car = await _context.Cars
                .FindAsync(id);


            if (car == null || !car.IsActive)
            {
                return false;
            }


            car.Model = dto.Model.Trim();
            car.Year = dto.Year;
            car.Price = dto.Price;
            car.ReorderLevel = dto.ReorderLevel;
            car.Color = dto.Color.Trim();
            car.FuelType = dto.FuelType.Trim();
            car.Transmission = dto.Transmission.Trim();

            car.BrandId = dto.BrandId;
            car.CategoryId = dto.CategoryId;
            car.SupplierId = dto.SupplierId;


            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var car = await _context.Cars
                .FindAsync(id);


            if (car == null || !car.IsActive)
            {
                return false;
            }


            car.IsActive = false;

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> BrandExistsAsync(int brandId)
        {
            return await _context.Brands
                .AnyAsync(b => b.Id == brandId);
        }


        public async Task<bool> CategoryExistsAsync(
            int categoryId)
        {
            return await _context.Categories
                .AnyAsync(c => c.Id == categoryId);
        }


        public async Task<bool> SupplierExistsAsync(
            int supplierId)
        {
            return await _context.Suppliers
                .AnyAsync(s => s.Id == supplierId);
        }


        private IQueryable<CarDto> GetCarsQuery(
            bool includeInactive)
        {
            var query = _context.Cars
                .AsNoTracking()
                .AsQueryable();


            if (!includeInactive)
            {
                query = query.Where(c => c.IsActive);
            }


            return query.Select(c => new CarDto
            {
                Id = c.Id,
                Model = c.Model,
                Year = c.Year,
                Price = c.Price,
                Quantity = c.Quantity,
                ReorderLevel = c.ReorderLevel,
                Color = c.Color,
                FuelType = c.FuelType,
                Transmission = c.Transmission,
                ImagePath = c.ImagePath,
                CreatedAt = c.CreatedAt,
                IsActive = c.IsActive,

                BrandId = c.BrandId,

                BrandName = c.Brand != null
                    ? c.Brand.Name
                    : string.Empty,

                CategoryId = c.CategoryId,

                CategoryName = c.Category != null
                    ? c.Category.Name
                    : string.Empty,

                SupplierId = c.SupplierId,

                SupplierName = c.Supplier != null
                    ? c.Supplier.Name
                    : string.Empty,

                StockStatus =
                    !c.IsActive
                        ? "Inactive"
                    : c.Quantity == 0
                        ? "Out of Stock"
                    : c.Quantity <= c.ReorderLevel
                        ? "Low Stock"
                    : "In Stock"
            });
        }

        public async Task<string?>
    UpdateImageAsync(
        int carId,
        string imagePath)
        {
            var car =
                await _context.Cars
                    .FirstOrDefaultAsync(
                        car =>
                            car.Id == carId &&
                            car.IsActive);


            if (car is null)
            {
                throw new KeyNotFoundException(
                    "Car not found.");
            }


            var oldImagePath =
                car.ImagePath;


            car.ImagePath =
                imagePath;


            await _context
                .SaveChangesAsync();


            return oldImagePath;
        }


        public async Task<string?>
            RemoveImageAsync(
                int carId)
        {
            var car =
                await _context.Cars
                    .FirstOrDefaultAsync(
                        car =>
                            car.Id == carId &&
                            car.IsActive);


            if (car is null)
            {
                throw new KeyNotFoundException(
                    "Car not found.");
            }


            var oldImagePath =
                car.ImagePath;


            car.ImagePath =
                null;


            await _context
                .SaveChangesAsync();


            return oldImagePath;
        }

        public async Task<List<CarDto>>
    GetArchivedCarsAsync()
        {
            return await _context.Cars
                .AsNoTracking()
                .Where(
                    car =>
                        !car.IsActive
                )
                .OrderByDescending(
                    car =>
                        car.CreatedAt
                )
                .Select(
                    car =>
                        new CarDto
                        {
                            Id =
                                car.Id,

                            Model =
                                car.Model,

                            Year =
                                car.Year,

                            Price =
                                car.Price,

                            Quantity =
                                car.Quantity,

                            ReorderLevel =
                                car.ReorderLevel,

                            Color =
                                car.Color,

                            FuelType =
                                car.FuelType,

                            Transmission =
                                car.Transmission,

                            ImagePath =
                                car.ImagePath,

                            CreatedAt =
                                car.CreatedAt,

                            IsActive =
                                car.IsActive,

                            BrandId =
                                car.BrandId,

                            BrandName =
                                car.Brand != null
                                    ? car.Brand.Name
                                    : "",

                            CategoryId =
                                car.CategoryId,

                            CategoryName =
                                car.Category != null
                                    ? car.Category.Name
                                    : "",

                            SupplierId =
                                car.SupplierId,

                            SupplierName =
                                car.Supplier != null
                                    ? car.Supplier.Name
                                    : "",

                            StockStatus =
                                "Inactive"
                        }
                )
                .ToListAsync();
        }

        public async Task
    RestoreCarAsync(
        int id)
        {
            var car =
                await _context.Cars
                    .FirstOrDefaultAsync(
                        car =>
                            car.Id == id
                    );


            if (car is null)
            {
                throw new KeyNotFoundException(
                    "Car not found."
                );
            }


            if (car.IsActive)
            {
                throw new InvalidOperationException(
                    "Car is already active."
                );
            }


            car.IsActive =
                true;


            await _context
                .SaveChangesAsync();
        }
    }
}
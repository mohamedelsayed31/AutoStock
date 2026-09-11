using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Services
{
    public class CarServiceTests
    {
        private AppDbContext CreateDbContext()
        {
            var options =
                new DbContextOptionsBuilder<AppDbContext>()
                    .UseInMemoryDatabase(
                        databaseName: Guid.NewGuid().ToString())
                    .Options;

            return new AppDbContext(options);
        }


        [Fact]
        public async Task GetByIdAsync_WhenCarExists_ReturnsCar()
        {
            // Arrange
            await using var context = CreateDbContext();

            var brand = new Brand
            {
                Id = 1,
                Name = "Toyota"
            };

            var category = new Category
            {
                Id = 1,
                Name = "Sedan"
            };

            var supplier = new Supplier
            {
                Id = 1,
                Name = "Toyota Egypt"
            };


            context.Brands.Add(brand);
            context.Categories.Add(category);
            context.Suppliers.Add(supplier);


            context.Cars.Add(
                new Car
                {
                    Id = 1,
                    Model = "Corolla",
                    Year = 2026,
                    Price = 1500000,
                    Quantity = 5,
                    ReorderLevel = 2,
                    Color = "Black",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 1,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                });


            await context.SaveChangesAsync();


            var service =
                new CarService(context);


            // Act
            var result =
                await service.GetByIdAsync(1);


            // Assert
            Assert.NotNull(result);

            Assert.Equal(
                "Corolla",
                result.Model);

            Assert.Equal(
                "Toyota",
                result.BrandName);

            Assert.Equal(
                "Sedan",
                result.CategoryName);

            Assert.Equal(
                "Toyota Egypt",
                result.SupplierName);
        }


        [Fact]
        public async Task GetByIdAsync_WhenCarDoesNotExist_ReturnsNull()
        {
            // Arrange
            await using var context = CreateDbContext();

            var service = new CarService(context);

            // Act
            var result = await service.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }


        [Fact]
        public async Task CreateAsync_WithValidData_CreatesCar()
        {
            // Arrange
            await using var context = CreateDbContext();

            context.Brands.Add(
                new Brand
                {
                    Id = 1,
                    Name = "Toyota"
                });

            context.Categories.Add(
                new Category
                {
                    Id = 1,
                    Name = "Sedan"
                });

            context.Suppliers.Add(
                new Supplier
                {
                    Id = 1,
                    Name = "Toyota Egypt"
                });

            await context.SaveChangesAsync();

            var service = new CarService(context);

            var dto = new AutoStock.Application.DTOs.Cars.CreateCarDto
            {
                Model = "Camry",
                Year = 2026,
                Price = 2000000,
                Quantity = 5,
                ReorderLevel = 2,
                Color = "Black",
                FuelType = "Gasoline",
                Transmission = "Automatic",
                BrandId = 1,
                CategoryId = 1,
                SupplierId = 1
            };

            // Act
            var result = await service.CreateAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal("Camry", result.Model);
            Assert.Equal("Toyota", result.BrandName);
            Assert.Equal(5, result.Quantity);
        }


        [Fact]
        public async Task UpdateAsync_WhenCarExists_UpdatesCarAndPreservesQuantity()
        {
            // Arrange
            await using var context = CreateDbContext();

            context.Brands.Add(
                new Brand
                {
                    Id = 1,
                    Name = "Toyota"
                });

            context.Categories.Add(
                new Category
                {
                    Id = 1,
                    Name = "Sedan"
                });

            context.Suppliers.Add(
                new Supplier
                {
                    Id = 1,
                    Name = "Toyota Egypt"
                });

            context.Cars.Add(
                new Car
                {
                    Id = 1,
                    Model = "Corolla",
                    Year = 2025,
                    Price = 1500000,
                    Quantity = 7,
                    ReorderLevel = 2,
                    Color = "White",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 1,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                });

            await context.SaveChangesAsync();

            var service = new CarService(context);

            var dto = new AutoStock.Application.DTOs.Cars.UpdateCarDto
            {
                Model = "Corolla Premium",
                Year = 2026,
                Price = 1700000,
                ReorderLevel = 3,
                Color = "Black",
                FuelType = "Gasoline",
                Transmission = "Automatic",
                BrandId = 1,
                CategoryId = 1,
                SupplierId = 1
            };

            // Act
            var updated = await service.UpdateAsync(1, dto);

            var car = await context.Cars.FindAsync(1);

            // Assert
            Assert.True(updated);
            Assert.NotNull(car);

            Assert.Equal(
                "Corolla Premium",
                car.Model);

            Assert.Equal(
                2026,
                car.Year);

            Assert.Equal(
                7,
                car.Quantity);
        }


        [Fact]
        public async Task DeleteAsync_WhenCarExists_PerformsSoftDelete()
        {
            // Arrange
            await using var context = CreateDbContext();

            context.Brands.Add(
                new Brand
                {
                    Id = 1,
                    Name = "Toyota"
                });

            context.Categories.Add(
                new Category
                {
                    Id = 1,
                    Name = "Sedan"
                });

            context.Suppliers.Add(
                new Supplier
                {
                    Id = 1,
                    Name = "Toyota Egypt"
                });

            context.Cars.Add(
                new Car
                {
                    Id = 1,
                    Model = "Camry",
                    Year = 2026,
                    Price = 2000000,
                    Quantity = 5,
                    ReorderLevel = 2,
                    Color = "Black",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 1,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                });

            await context.SaveChangesAsync();

            var service = new CarService(context);

            // Act
            var deleted = await service.DeleteAsync(1);

            var car = await context.Cars.FindAsync(1);

            // Assert
            Assert.True(deleted);
            Assert.NotNull(car);
            Assert.False(car.IsActive);
        }


        [Fact]
        public async Task GetAllAsync_WithSearch_ReturnsMatchingCars()
        {
            // Arrange
            await using var context = CreateDbContext();

            await SeedCarsAsync(context);

            var service = new CarService(context);

            var parameters =
                new AutoStock.Application.DTOs.Cars.CarQueryParameters
                {
                    Search = "Corolla",
                    Page = 1,
                    PageSize = 10
                };

            // Act
            var result =
                await service.GetAllAsync(parameters);

            // Assert
            Assert.Single(result.Items);

            Assert.Equal(
                "Corolla",
                result.Items.First().Model);
        }


        [Fact]
        public async Task GetAllAsync_WithBrandFilter_ReturnsOnlyMatchingBrand()
        {
            // Arrange
            await using var context = CreateDbContext();

            await SeedCarsAsync(context);

            var service = new CarService(context);

            var parameters =
                new AutoStock.Application.DTOs.Cars.CarQueryParameters
                {
                    BrandId = 1,
                    Page = 1,
                    PageSize = 10
                };

            // Act
            var result =
                await service.GetAllAsync(parameters);

            // Assert
            Assert.All(
                result.Items,
                car => Assert.Equal(1, car.BrandId));
        }


        [Fact]
        public async Task GetAllAsync_WithPagination_ReturnsCorrectPage()
        {
            // Arrange
            await using var context = CreateDbContext();

            await SeedCarsAsync(context);

            var service = new CarService(context);

            var parameters =
                new AutoStock.Application.DTOs.Cars.CarQueryParameters
                {
                    Page = 2,
                    PageSize = 1,
                    SortBy = "id",
                    SortDirection = "asc"
                };

            // Act
            var result =
                await service.GetAllAsync(parameters);

            // Assert
            Assert.Equal(2, result.Page);
            Assert.Equal(1, result.PageSize);
            Assert.Equal(3, result.TotalCount);
            Assert.Equal(3, result.TotalPages);
            Assert.Single(result.Items);
            Assert.Equal(2, result.Items.First().Id);
        }


        private async Task SeedCarsAsync(
    AppDbContext context)
        {
            context.Brands.AddRange(
                new Brand
                {
                    Id = 1,
                    Name = "Toyota"
                },
                new Brand
                {
                    Id = 2,
                    Name = "BMW"
                });

            context.Categories.Add(
                new Category
                {
                    Id = 1,
                    Name = "Sedan"
                });

            context.Suppliers.Add(
                new Supplier
                {
                    Id = 1,
                    Name = "Main Supplier"
                });


            context.Cars.AddRange(
                new Car
                {
                    Id = 1,
                    Model = "Corolla",
                    Year = 2026,
                    Price = 1500000,
                    Quantity = 5,
                    ReorderLevel = 2,
                    Color = "Black",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 1,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                },

                new Car
                {
                    Id = 2,
                    Model = "Camry",
                    Year = 2026,
                    Price = 2000000,
                    Quantity = 4,
                    ReorderLevel = 2,
                    Color = "White",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 1,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                },

                new Car
                {
                    Id = 3,
                    Model = "320i",
                    Year = 2026,
                    Price = 4000000,
                    Quantity = 3,
                    ReorderLevel = 2,
                    Color = "Blue",
                    FuelType = "Gasoline",
                    Transmission = "Automatic",
                    BrandId = 2,
                    CategoryId = 1,
                    SupplierId = 1,
                    IsActive = true
                });


            await context.SaveChangesAsync();
        }
    }
}
using AutoStock.Infrastructure.Data;
using AutoStock.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Integration
{
    public class CarsApiTests
        : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory
            _factory;


        public CarsApiTests(
            CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }


        [Fact]
        public async Task GetCars_WithoutToken_Returns401()
        {
            // Arrange
            var client =
                _factory.CreateClient();


            // Act
            var response =
                await client.GetAsync("/api/Cars");


            // Assert
            Assert.Equal(
                HttpStatusCode.Unauthorized,
                response.StatusCode);
        }


        [Fact]
        public async Task PostCar_WithUserToken_Returns403()
        {
            // Arrange
            var client =
                _factory.CreateClient();


            string email =
                $"user{Guid.NewGuid():N}@test.com";


            var registerResponse =
                await client.PostAsJsonAsync(
                    "/api/Auth/register",
                    new
                    {
                        fullName = "Test User",
                        email,
                        password = "Test123"
                    });


            Assert.True(
                registerResponse.IsSuccessStatusCode);


            var loginResponse =
                await client.PostAsJsonAsync(
                    "/api/Auth/login",
                    new
                    {
                        email,
                        password = "Test123"
                    });


            Assert.True(
                loginResponse.IsSuccessStatusCode);


            var loginData =
                await loginResponse.Content
                    .ReadFromJsonAsync<LoginResponse>();


            Assert.NotNull(loginData);


            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    loginData.Token);


            // Act
            var response =
                await client.PostAsJsonAsync(
                    "/api/Cars",
                    new
                    {
                        model = "User Test Car",
                        year = 2026,
                        price = 1000000,
                        quantity = 5,
                        reorderLevel = 2,
                        color = "Black",
                        fuelType = "Gasoline",
                        transmission = "Automatic",
                        imagePath = (string?)null,
                        brandId = 1,
                        categoryId = 1,
                        supplierId = 1
                    });


            // Assert
            Assert.Equal(
                HttpStatusCode.Forbidden,
                response.StatusCode);
        }


        [Fact]
        public async Task PostCar_WithAdminToken_Returns201()
        {
            // Arrange
            await SeedCarDependenciesAsync();


            var client =
                _factory.CreateClient();


            var loginResponse =
                await client.PostAsJsonAsync(
                    "/api/Auth/login",
                    new
                    {
                        email = "admin@test.com",
                        password = "TestAdmin123!"
                    });


            Assert.True(
                loginResponse.IsSuccessStatusCode);


            var loginData =
                await loginResponse.Content
                    .ReadFromJsonAsync<LoginResponse>();


            Assert.NotNull(loginData);


            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    loginData.Token);


            var car =
                new
                {
                    model = "Integration Camry",
                    year = 2026,
                    price = 2000000,
                    quantity = 5,
                    reorderLevel = 2,
                    color = "Black",
                    fuelType = "Gasoline",
                    transmission = "Automatic",
                    imagePath = (string?)null,
                    brandId = 1,
                    categoryId = 1,
                    supplierId = 1
                };


            // Act
            var response =
                await client.PostAsJsonAsync(
                    "/api/Cars",
                    car);


            // Assert
            Assert.Equal(
                HttpStatusCode.Created,
                response.StatusCode);
        }


        [Fact]
        public async Task Login_WithWrongPassword_Returns401()
        {
            // Arrange
            var client =
                _factory.CreateClient();


            // Act
            var response =
                await client.PostAsJsonAsync(
                    "/api/Auth/login",
                    new
                    {
                        email = "admin@test.com",
                        password = "WrongPassword123"
                    });


            // Assert
            Assert.Equal(
                HttpStatusCode.Unauthorized,
                response.StatusCode);
        }


        private async Task SeedCarDependenciesAsync()
        {
            using var scope =
                _factory.Services.CreateScope();


            var context =
                scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();


            if (!await context.Brands.AnyAsync())
            {
                context.Brands.Add(
                    new Brand
                    {
                        Id = 1,
                        Name = "Toyota"
                    });
            }


            if (!await context.Categories.AnyAsync())
            {
                context.Categories.Add(
                    new Category
                    {
                        Id = 1,
                        Name = "Sedan"
                    });
            }


            if (!await context.Suppliers.AnyAsync())
            {
                context.Suppliers.Add(
                    new Supplier
                    {
                        Id = 1,
                        Name = "Toyota Egypt"
                    });
            }


            await context.SaveChangesAsync();
        }


        private class LoginResponse
        {
            public string Token { get; set; }
                = string.Empty;
        }
    }
}

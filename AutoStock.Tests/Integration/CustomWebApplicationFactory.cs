using AutoStock.Application.Settings;
using AutoStock.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace AutoStock.Tests.Integration
{
    public class CustomWebApplicationFactory
        : WebApplicationFactory<Program>
    {
        private const string TestJwtKey =
            "AutoStock_Test_JWT_Key_2026_Integration_Test_123456789";

        private const string TestIssuer =
            "AutoStock.API";

        private const string TestAudience =
            "AutoStock.Client";


        protected override void ConfigureWebHost(
            IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");


            builder.ConfigureAppConfiguration(
                (_, configuration) =>
                {
                    var testSettings =
                        new Dictionary<string, string?>
                        {
                            ["Jwt:Key"] =
                                TestJwtKey,

                            ["Jwt:Issuer"] =
                                TestIssuer,

                            ["Jwt:Audience"] =
                                TestAudience,

                            ["Jwt:DurationInMinutes"] =
                                "60",

                            ["AdminUser:Email"] =
                                "admin@test.com",

                            ["AdminUser:Password"] =
                                "TestAdmin123!",

                            ["AdminUser:FullName"] =
                                "Test Administrator"
                        };


                    configuration.AddInMemoryCollection(
                        testSettings);
                });


            builder.ConfigureServices(services =>
            {
                // Remove the real SQL Server DbContext
                services.RemoveAll<
                    DbContextOptions<AppDbContext>>();

                services.RemoveAll<AppDbContext>();


                // Use temporary InMemory database
                services.AddDbContext<AppDbContext>(
                    options =>
                    {
                        options.UseInMemoryDatabase(
                            "AutoStockIntegrationTests");
                    });


                // Force JwtTokenService to use test JWT settings
                services.Configure<JwtSettings>(
                    options =>
                    {
                        options.Key =
                            TestJwtKey;

                        options.Issuer =
                            TestIssuer;

                        options.Audience =
                            TestAudience;

                        options.DurationInMinutes =
                            60;
                    });


                // Force JWT validation to use the exact same test key
                services.PostConfigure<JwtBearerOptions>(
                    JwtBearerDefaults.AuthenticationScheme,
                    options =>
                    {
                        options.TokenValidationParameters =
                            new TokenValidationParameters
                            {
                                ValidateIssuer = true,

                                ValidateAudience = true,

                                ValidateLifetime = true,

                                ValidateIssuerSigningKey = true,

                                ValidIssuer =
                                    TestIssuer,

                                ValidAudience =
                                    TestAudience,

                                IssuerSigningKey =
                                    new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(
                                            TestJwtKey)),

                                ClockSkew =
                                    TimeSpan.Zero
                            };
                    });
            });
        }
    }
}

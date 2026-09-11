using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AutoStock.Infrastructure.Identity
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            using var scope =
                serviceProvider.CreateScope();

            var roleManager =
                scope.ServiceProvider
                    .GetRequiredService<RoleManager<IdentityRole>>();

            var userManager =
                scope.ServiceProvider
                    .GetRequiredService<UserManager<ApplicationUser>>();


            string[] roles =
            {
                "Admin",
                "User"
            };


            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(
                        new IdentityRole(role));
                }
            }


            var adminEmail =
                configuration["AdminUser:Email"];

            var adminPassword =
                configuration["AdminUser:Password"];

            var adminFullName =
                configuration["AdminUser:FullName"];


            if (string.IsNullOrWhiteSpace(adminEmail) ||
                string.IsNullOrWhiteSpace(adminPassword))
            {
                return;
            }


            var adminUser =
                await userManager.FindByEmailAsync(adminEmail);


            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    FullName =
                        adminFullName ?? "AutoStock Admin",

                    Email = adminEmail,

                    UserName = adminEmail,

                    EmailConfirmed = true,

                    IsActive = true,

                    CreatedAt = DateTime.UtcNow
                };


                var createResult =
                    await userManager.CreateAsync(
                        adminUser,
                        adminPassword);


                if (!createResult.Succeeded)
                {
                    var errors =
                        string.Join(
                            ", ",
                            createResult.Errors
                                .Select(e => e.Description));

                    throw new InvalidOperationException(
                        $"Admin user creation failed: {errors}");
                }
            }


            if (!await userManager.IsInRoleAsync(
                    adminUser,
                    "Admin"))
            {
                await userManager.AddToRoleAsync(
                    adminUser,
                    "Admin");
            }
        }
    }
}
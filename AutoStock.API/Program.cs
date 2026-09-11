using AutoStock.API.ExceptionHandling;
using AutoStock.API.Services;
using AutoStock.Application.Interface;
using AutoStock.Application.Interfaces;
using AutoStock.Application.Settings;
using AutoStock.Infrastructure.Data;
using AutoStock.Infrastructure.Identity;
using AutoStock.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// JWT Settings
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));


// Controllers
builder.Services.AddControllers();


// Global Exception Handling
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();


// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration
            .GetConnectionString("DefaultConnection")));


// Required by Identity
builder.Services.AddSingleton<TimeProvider>(
    TimeProvider.System);


// Identity
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();


// Read JWT Configuration
var jwtSettings =
    builder.Configuration
        .GetSection("Jwt")
        .Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "JWT settings are missing.");


var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT signing key is missing.");


// Authentication - JWT Bearer
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtSettings.Issuer,

                ValidAudience =
                    jwtSettings.Audience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)),

                ClockSkew = TimeSpan.Zero
            };
    });


// Authorization
builder.Services.AddAuthorization();


// Application Services
builder.Services.AddScoped<ICarService, CarService>();

builder.Services.AddScoped<ITokenService, JwtTokenService>();

builder.Services.AddScoped<
    IReferenceDataService,
    ReferenceDataService>();

builder.Services.AddScoped<
    IStockService,
    StockService>();

builder.Services.AddScoped<
    IBrandService,
    BrandService>();

builder.Services.AddScoped<
    ICategoryService,
    CategoryService>();

builder.Services.AddScoped<
    ISupplierService,
    SupplierService>();

builder.Services.AddScoped<
    ICustomerService,
    CustomerService>();

builder.Services.AddScoped<
    ISaleService,
    SaleService>();

builder.Services.AddScoped<
    ISalesReportService,
    SalesReportService>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();

builder.Services.AddScoped<
    IReportService,
    ReportService>();

builder.Services.AddScoped<
    ICarImageStorage,
    CarImageStorage>();

builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

builder.Services.AddScoped<
    IAuditLogReadService,
    AuditLogReadService>();

builder.Services.AddScoped<
    IPurchaseOrderService,
    PurchaseOrderService>();

builder.Services.AddScoped<
    IPurchaseReportService,
    PurchaseReportService>();

builder.Services.AddScoped<
    IProfitReportService,
    ProfitReportService>();

builder.Services.AddScoped<
    IInventoryCostService,
    InventoryCostService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<
    ICurrentUserService,
    CurrentUserService>();

builder.Services.AddScoped<
    IAuditLogService,
    AuditLogService>();

builder.Services.AddHttpClient<
    IVinDecoderService,
    VinDecoderService>(client =>
    {
        client.BaseAddress =
            new Uri(
                "https://vpic.nhtsa.dot.gov/api/");

        client.Timeout =
            TimeSpan.FromSeconds(15);
    });


// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
                "Enter your JWT token."
        });


    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        });
});


builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "ReactClient",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});


var app = builder.Build();


// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


// Global Exception Handler
app.UseExceptionHandler();


// HTTPS
app.UseHttpsRedirection();


app.UseStaticFiles();


app.UseCors("ReactClient");


// Authentication must come before Authorization
app.UseAuthentication();

app.UseAuthorization();


// Controllers
app.MapControllers();


await IdentitySeeder.SeedAsync(
    app.Services,
    app.Configuration);


app.Run();


public partial class Program
{
}
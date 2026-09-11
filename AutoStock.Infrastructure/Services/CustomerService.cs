using AutoStock.Application.DTOs.Customers;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public CustomerService(
        AppDbContext context,
        IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }


    public async Task<IReadOnlyList<CustomerDto>>
        GetAllAsync()
    {
        return await _context.Customers
            .AsNoTracking()
            .OrderByDescending(
                customer => customer.CreatedAt)
            .Select(customer =>
                new CustomerDto
                {
                    Id = customer.Id,

                    FullName =
                        customer.FullName,

                    PhoneNumber =
                        customer.PhoneNumber,

                    Email =
                        customer.Email,

                    Address =
                        customer.Address,

                    CreatedAt =
                        customer.CreatedAt
                })
            .ToListAsync();
    }


    public async Task<CustomerDto?>
        GetByIdAsync(int id)
    {
        return await _context.Customers
            .AsNoTracking()
            .Where(
                customer =>
                    customer.Id == id)
            .Select(customer =>
                new CustomerDto
                {
                    Id = customer.Id,

                    FullName =
                        customer.FullName,

                    PhoneNumber =
                        customer.PhoneNumber,

                    Email =
                        customer.Email,

                    Address =
                        customer.Address,

                    CreatedAt =
                        customer.CreatedAt
                })
            .FirstOrDefaultAsync();
    }


    public async Task<CustomerDto>
        CreateAsync(
            CreateCustomerDto dto)
    {
        var customer =
            new Customer
            {
                FullName =
                    dto.FullName.Trim(),

                PhoneNumber =
                    dto.PhoneNumber.Trim(),

                Email =
                    string.IsNullOrWhiteSpace(
                        dto.Email)
                        ? null
                        : dto.Email.Trim(),

                Address =
                    string.IsNullOrWhiteSpace(
                        dto.Address)
                        ? null
                        : dto.Address.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };


        _context.Customers.Add(
            customer);


        await _context
            .SaveChangesAsync();


        await _auditLogService.LogAsync(
            "Create",
            "Customer",
            customer.Id.ToString(),
            $"Customer {customer.FullName} created.");


        return new CustomerDto
        {
            Id = customer.Id,

            FullName =
                customer.FullName,

            PhoneNumber =
                customer.PhoneNumber,

            Email =
                customer.Email,

            Address =
                customer.Address,

            CreatedAt =
                customer.CreatedAt
        };
    }


    public async Task<bool>
        UpdateAsync(
            int id,
            UpdateCustomerDto dto)
    {
        var customer =
            await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.Id == id);


        if (customer is null)
        {
            return false;
        }


        customer.FullName =
            dto.FullName.Trim();

        customer.PhoneNumber =
            dto.PhoneNumber.Trim();

        customer.Email =
            string.IsNullOrWhiteSpace(
                dto.Email)
                ? null
                : dto.Email.Trim();

        customer.Address =
            string.IsNullOrWhiteSpace(
                dto.Address)
                ? null
                : dto.Address.Trim();


        await _context
            .SaveChangesAsync();


        await _auditLogService.LogAsync(
            "Update",
            "Customer",
            customer.Id.ToString(),
            $"Customer {customer.FullName} updated.");


        return true;
    }


    public async Task<bool>
        DeleteAsync(int id)
    {
        var customer =
            await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.Id == id);


        if (customer is null)
        {
            return false;
        }


        var hasSales =
            await _context.Sales
                .AsNoTracking()
                .AnyAsync(
                    sale =>
                        sale.CustomerId == id);


        if (hasSales)
        {
            throw new InvalidOperationException(
                "Cannot delete this customer because sales history exists.");
        }


        var customerId =
            customer.Id;

        var customerName =
            customer.FullName;


        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();


        try
        {
            _context.Customers.Remove(
                customer);


            await _context
                .SaveChangesAsync();


            await _auditLogService.LogAsync(
                "Delete",
                "Customer",
                customerId.ToString(),
                $"Customer {customerName} deleted.");


            await transaction
                .CommitAsync();


            return true;
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }
}
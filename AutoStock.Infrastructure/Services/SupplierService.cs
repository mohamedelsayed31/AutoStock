using AutoStock.Application.DTOs.Suppliers;
using AutoStock.Application.Interface;
using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services
{
    public class SupplierService
        : ISupplierService
    {
        private readonly AppDbContext _context;


        public SupplierService(
            AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<SupplierDto>>
            GetAllAsync()
        {
            return await _context.Suppliers
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    Address = s.Address
                })
                .ToListAsync();
        }


        public async Task<SupplierDto?>
            GetByIdAsync(int id)
        {
            return await _context.Suppliers
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    Address = s.Address
                })
                .FirstOrDefaultAsync();
        }


        public async Task<SupplierDto>
            CreateAsync(
                CreateSupplierDto dto)
        {
            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Supplier name is required.");
            }


            var exists =
                await _context.Suppliers
                    .AnyAsync(
                        s => s.Name == name);


            if (exists)
            {
                throw new InvalidOperationException(
                    "A supplier with this name already exists.");
            }


            var supplier =
                new Supplier
                {
                    Name = name,

                    Email =
                        string.IsNullOrWhiteSpace(
                            dto.Email)
                            ? string.Empty
                            : dto.Email.Trim(),

                    PhoneNumber =
                        string.IsNullOrWhiteSpace(
                            dto.PhoneNumber)
                            ? string.Empty
                            : dto.PhoneNumber.Trim(),

                    Address =
                        string.IsNullOrWhiteSpace(
                            dto.Address)
                            ? string.Empty
                            : dto.Address.Trim()
                };


            _context.Suppliers
                .Add(supplier);


            await _context
                .SaveChangesAsync();


            return new SupplierDto
            {
                Id = supplier.Id,

                Name = supplier.Name,

                Email = supplier.Email,

                PhoneNumber =
                    supplier.PhoneNumber,

                Address = supplier.Address
            };
        }


        public async Task<bool>
            UpdateAsync(
                int id,
                UpdateSupplierDto dto)
        {
            var supplier =
                await _context.Suppliers
                    .FindAsync(id);


            if (supplier is null)
            {
                return false;
            }


            var name =
                dto.Name.Trim();


            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Supplier name is required.");
            }


            var duplicate =
                await _context.Suppliers
                    .AnyAsync(
                        s =>
                            s.Id != id &&
                            s.Name == name);


            if (duplicate)
            {
                throw new InvalidOperationException(
                    "A supplier with this name already exists.");
            }


            supplier.Name = name;

            supplier.Email =
                string.IsNullOrWhiteSpace(
                    dto.Email)
                    ? string.Empty
                    : dto.Email.Trim();

            supplier.PhoneNumber =
                string.IsNullOrWhiteSpace(
                    dto.PhoneNumber)
                    ? string.Empty
                    : dto.PhoneNumber.Trim();

            supplier.Address =
                string.IsNullOrWhiteSpace(
                    dto.Address)
                    ? string.Empty
                    : dto.Address.Trim();


            await _context
                .SaveChangesAsync();


            return true;
        }


        public async Task<bool>
            DeleteAsync(
                int id)
        {
            var supplier =
                await _context.Suppliers
                    .FirstOrDefaultAsync(
                        supplier =>
                            supplier.Id == id);


            if (supplier is null)
            {
                return false;
            }


            var hasCars =
                await _context.Cars
                    .AsNoTracking()
                    .AnyAsync(
                        car =>
                            car.SupplierId == id);


            if (hasCars)
            {
                throw new InvalidOperationException(
                    "Cannot delete this supplier because vehicles are assigned to it.");
            }


            var hasPurchaseOrders =
                await _context.PurchaseOrders
                    .AsNoTracking()
                    .AnyAsync(
                        order =>
                            order.SupplierId == id);


            if (hasPurchaseOrders)
            {
                throw new InvalidOperationException(
                    "Cannot delete this supplier because purchase history exists.");
            }


            _context.Suppliers.Remove(
                supplier);


            await _context
                .SaveChangesAsync();


            return true;
        }
    }
}
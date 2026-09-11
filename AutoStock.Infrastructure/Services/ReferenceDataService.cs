using AutoStock.Application.DTOs.Common;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Services
{
    public class ReferenceDataService
        : IReferenceDataService
    {
        private readonly AppDbContext _context;


        public ReferenceDataService(
            AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<LookupDto>>
            GetBrandsAsync()
        {
            return await _context.Brands
                .AsNoTracking()
                .OrderBy(b => b.Name)
                .Select(b => new LookupDto
                {
                    Id = b.Id,
                    Name = b.Name
                })
                .ToListAsync();
        }


        public async Task<IEnumerable<LookupDto>>
            GetCategoriesAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new LookupDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();
        }


        public async Task<IEnumerable<LookupDto>>
            GetSuppliersAsync()
        {
            return await _context.Suppliers
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .Select(s => new LookupDto
                {
                    Id = s.Id,
                    Name = s.Name
                })
                .ToListAsync();
        }
    }
}
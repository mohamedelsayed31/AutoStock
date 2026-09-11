using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.DTOs.Cars
{
    public class CarDto
    {
        public int Id { get; set; }

        public string Model { get; set; } = string.Empty;

        public int Year { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public int ReorderLevel { get; set; }

        public string Color { get; set; } = string.Empty;

        public string FuelType { get; set; } = string.Empty;

        public string Transmission { get; set; } = string.Empty;

        public string? ImagePath { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsActive { get; set; }

        public int BrandId { get; set; }

        public string BrandName { get; set; } = string.Empty;

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public int SupplierId { get; set; }

        public string SupplierName { get; set; } = string.Empty;

        public string StockStatus { get; set; } = string.Empty;
    }
}

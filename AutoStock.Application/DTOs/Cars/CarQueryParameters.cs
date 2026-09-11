using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.DTOs.Cars
{
    public class CarQueryParameters
    {
        public string? Search { get; set; }

        public int? BrandId { get; set; }

        public int? CategoryId { get; set; }

        public int? SupplierId { get; set; }

        public int? Year { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? StockStatus { get; set; }

        public bool IncludeInactive { get; set; } = false;

        public string SortBy { get; set; } = "id";

        public string SortDirection { get; set; } = "asc";


        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;


        [Range(1, 100)]
        public int PageSize { get; set; } = 10;
    }
}

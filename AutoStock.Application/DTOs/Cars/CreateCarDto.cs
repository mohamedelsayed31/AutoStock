using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.DTOs.Cars
{
    public class CreateCarDto
    {
        [Required(ErrorMessage = "Model is required.")]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;


        [Range(1900, 2100)]
        public int Year { get; set; }


        [Range(1, 100000000)]
        public decimal Price { get; set; }


        [Range(0, 1000)]
        public int Quantity { get; set; }


        [Range(0, 100)]
        public int ReorderLevel { get; set; }


        [Required]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;


        [Required]
        [MaxLength(50)]
        public string FuelType { get; set; } = string.Empty;


        [Required]
        [MaxLength(50)]
        public string Transmission { get; set; } = string.Empty;


        public string? ImagePath { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Please select a valid brand."
        )]
        public int BrandId { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Please select a valid category."
        )]
        public int CategoryId { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Please select a valid supplier."
        )]
        public int SupplierId { get; set; }
    }
}

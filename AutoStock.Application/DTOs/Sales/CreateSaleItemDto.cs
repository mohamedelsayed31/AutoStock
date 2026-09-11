using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.Sales;

public class CreateSaleItemDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid car is required."
    )]
    public int CarId { get; set; }


    [Range(
        1,
        1000,
        ErrorMessage = "Quantity must be between 1 and 1000."
    )]
    public int Quantity { get; set; }


    [Range(
        typeof(decimal),
        "0.01",
        "100000000",
        ErrorMessage = "Unit price must be greater than zero."
    )]
    public decimal UnitPrice { get; set; }
}
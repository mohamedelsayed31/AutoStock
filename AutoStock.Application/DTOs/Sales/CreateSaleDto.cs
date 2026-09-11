using AutoStock.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.Sales;

public class CreateSaleDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid customer is required."
    )]
    public int CustomerId { get; set; }


    [EnumDataType(
        typeof(SalePaymentMethod),
        ErrorMessage = "Invalid payment method."
    )]
    public SalePaymentMethod PaymentMethod { get; set; }


    [MaxLength(1000)]
    public string? Notes { get; set; }


    [Required]
    [MinLength(
        1,
        ErrorMessage = "The sale must contain at least one item."
    )]
    public List<CreateSaleItemDto> Items { get; set; }
        = new();
}
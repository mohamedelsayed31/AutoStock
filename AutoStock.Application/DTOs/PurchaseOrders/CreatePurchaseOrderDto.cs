using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.PurchaseOrders;

public class CreatePurchaseOrderDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid supplier is required."
    )]
    public int SupplierId { get; set; }


    [MaxLength(1000)]
    public string? Notes { get; set; }


    [Required]
    [MinLength(
        1,
        ErrorMessage = "Purchase order must contain at least one item."
    )]
    public List<CreatePurchaseOrderItemDto>
        Items
    { get; set; } = new();
}
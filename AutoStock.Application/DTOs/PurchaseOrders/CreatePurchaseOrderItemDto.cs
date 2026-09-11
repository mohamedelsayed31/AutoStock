using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.PurchaseOrders;

public class CreatePurchaseOrderItemDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "A valid car is required."
    )]
    public int CarId { get; set; }


    [Range(
        1,
        10000,
        ErrorMessage = "Quantity must be greater than zero."
    )]
    public int Quantity { get; set; }


    [Range(
        typeof(decimal),
        "0.01",
        "1000000000",
        ErrorMessage = "Unit cost must be greater than zero."
    )]
    public decimal UnitCost { get; set; }
}
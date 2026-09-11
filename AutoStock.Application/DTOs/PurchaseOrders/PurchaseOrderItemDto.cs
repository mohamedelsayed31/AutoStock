namespace AutoStock.Application.DTOs.PurchaseOrders;

public class PurchaseOrderItemDto
{
    public int Id { get; set; }

    public int CarId { get; set; }

    public string CarName { get; set; }
        = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public decimal LineTotal { get; set; }
}
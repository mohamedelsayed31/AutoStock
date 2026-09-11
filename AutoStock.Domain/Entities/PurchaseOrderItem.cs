namespace AutoStock.Domain.Entities;

public class PurchaseOrderItem
{
    public int Id { get; set; }


    public int PurchaseOrderId { get; set; }

    public PurchaseOrder? PurchaseOrder { get; set; }


    public int CarId { get; set; }

    public Car? Car { get; set; }


    public int Quantity { get; set; }


    public decimal UnitCost { get; set; }


    public decimal LineTotal { get; set; }
}
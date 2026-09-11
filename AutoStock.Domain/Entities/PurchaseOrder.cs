using AutoStock.Domain.Enums;

namespace AutoStock.Domain.Entities;

public class PurchaseOrder
{
    public int Id { get; set; }


    public int SupplierId { get; set; }

    public Supplier? Supplier { get; set; }


    public DateTime OrderDate { get; set; }
        = DateTime.UtcNow;


    public PurchaseOrderStatus Status { get; set; }
        = PurchaseOrderStatus.Draft;


    public decimal TotalAmount { get; set; }


    public string? Notes { get; set; }


    public DateTime? ReceivedAt { get; set; }


    public ICollection<PurchaseOrderItem>
        Items
    { get; set; }
            = new List<PurchaseOrderItem>();
}
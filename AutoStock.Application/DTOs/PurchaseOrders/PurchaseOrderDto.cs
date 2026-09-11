using AutoStock.Domain.Enums;

namespace AutoStock.Application.DTOs.PurchaseOrders;

public class PurchaseOrderDto
{
    public int Id { get; set; }

    public int SupplierId { get; set; }

    public string SupplierName { get; set; }
        = string.Empty;

    public DateTime OrderDate { get; set; }

    public PurchaseOrderStatus Status { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }

    public DateTime? ReceivedAt { get; set; }

    public List<PurchaseOrderItemDto>
        Items
    { get; set; } = new();
}
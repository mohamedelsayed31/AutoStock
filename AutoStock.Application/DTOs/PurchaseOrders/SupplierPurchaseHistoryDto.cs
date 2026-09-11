namespace AutoStock.Application.DTOs.PurchaseOrders;

public class SupplierPurchaseHistoryDto
{
    public int SupplierId { get; set; }

    public string SupplierName { get; set; }
        = string.Empty;


    public int TotalOrders { get; set; }

    public int DraftOrders { get; set; }

    public int SubmittedOrders { get; set; }

    public int ReceivedOrders { get; set; }

    public int CancelledOrders { get; set; }


    public int TotalReceivedUnits { get; set; }

    public decimal TotalReceivedValue { get; set; }


    public List<PurchaseOrderDto>
        Orders
    { get; set; } = new();
}
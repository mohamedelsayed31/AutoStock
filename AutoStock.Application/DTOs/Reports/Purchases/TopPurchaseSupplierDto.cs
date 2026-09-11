namespace AutoStock.Application.DTOs.Reports.Purchases;

public class TopPurchaseSupplierDto
{
    public int SupplierId { get; set; }

    public string SupplierName { get; set; }
        = string.Empty;

    public int ReceivedOrders { get; set; }

    public int UnitsReceived { get; set; }

    public decimal PurchaseValue { get; set; }
}
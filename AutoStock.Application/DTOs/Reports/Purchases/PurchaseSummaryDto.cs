namespace AutoStock.Application.DTOs.Reports.Purchases;

public class PurchaseSummaryDto
{
    public int TotalOrders { get; set; }

    public int DraftOrders { get; set; }

    public int SubmittedOrders { get; set; }

    public int ReceivedOrders { get; set; }

    public int CancelledOrders { get; set; }

    public int TotalUnitsPurchased { get; set; }

    public decimal TotalPurchaseSpend { get; set; }
}
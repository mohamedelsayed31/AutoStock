namespace AutoStock.Application.DTOs.Reports.Purchases;

public class TopPurchasedCarDto
{
    public int CarId { get; set; }

    public string CarName { get; set; }
        = string.Empty;

    public int UnitsPurchased { get; set; }

    public decimal PurchaseValue { get; set; }
}
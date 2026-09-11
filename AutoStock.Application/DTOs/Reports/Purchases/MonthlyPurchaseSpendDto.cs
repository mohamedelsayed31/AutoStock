namespace AutoStock.Application.DTOs.Reports.Purchases;

public class MonthlyPurchaseSpendDto
{
    public int Year { get; set; }

    public int Month { get; set; }

    public string MonthLabel { get; set; }
        = string.Empty;

    public int OrdersReceived { get; set; }

    public int UnitsReceived { get; set; }

    public decimal TotalSpend { get; set; }
}
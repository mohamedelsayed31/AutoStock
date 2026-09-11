namespace AutoStock.Application.DTOs.Reports.Profit;

public class TopProfitableCarDto
{
    public int CarId { get; set; }

    public string CarName { get; set; }
        = string.Empty;

    public int UnitsSold { get; set; }

    public decimal Revenue { get; set; }

    public decimal Cogs { get; set; }

    public decimal GrossProfit { get; set; }

    public decimal GrossMarginPercent { get; set; }
}
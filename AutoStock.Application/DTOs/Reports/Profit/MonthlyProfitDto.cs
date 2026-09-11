namespace AutoStock.Application.DTOs.Reports.Profit;

public class MonthlyProfitDto
{
    public int Year { get; set; }

    public int Month { get; set; }

    public string MonthLabel { get; set; }
        = string.Empty;

    public decimal Revenue { get; set; }

    public decimal RevenueWithKnownCost { get; set; }

    public decimal Cogs { get; set; }

    public decimal GrossProfit { get; set; }

    public decimal GrossMarginPercent { get; set; }

    public decimal CostCoveragePercent { get; set; }
}
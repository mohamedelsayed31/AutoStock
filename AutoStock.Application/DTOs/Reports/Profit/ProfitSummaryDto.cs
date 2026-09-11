namespace AutoStock.Application.DTOs.Reports.Profit;

public class ProfitSummaryDto
{
    public decimal TotalRevenue { get; set; }

    public decimal RevenueWithKnownCost { get; set; }

    public decimal RevenueWithUnknownCost { get; set; }

    public decimal TotalCogs { get; set; }

    public decimal GrossProfit { get; set; }

    public decimal GrossMarginPercent { get; set; }

    public decimal CostCoveragePercent { get; set; }

    public int TotalUnitsSold { get; set; }

    public int UnitsWithKnownCost { get; set; }
}
namespace AutoStock.Application.DTOs.Reports.Profit;

public class ProfitReportDto
{
    public ProfitSummaryDto Summary { get; set; }
        = new();

    public List<TopProfitableCarDto> TopCars { get; set; }
        = new();

    public List<MonthlyProfitDto> MonthlyProfit { get; set; }
        = new();
}
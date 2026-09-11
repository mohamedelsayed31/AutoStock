namespace AutoStock.Application.DTOs.Reports.Sales;

public class SalesSummaryDto
{
    public int TotalSales { get; set; }

    public decimal TotalRevenue { get; set; }

    public int TotalCarsSold { get; set; }

    public decimal AverageSaleValue { get; set; }
}
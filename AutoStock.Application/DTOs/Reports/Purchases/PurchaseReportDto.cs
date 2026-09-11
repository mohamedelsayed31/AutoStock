namespace AutoStock.Application.DTOs.Reports.Purchases;

public class PurchaseReportDto
{
    public PurchaseSummaryDto Summary { get; set; }
        = new();

    public List<TopPurchaseSupplierDto>
        TopSuppliers
    { get; set; } = new();

    public List<TopPurchasedCarDto>
        TopCars
    { get; set; } = new();

    public List<MonthlyPurchaseSpendDto>
        MonthlySpend
    { get; set; } = new();
}
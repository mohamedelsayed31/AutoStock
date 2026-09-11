namespace AutoStock.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalCars { get; set; }

    public int TotalStock { get; set; }

    public int LowStockCars { get; set; }

    public int OutOfStockCars { get; set; }

    public int TotalBrands { get; set; }

    public int TotalCategories { get; set; }

    public int TotalSuppliers { get; set; }

    public decimal TotalInventoryValue { get; set; }


    public List<DashboardRecentTransactionDto>
        RecentTransactions
    { get; set; }
        = new();


    public List<DashboardStockAlertDto>
        StockAlerts
    { get; set; }
        = new();
}
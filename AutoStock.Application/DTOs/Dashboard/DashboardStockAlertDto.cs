namespace AutoStock.Application.DTOs.Dashboard;

public class DashboardStockAlertDto
{
    public int CarId { get; set; }

    public string Model { get; set; }
        = string.Empty;

    public string BrandName { get; set; }
        = string.Empty;

    public int Quantity { get; set; }

    public int ReorderLevel { get; set; }

    public string StockStatus { get; set; }
        = string.Empty;
}
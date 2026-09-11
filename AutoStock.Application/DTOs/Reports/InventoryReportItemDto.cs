namespace AutoStock.Application.DTOs.Reports;

public class InventoryReportItemDto
{
    public int CarId { get; set; }

    public string Model { get; set; }
        = string.Empty;

    public string BrandName { get; set; }
        = string.Empty;

    public string CategoryName { get; set; }
        = string.Empty;

    public string SupplierName { get; set; }
        = string.Empty;

    public int Year { get; set; }

    public decimal Price { get; set; }

    public int Quantity { get; set; }

    public int ReorderLevel { get; set; }

    public string StockStatus { get; set; }
        = string.Empty;

    public decimal InventoryValue { get; set; }
}
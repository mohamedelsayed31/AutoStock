namespace AutoStock.Application.DTOs.Reports.Sales;

public class TopSellingCarDto
{
    public int CarId { get; set; }

    public string CarName { get; set; }
        = string.Empty;

    public int QuantitySold { get; set; }

    public decimal Revenue { get; set; }
}
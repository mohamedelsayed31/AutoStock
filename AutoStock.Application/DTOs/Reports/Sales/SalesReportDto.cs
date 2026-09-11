namespace AutoStock.Application.DTOs.Reports.Sales;

public class SalesReportDto
{
    public SalesSummaryDto Summary { get; set; }
        = new();

    public List<TopSellingCarDto> TopSellingCars { get; set; }
        = new();

    public List<PaymentMethodSalesDto> SalesByPaymentMethod { get; set; }
        = new();
}
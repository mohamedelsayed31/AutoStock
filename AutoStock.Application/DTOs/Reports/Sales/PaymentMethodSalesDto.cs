using AutoStock.Domain.Enums;

namespace AutoStock.Application.DTOs.Reports.Sales;

public class PaymentMethodSalesDto
{
    public SalePaymentMethod PaymentMethod { get; set; }

    public int SalesCount { get; set; }

    public decimal Revenue { get; set; }
}
using AutoStock.Domain.Enums;

namespace AutoStock.Application.DTOs.Sales;

public class SaleDto
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string CustomerName { get; set; }
        = string.Empty;

    public DateTime SaleDate { get; set; }

    public SalePaymentMethod PaymentMethod { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }


    /* =========================
       Profit Summary
    ========================= */

    public decimal RevenueWithKnownCost { get; set; }

    public decimal RevenueWithUnknownCost { get; set; }

    public decimal TotalCogs { get; set; }

    public decimal GrossProfit { get; set; }

    public decimal GrossMarginPercent { get; set; }

    public decimal CostCoveragePercent { get; set; }


    public List<SaleItemDto> Items { get; set; }
        = new();
}
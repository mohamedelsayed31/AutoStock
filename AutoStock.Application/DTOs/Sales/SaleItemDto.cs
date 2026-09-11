namespace AutoStock.Application.DTOs.Sales;

public class SaleItemDto
{
    public int Id { get; set; }

    public int CarId { get; set; }

    public string CarName { get; set; }
        = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }


    /* =========================
       Cost Accounting
    ========================= */

    public decimal? UnitCost { get; set; }

    public decimal? CostOfGoodsSold { get; set; }

    public decimal? GrossProfit { get; set; }

    public decimal? GrossMarginPercent { get; set; }
}
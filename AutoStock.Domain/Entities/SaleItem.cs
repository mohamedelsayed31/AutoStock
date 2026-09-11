namespace AutoStock.Domain.Entities;

public class SaleItem
{
    public int Id { get; set; }

    public int SaleId { get; set; }

    public Sale? Sale { get; set; }

    public int CarId { get; set; }

    public Car? Car { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }

    public decimal? UnitCost { get; set; }

    public decimal? CostOfGoodsSold { get; set; }

    public decimal? GrossProfit { get; set; }
}
namespace AutoStock.Application.DTOs.InventoryCost;

public class InventoryCostBasisDto
{
    public int CarId { get; set; }

    public string CarModel { get; set; }
        = string.Empty;

    public int Quantity { get; set; }

    public decimal? PreviousAverageUnitCost
    { get; set; }

    public decimal AverageUnitCost
    { get; set; }

    public decimal InventoryValue
    { get; set; }

    public DateTime EffectiveAt
    { get; set; }

    public string? Reason { get; set; }
}
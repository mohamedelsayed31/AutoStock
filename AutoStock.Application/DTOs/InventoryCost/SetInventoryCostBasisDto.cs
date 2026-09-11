using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.InventoryCost;

public class SetInventoryCostBasisDto
{
    [Range(
        typeof(decimal),
        "0.01",
        "1000000000")]
    public decimal UnitCost { get; set; }

    [MaxLength(250)]
    public string? Reason { get; set; }
}

namespace AutoStock.Application.DTOs.Reports;

public class StockMovementSummaryDto
{
    public int TotalTransactions { get; set; }

    public int TotalStockIn { get; set; }

    public int TotalStockOut { get; set; }

    public int NetMovement { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
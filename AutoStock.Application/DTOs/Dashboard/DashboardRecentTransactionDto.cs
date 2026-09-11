namespace AutoStock.Application.DTOs.Dashboard;

public class DashboardRecentTransactionDto
{
    public int Id { get; set; }

    public int CarId { get; set; }

    public string CarModel { get; set; }
        = string.Empty;

    public string TransactionType { get; set; }
        = string.Empty;

    public int Quantity { get; set; }

    public DateTime TransactionDate { get; set; }

    public string? Notes { get; set; }
}
namespace AutoStock.Application.DTOs.Stock
{
    public class StockTransactionDto
    {
        public int Id { get; set; }


        public int CarId { get; set; }


        public string CarModel { get; set; }
            = string.Empty;


        public string TransactionType { get; set; }
            = string.Empty;


        public int Quantity { get; set; }


        public DateTime TransactionDate { get; set; }


        public decimal? UnitCost { get; set; }


        public decimal? InventoryValue { get; set; }


        public string? SourceType { get; set; }


        public int? SourceId { get; set; }


        public string? Notes { get; set; }
    }
}
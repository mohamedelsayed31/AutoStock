namespace AutoStock.Application.DTOs.Stock
{
    public class StockOperationDto
    {
        public int Quantity { get; set; }

        /*
         * Required only for Stock In.
         *
         * Stock Out ignores this field.
         */
        public decimal? UnitCost { get; set; }

        public string? Notes { get; set; }
    }
}
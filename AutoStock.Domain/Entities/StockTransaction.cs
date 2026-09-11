using System.ComponentModel.DataAnnotations;

namespace AutoStock.Domain.Entities
{
    public class StockTransaction
    {
        public int Id { get; set; }


        public int CarId { get; set; }


        [Required]
        [MaxLength(20)]
        public string TransactionType { get; set; }
            = string.Empty;


        [Range(1, 10000)]
        public int Quantity { get; set; }


        public DateTime TransactionDate { get; set; }
            = DateTime.UtcNow;


        /*
         * Historical unit cost snapshot
         * at the time of the stock movement.
         *
         * Nullable because legacy inventory
         * may have unknown cost.
         */
        public decimal? UnitCost { get; set; }


        /*
         * Absolute inventory value represented
         * by this stock movement.
         *
         * Example:
         *
         * 5 units × 900,000
         * = 4,500,000
         */
        public decimal? InventoryValue { get; set; }


        /*
         * Examples:
         *
         * Manual
         * PurchaseOrder
         * Sale
         *
         * Nullable for historical rows created
         * before this metadata existed.
         */
        [MaxLength(30)]
        public string? SourceType { get; set; }


        /*
         * PurchaseOrder ID or Sale ID.
         *
         * Manual operations keep this null.
         */
        public int? SourceId { get; set; }


        [MaxLength(250)]
        public string? Notes { get; set; }


        public Car? Car { get; set; }
    }
}
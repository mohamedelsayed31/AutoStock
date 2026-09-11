using AutoStock.Domain.Enums;

namespace AutoStock.Domain.Entities;

public class Sale
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public DateTime SaleDate { get; set; }
        = DateTime.UtcNow;

    public SalePaymentMethod PaymentMethod { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }

    public ICollection<SaleItem> SaleItems { get; set; }
        = new List<SaleItem>();
}
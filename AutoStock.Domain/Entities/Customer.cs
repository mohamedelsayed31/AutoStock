namespace AutoStock.Domain.Entities;

public class Customer
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Address { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Sale> Sales { get; set; }
        = new List<Sale>();
}
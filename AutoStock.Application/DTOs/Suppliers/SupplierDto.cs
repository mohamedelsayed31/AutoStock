namespace AutoStock.Application.DTOs.Suppliers
{
    public class SupplierDto
    {
        public int Id { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
    }
}
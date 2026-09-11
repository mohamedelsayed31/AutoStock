namespace AutoStock.Application.DTOs.Suppliers
{
    public class CreateSupplierDto
    {
        public string Name { get; set; }
            = string.Empty;

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
    }
}
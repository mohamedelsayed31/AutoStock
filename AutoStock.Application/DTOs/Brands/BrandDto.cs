namespace AutoStock.Application.DTOs.Brands
{
    public class BrandDto
    {
        public int Id { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string? Country { get; set; }
    }
}
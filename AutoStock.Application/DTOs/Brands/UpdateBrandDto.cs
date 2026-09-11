namespace AutoStock.Application.DTOs.Brands
{
    public class UpdateBrandDto
    {
        public string Name { get; set; }
            = string.Empty;

        public string? Country { get; set; }
    }
}
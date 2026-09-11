using System.ComponentModel.DataAnnotations;

namespace AutoStock.Application.DTOs.Customers;

public class UpdateCustomerDto
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; }
        = string.Empty;


    [Required]
    [MaxLength(30)]
    public string PhoneNumber { get; set; }
        = string.Empty;


    [EmailAddress]
    [MaxLength(200)]
    public string? Email { get; set; }


    [MaxLength(500)]
    public string? Address { get; set; }
}
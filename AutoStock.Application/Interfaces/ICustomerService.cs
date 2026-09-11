using AutoStock.Application.DTOs.Customers;

namespace AutoStock.Application.Interface;

public interface ICustomerService
{
    Task<IReadOnlyList<CustomerDto>> GetAllAsync();

    Task<CustomerDto?> GetByIdAsync(int id);

    Task<CustomerDto> CreateAsync(
        CreateCustomerDto dto);

    Task<bool> UpdateAsync(
        int id,
        UpdateCustomerDto dto);

    Task<bool> DeleteAsync(int id);
}
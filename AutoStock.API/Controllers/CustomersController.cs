using AutoStock.Application.DTOs.Customers;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(
        ICustomerService customerService)
    {
        _customerService = customerService;
    }


    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerDto>>>
        GetAll()
    {
        var customers =
            await _customerService
                .GetAllAsync();

        return Ok(customers);
    }


    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDto>>
        GetById(int id)
    {
        var customer =
            await _customerService
                .GetByIdAsync(id);

        if (customer is null)
        {
            return NotFound(
                new
                {
                    detail =
                        "Customer not found."
                });
        }

        return Ok(customer);
    }


    [HttpPost]
    public async Task<ActionResult<CustomerDto>>
        Create(
            CreateCustomerDto dto)
    {
        if (
            string.IsNullOrWhiteSpace(
                dto.FullName)
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "Customer full name is required."
                });
        }

        if (
            string.IsNullOrWhiteSpace(
                dto.PhoneNumber)
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "Customer phone number is required."
                });
        }

        var customer =
            await _customerService
                .CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = customer.Id
            },
            customer);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult>
        Update(
            int id,
            UpdateCustomerDto dto)
    {
        if (
            string.IsNullOrWhiteSpace(
                dto.FullName)
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "Customer full name is required."
                });
        }

        if (
            string.IsNullOrWhiteSpace(
                dto.PhoneNumber)
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "Customer phone number is required."
                });
        }

        var updated =
            await _customerService
                .UpdateAsync(
                    id,
                    dto);

        if (!updated)
        {
            return NotFound(
                new
                {
                    detail =
                        "Customer not found."
                });
        }

        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult>
        Delete(int id)
    {
        try
        {
            var deleted =
                await _customerService
                    .DeleteAsync(id);


            if (!deleted)
            {
                return NotFound(
                    new
                    {
                        detail =
                            "Customer not found."
                    });
            }


            return NoContent();
        }
        catch (
            InvalidOperationException exception)
        {
            return Conflict(
                new
                {
                    detail =
                        exception.Message
                });
        }
    }
}
using AutoStock.Application.DTOs.Sales;
using AutoStock.Application.Interface;
using AutoStock.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;


    public SalesController(
        ISaleService saleService)
    {
        _saleService = saleService;
    }


    /* =========================================
       Get All Sales
    ========================================= */

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SaleDto>>>
        GetAll()
    {
        var sales =
            await _saleService
                .GetAllAsync();

        return Ok(sales);
    }


    /* =========================================
       Get Sale By Id
    ========================================= */

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SaleDto>>
        GetById(int id)
    {
        var sale =
            await _saleService
                .GetByIdAsync(id);


        if (sale is null)
        {
            return NotFound(
                new
                {
                    detail =
                        "Sale not found."
                });
        }


        return Ok(sale);
    }


    /* =========================================
       Create Sale
    ========================================= */

    [HttpPost]
    public async Task<ActionResult<SaleDto>>
        Create(
            CreateSaleDto dto)
    {
        if (dto.CustomerId <= 0)
        {
            return BadRequest(
                new
                {
                    detail =
                        "A valid customer is required."
                });
        }


        if (
            !Enum.IsDefined(
                typeof(SalePaymentMethod),
                dto.PaymentMethod)
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "Invalid payment method."
                });
        }


        if (
            dto.Items is null ||
            dto.Items.Count == 0
        )
        {
            return BadRequest(
                new
                {
                    detail =
                        "The sale must contain at least one item."
                });
        }


        try
        {
            var sale =
                await _saleService
                    .CreateAsync(dto);


            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = sale.Id
                },
                sale);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(
                new
                {
                    detail =
                        exception.Message
                });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(
                new
                {
                    detail =
                        exception.Message
                });
        }
    }
}
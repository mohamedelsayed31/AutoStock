using AutoStock.Application.DTOs.PurchaseOrders;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PurchaseOrdersController
    : ControllerBase
{
    private readonly IPurchaseOrderService
        _purchaseOrderService;


    public PurchaseOrdersController(
        IPurchaseOrderService purchaseOrderService)
    {
        _purchaseOrderService =
            purchaseOrderService;
    }


    [HttpGet]
    public async Task<
        ActionResult<
            IReadOnlyList<PurchaseOrderDto>>>
        GetAll()
    {
        return Ok(
            await _purchaseOrderService
                .GetAllAsync());
    }


    [HttpGet("{id:int}")]
    public async Task<ActionResult<PurchaseOrderDto>>
        GetById(
            int id)
    {
        var order =
            await _purchaseOrderService
                .GetByIdAsync(
                    id);


        if (order is null)
        {
            return NotFound(
                new
                {
                    detail =
                        "Purchase order not found."
                });
        }


        return Ok(
            order);
    }


    [HttpGet("supplier/{supplierId:int}")]
    public async Task<
    ActionResult<SupplierPurchaseHistoryDto>>
    GetSupplierHistory(
        int supplierId)
    {
        var result =
            await _purchaseOrderService
                .GetSupplierHistoryAsync(
                    supplierId);


        if (result is null)
        {
            return NotFound(
                new
                {
                    detail =
                        "Supplier not found."
                });
        }


        return Ok(
            result);
    }


    [HttpPost]
    public async Task<ActionResult<PurchaseOrderDto>>
        Create(
            CreatePurchaseOrderDto dto)
    {
        try
        {
            var order =
                await _purchaseOrderService
                    .CreateAsync(
                        dto);


            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id =
                        order.Id
                },
                order);
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
        catch (KeyNotFoundException exception)
        {
            return NotFound(
                new
                {
                    detail =
                        exception.Message
                });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(
                new
                {
                    detail =
                        exception.Message
                });
        }
    }


    [HttpPatch("{id:int}/submit")]
    public async Task<IActionResult>
        Submit(
            int id)
    {
        try
        {
            var result =
                await _purchaseOrderService
                    .SubmitAsync(
                        id);


            if (!result)
            {
                return NotFound(
                    new
                    {
                        detail =
                            "Purchase order not found."
                    });
            }


            return NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(
                new
                {
                    detail =
                        exception.Message
                });
        }
    }


    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult>
        Cancel(
            int id)
    {
        try
        {
            var result =
                await _purchaseOrderService
                    .CancelAsync(
                        id);


            if (!result)
            {
                return NotFound(
                    new
                    {
                        detail =
                            "Purchase order not found."
                    });
            }


            return NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(
                new
                {
                    detail =
                        exception.Message
                });
        }
    }


    [HttpPatch("{id:int}/receive")]
    public async Task<IActionResult>
        Receive(
            int id)
    {
        try
        {
            var result =
                await _purchaseOrderService
                    .ReceiveAsync(
                        id);


            if (!result)
            {
                return NotFound(
                    new
                    {
                        detail =
                            "Purchase order not found."
                    });
            }


            return NoContent();
        }
        catch (InvalidOperationException exception)
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
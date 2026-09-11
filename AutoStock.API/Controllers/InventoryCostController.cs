using AutoStock.Application.DTOs.InventoryCost;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class InventoryCostController
    : ControllerBase
{
    private readonly IInventoryCostService
        _inventoryCostService;


    public InventoryCostController(
        IInventoryCostService inventoryCostService)
    {
        _inventoryCostService =
            inventoryCostService;
    }


    /* =========================================
       Set Legacy Inventory Cost Basis
    ========================================= */

    [HttpPut("{carId:int}/basis")]
    public async Task<ActionResult<
        InventoryCostBasisDto>>
        SetCostBasis(
            int carId,
            [FromBody]
            SetInventoryCostBasisDto dto)
    {
        try
        {
            var result =
                await _inventoryCostService
                    .SetCostBasisAsync(
                        carId,
                        dto);


            return Ok(
                result);
        }
        catch (
            KeyNotFoundException exception)
        {
            return NotFound(
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (
            ArgumentException exception)
        {
            return BadRequest(
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (
            InvalidOperationException exception)
        {
            return Conflict(
                new
                {
                    message =
                        exception.Message
                });
        }
    }
}

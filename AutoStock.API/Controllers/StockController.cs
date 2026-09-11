using AutoStock.Application.DTOs.Stock;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StockController : ControllerBase
    {
        private readonly IStockService
            _stockService;


        public StockController(
            IStockService stockService)
        {
            _stockService = stockService;
        }


        [HttpPost("{carId:int}/in")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            StockIn(
                int carId,
                StockOperationDto dto)
        {
            try
            {
                var result =
                    await _stockService
                        .StockInAsync(
                            carId,
                            dto);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid stock operation",
                        Detail =
                            ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new ProblemDetails
                    {
                        Status = 404,
                        Title =
                            "Car not found",
                        Detail =
                            ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new ProblemDetails
                    {
                        Status = 409,
                        Title =
                            "Inventory changed",
                        Detail =
                            ex.Message
                    });
            }
        }


        [HttpPost("{carId:int}/out")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            StockOut(
                int carId,
                StockOperationDto dto)
        {
            try
            {
                var result =
                    await _stockService
                        .StockOutAsync(
                            carId,
                            dto);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid stock operation",
                        Detail = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Insufficient stock",
                        Detail = ex.Message
                    });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new ProblemDetails
                    {
                        Status = 404,
                        Title =
                            "Car not found",
                        Detail = ex.Message
                    });
            }
        }


        [HttpGet("history")]
        public async Task<IActionResult>
    GetHistory(
        [FromQuery]
        int? carId,

        [FromQuery]
        string? transactionType,

        [FromQuery]
        DateTime? startDate,

        [FromQuery]
        DateTime? endDate,

        [FromQuery]
        int page = 1,

        [FromQuery]
        int pageSize = 10)
        {
            if (
                startDate.HasValue &&
                endDate.HasValue &&
                startDate.Value >
                endDate.Value)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title =
                            "Invalid date range",

                        Detail =
                            "Start date cannot be after end date.",

                        Status = 400
                    });
            }


            if (
                !string.IsNullOrWhiteSpace(
                    transactionType) &&
                transactionType != "Stock In" &&
                transactionType != "Stock Out")
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title =
                            "Invalid transaction type",

                        Detail =
                            "Transaction type must be Stock In or Stock Out.",

                        Status = 400
                    });
            }


            if (page < 1)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title =
                            "Invalid page",

                        Detail =
                            "Page must be greater than or equal to 1.",

                        Status = 400
                    });
            }


            if (
                pageSize < 1 ||
                pageSize > 100
            )
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title =
                            "Invalid page size",

                        Detail =
                            "Page size must be between 1 and 100.",

                        Status = 400
                    });
            }


            var result =
                await _stockService
                    .GetHistoryAsync(
                        carId,
                        transactionType,
                        startDate,
                        endDate,
                        page,
                        pageSize);


            return Ok(result);
        }
    }
}
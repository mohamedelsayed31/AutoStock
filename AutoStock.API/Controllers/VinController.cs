using AutoStock.Application.DTOs.Vin;
using AutoStock.Application.Interface;
using AutoStock.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VinController : ControllerBase
    {
        private readonly IVinDecoderService
            _vinDecoderService;


        public VinController(
            IVinDecoderService vinDecoderService)
        {
            _vinDecoderService =
                vinDecoderService;
        }


        [HttpGet("{vin}")]
        [ProducesResponseType(
            typeof(VinDecodeDto),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DecodeVin(
            string vin,
            CancellationToken cancellationToken)
        {
            vin =
                vin.Trim()
                    .ToUpperInvariant();


            bool validVin =
                Regex.IsMatch(
                    vin,
                    "^[A-HJ-NPR-Z0-9]{17}$");


            if (!validVin)
            {
                return Problem(
                    statusCode:
                        StatusCodes.Status400BadRequest,

                    title: "Invalid VIN",

                    detail:
                        "VIN must contain exactly 17 valid characters.");
            }


            var result =
                await _vinDecoderService.DecodeAsync(
                    vin,
                    cancellationToken);


            if (result == null)
            {
                return Problem(
                    statusCode:
                        StatusCodes.Status404NotFound,

                    title: "VIN Not Found",

                    detail:
                        "No vehicle information was returned for this VIN.");
            }


            return Ok(result);
        }
    }
}
using AutoStock.Application.DTOs.Common;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReferenceDataController
        : ControllerBase
    {
        private readonly IReferenceDataService
            _referenceDataService;


        public ReferenceDataController(
            IReferenceDataService referenceDataService)
        {
            _referenceDataService =
                referenceDataService;
        }


        [HttpGet("brands")]
        [ProducesResponseType(
            typeof(IEnumerable<LookupDto>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult>
            GetBrands()
        {
            var result =
                await _referenceDataService
                    .GetBrandsAsync();

            return Ok(result);
        }


        [HttpGet("categories")]
        [ProducesResponseType(
            typeof(IEnumerable<LookupDto>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult>
            GetCategories()
        {
            var result =
                await _referenceDataService
                    .GetCategoriesAsync();

            return Ok(result);
        }


        [HttpGet("suppliers")]
        [ProducesResponseType(
            typeof(IEnumerable<LookupDto>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult>
            GetSuppliers()
        {
            var result =
                await _referenceDataService
                    .GetSuppliersAsync();

            return Ok(result);
        }
    }
}
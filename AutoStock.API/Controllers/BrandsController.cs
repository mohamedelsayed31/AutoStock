using AutoStock.Application.DTOs.Brands;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BrandsController : ControllerBase
    {
        private readonly IBrandService
            _brandService;


        public BrandsController(
            IBrandService brandService)
        {
            _brandService = brandService;
        }


        [HttpGet]
        public async Task<IActionResult>
            GetAll()
        {
            var brands =
                await _brandService
                    .GetAllAsync();

            return Ok(brands);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult>
            GetById(int id)
        {
            var brand =
                await _brandService
                    .GetByIdAsync(id);


            if (brand is null)
            {
                return NotFound();
            }


            return Ok(brand);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Create(CreateBrandDto dto)
        {
            try
            {
                var brand =
                    await _brandService
                        .CreateAsync(dto);


                return CreatedAtAction(
                    nameof(GetById),
                    new { id = brand.Id },
                    brand);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid brand",
                        Detail = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new ProblemDetails
                    {
                        Status = 409,
                        Title =
                            "Brand conflict",
                        Detail = ex.Message
                    });
            }
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Update(
                int id,
                UpdateBrandDto dto)
        {
            try
            {
                var updated =
                    await _brandService
                        .UpdateAsync(
                            id,
                            dto);


                if (!updated)
                {
                    return NotFound();
                }


                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid brand",
                        Detail = ex.Message
                    });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new ProblemDetails
                    {
                        Status = 409,
                        Title =
                            "Brand conflict",
                        Detail = ex.Message
                    });
            }
        }


        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Delete(int id)
        {
            try
            {
                var deleted =
                    await _brandService
                        .DeleteAsync(id);


                if (!deleted)
                {
                    return NotFound();
                }


                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new ProblemDetails
                    {
                        Status = 409,
                        Title =
                            "Brand cannot be deleted",
                        Detail = ex.Message
                    });
            }
        }
    }
}
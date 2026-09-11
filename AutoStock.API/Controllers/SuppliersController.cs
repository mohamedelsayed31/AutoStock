using AutoStock.Application.DTOs.Suppliers;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SuppliersController
        : ControllerBase
    {
        private readonly ISupplierService
            _supplierService;


        public SuppliersController(
            ISupplierService supplierService)
        {
            _supplierService =
                supplierService;
        }


        [HttpGet]
        public async Task<IActionResult>
            GetAll()
        {
            var suppliers =
                await _supplierService
                    .GetAllAsync();

            return Ok(suppliers);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult>
            GetById(int id)
        {
            var supplier =
                await _supplierService
                    .GetByIdAsync(id);


            if (supplier is null)
            {
                return NotFound();
            }


            return Ok(supplier);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Create(
                CreateSupplierDto dto)
        {
            try
            {
                var supplier =
                    await _supplierService
                        .CreateAsync(dto);


                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = supplier.Id
                    },
                    supplier);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid supplier",
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
                            "Supplier conflict",
                        Detail = ex.Message
                    });
            }
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Update(
                int id,
                UpdateSupplierDto dto)
        {
            try
            {
                var updated =
                    await _supplierService
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
                            "Invalid supplier",
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
                            "Supplier conflict",
                        Detail = ex.Message
                    });
            }
        }


        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
        Delete(
        int id)
        {
            try
            {
                var deleted =
                    await _supplierService
                        .DeleteAsync(
                            id);


                if (!deleted)
                {
                    return NotFound(
                        new
                        {
                            detail =
                                "Supplier not found."
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
}
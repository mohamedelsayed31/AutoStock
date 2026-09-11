using AutoStock.Application.DTOs.Categories;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController
        : ControllerBase
    {
        private readonly ICategoryService
            _categoryService;


        public CategoriesController(
            ICategoryService categoryService)
        {
            _categoryService =
                categoryService;
        }


        [HttpGet]
        public async Task<IActionResult>
            GetAll()
        {
            var categories =
                await _categoryService
                    .GetAllAsync();

            return Ok(categories);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult>
            GetById(int id)
        {
            var category =
                await _categoryService
                    .GetByIdAsync(id);


            if (category is null)
            {
                return NotFound();
            }


            return Ok(category);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Create(CreateCategoryDto dto)
        {
            try
            {
                var category =
                    await _categoryService
                        .CreateAsync(dto);


                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = category.Id
                    },
                    category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Status = 400,
                        Title =
                            "Invalid category",
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
                            "Category conflict",
                        Detail = ex.Message
                    });
            }
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
            Update(
                int id,
                UpdateCategoryDto dto)
        {
            try
            {
                var updated =
                    await _categoryService
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
                            "Invalid category",
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
                            "Category conflict",
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
                    await _categoryService
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
                            "Category cannot be deleted",
                        Detail = ex.Message
                    });
            }
        }
    }
}
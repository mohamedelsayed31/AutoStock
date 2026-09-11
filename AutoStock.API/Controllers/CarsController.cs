using AutoStock.Application.Common;
using AutoStock.Application.DTOs.Cars;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoStock.API.Services;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CarsController : ControllerBase
    {
        private readonly ICarService
        _carService;

        private readonly ICarImageStorage
            _imageStorage;


        public CarsController(
        ICarService carService,
            ICarImageStorage imageStorage)
        {
            _carService =
                carService;

            _imageStorage =
                imageStorage;
        }


        [HttpGet]
        [ProducesResponseType(
            typeof(PagedResult<CarDto>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCars(
            [FromQuery] CarQueryParameters parameters)
        {
            var result =
                await _carService.GetAllAsync(parameters);

            return Ok(result);
        }


        [HttpGet("{id:int}")]
        [ProducesResponseType(
            typeof(CarDto),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CarDto>> GetCar(int id)
        {
            var car =
                await _carService.GetByIdAsync(id);


            if (car == null)
            {
                return Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Car Not Found",
                    detail: $"Car with id {id} was not found.");
            }


            return Ok(car);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(
            typeof(CarDto),
            StatusCodes.Status201Created)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CarDto>> CreateCar(
            CreateCarDto dto)
        {
            if (!await _carService
                .BrandExistsAsync(dto.BrandId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Brand",
                    detail: "The selected brand does not exist.");
            }


            if (!await _carService
                .CategoryExistsAsync(dto.CategoryId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Category",
                    detail: "The selected category does not exist.");
            }


            if (!await _carService
                .SupplierExistsAsync(dto.SupplierId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Supplier",
                    detail: "The selected supplier does not exist.");
            }


            var createdCar =
                await _carService.CreateAsync(dto);


            return CreatedAtAction(
                nameof(GetCar),
                new { id = createdCar.Id },
                createdCar);
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(
            StatusCodes.Status204NoContent)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCar(
            int id,
            UpdateCarDto dto)
        {
            if (!await _carService
                .BrandExistsAsync(dto.BrandId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Brand",
                    detail: "The selected brand does not exist.");
            }


            if (!await _carService
                .CategoryExistsAsync(dto.CategoryId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Category",
                    detail: "The selected category does not exist.");
            }


            if (!await _carService
                .SupplierExistsAsync(dto.SupplierId))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid Supplier",
                    detail: "The selected supplier does not exist.");
            }


            bool updated =
                await _carService.UpdateAsync(id, dto);


            if (!updated)
            {
                return Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Car Not Found",
                    detail: $"Car with id {id} was not found.");
            }


            return NoContent();
        }


        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(
            StatusCodes.Status204NoContent)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status404NotFound)]
        [ProducesResponseType(
            typeof(ProblemDetails),
            StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCar(int id)
        {
            bool deleted =
                await _carService.DeleteAsync(id);


            if (!deleted)
            {
                return Problem(
                    statusCode: StatusCodes.Status404NotFound,
                    title: "Car Not Found",
                    detail: $"Car with id {id} was not found.");
            }


            return NoContent();
        }


        [HttpPost("{id:int}/image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
    UploadImage(
        int id,
        IFormFile file)
        {
            string? newImagePath =
                null;


            try
            {
                newImagePath =
                    await _imageStorage
                        .SaveAsync(
                            file);


                var oldImagePath =
                    await _carService
                        .UpdateImageAsync(
                            id,
                            newImagePath);


                _imageStorage.Delete(
                    oldImagePath);


                return Ok(
                    new
                    {
                        imagePath =
                            newImagePath
                    });
            }
            catch
            {
                if (
                    !string.IsNullOrWhiteSpace(
                        newImagePath))
                {
                    _imageStorage.Delete(
                        newImagePath);
                }


                throw;
            }
        }


        [HttpDelete("{id:int}/image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
    DeleteImage(
        int id)
        {
            var oldImagePath =
                await _carService
                    .RemoveImageAsync(
                        id);


            _imageStorage.Delete(
                oldImagePath);


            return NoContent();
        }


        [HttpGet("archived")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
    GetArchivedCars()
        {
            var cars =
                await _carService
                    .GetArchivedCarsAsync();


            return Ok(
                cars
            );
        }


        [HttpPatch("{id:int}/restore")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult>
    RestoreCar(
        int id)
        {
            await _carService
                .RestoreCarAsync(
                    id
                );


            return NoContent();
        }
    }
}
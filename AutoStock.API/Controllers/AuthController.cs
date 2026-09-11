using AutoStock.Application.DTOs.Auth;
using AutoStock.Application.Interface;
using AutoStock.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITokenService _tokenService;


        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existingUser =
                await _userManager.FindByEmailAsync(dto.Email);


            if (existingUser != null)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Email Already Exists",
                    detail: "A user with this email already exists.");
            }


            const string defaultRole = "User";


            if (!await _roleManager.RoleExistsAsync(defaultRole))
            {
                var roleResult =
                    await _roleManager.CreateAsync(
                        new IdentityRole(defaultRole));


                if (!roleResult.Succeeded)
                {
                    return Problem(
                        statusCode: StatusCodes.Status500InternalServerError,
                        title: "Role Creation Failed",
                        detail: "The default user role could not be created.");
                }
            }


            var user = new ApplicationUser
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                UserName = dto.Email.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };


            var result =
                await _userManager.CreateAsync(
                    user,
                    dto.Password);


            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    errors = result.Errors
                        .Select(e => e.Description)
                });
            }


            var addRoleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    defaultRole);


            if (!addRoleResult.Succeeded)
            {
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Role Assignment Failed",
                    detail: "The user was created, but the role could not be assigned.");
            }


            return Ok(new
            {
                message = "User registered successfully."
            });
        }


        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user =
                await _userManager.FindByEmailAsync(dto.Email);


            if (user == null || !user.IsActive)
            {
                return Problem(
                    statusCode: StatusCodes.Status401Unauthorized,
                    title: "Invalid Credentials",
                    detail: "Invalid email or password.");
            }


            bool validPassword =
                await _userManager.CheckPasswordAsync(
                    user,
                    dto.Password);


            if (!validPassword)
            {
                return Problem(
                    statusCode: StatusCodes.Status401Unauthorized,
                    title: "Invalid Credentials",
                    detail: "Invalid email or password.");
            }


            var roles =
                await _userManager.GetRolesAsync(user);


            string role =
                roles.FirstOrDefault() ?? "User";


            string token =
                _tokenService.CreateToken(
                    user.Id,
                    user.FullName,
                    user.Email ?? string.Empty,
                    roles);


            var response = new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Role = role,
                Token = token
            };


            return Ok(response);
        }


        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Me()
        {
            var response = new
            {
                UserId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier),

                FullName =
                    User.FindFirstValue(
                        ClaimTypes.Name),

                Email =
                    User.FindFirstValue(
                        ClaimTypes.Email),

                Roles =
                    User.FindAll(
                        ClaimTypes.Role)
                        .Select(c => c.Value)
                        .ToList()
            };


            return Ok(response);
        }
    }
}
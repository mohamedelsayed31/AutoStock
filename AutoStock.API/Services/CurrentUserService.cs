using AutoStock.Application.Interface;
using System.Security.Claims;

namespace AutoStock.API.Services;

public class CurrentUserService
    : ICurrentUserService
{
    private readonly IHttpContextAccessor
        _httpContextAccessor;


    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor =
            httpContextAccessor;
    }


    private ClaimsPrincipal? User =>
        _httpContextAccessor
            .HttpContext?
            .User;


    public bool IsAuthenticated =>
        User?
            .Identity?
            .IsAuthenticated
        ?? false;


    public string? UserId =>
        User?
            .FindFirst(
                ClaimTypes.NameIdentifier)
            ?.Value
        ??
        User?
            .FindFirst("sub")
            ?.Value;


    public string? UserEmail =>
        User?
            .FindFirst(
                ClaimTypes.Email)
            ?.Value
        ??
        User?
            .FindFirst("email")
            ?.Value;
}
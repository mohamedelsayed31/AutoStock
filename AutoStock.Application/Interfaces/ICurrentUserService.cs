namespace AutoStock.Application.Interface;

public interface ICurrentUserService
{
    string? UserId { get; }

    string? UserEmail { get; }

    bool IsAuthenticated { get; }
}
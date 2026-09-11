using AutoStock.Application.Interface;

namespace AutoStock.Tests.Fakes;

public class FakeCurrentUserService
    : ICurrentUserService
{
    public string? UserId { get; set; }
        = "test-admin-id";

    public string? UserEmail { get; set; }
        = "admin@test.com";

    public bool IsAuthenticated { get; set; }
        = true;
}
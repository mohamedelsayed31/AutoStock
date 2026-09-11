namespace AutoStock.API.Services;

public interface ICarImageStorage
{
    Task<string> SaveAsync(
        IFormFile file);

    void Delete(
        string? imagePath);
}
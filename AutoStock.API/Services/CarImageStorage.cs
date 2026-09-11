namespace AutoStock.API.Services;

public class CarImageStorage
    : ICarImageStorage
{
    private const long MaxFileSize =
        5 * 1024 * 1024;


    private static readonly
        HashSet<string>
        AllowedContentTypes =
        new(
            StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };


    private static readonly
        HashSet<string>
        AllowedExtensions =
        new(
            StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };


    private readonly
        IWebHostEnvironment
        _environment;


    public CarImageStorage(
        IWebHostEnvironment environment)
    {
        _environment =
            environment;
    }


    public async Task<string>
        SaveAsync(
            IFormFile file)
    {
        if (
            file is null ||
            file.Length == 0)
        {
            throw new ArgumentException(
                "Image file is required.");
        }


        if (
            file.Length >
            MaxFileSize)
        {
            throw new ArgumentException(
                "Image size cannot exceed 5 MB.");
        }


        var extension =
            Path.GetExtension(
                file.FileName);


        if (
            string.IsNullOrWhiteSpace(
                extension) ||
            !AllowedExtensions.Contains(
                extension))
        {
            throw new ArgumentException(
                "Only JPG, JPEG, PNG and WEBP images are allowed.");
        }


        if (
            !AllowedContentTypes.Contains(
                file.ContentType))
        {
            throw new ArgumentException(
                "Invalid image file type.");
        }


        var webRootPath =
            _environment.WebRootPath;


        if (
            string.IsNullOrWhiteSpace(
                webRootPath))
        {
            webRootPath =
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot");

            Directory.CreateDirectory(
                webRootPath);
        }


        var uploadDirectory =
            Path.Combine(
                webRootPath,
                "uploads",
                "cars");


        Directory.CreateDirectory(
            uploadDirectory);


        var fileName =
            $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";


        var fullPath =
            Path.Combine(
                uploadDirectory,
                fileName);


        await using var stream =
            new FileStream(
                fullPath,
                FileMode.CreateNew);


        await file.CopyToAsync(
            stream);


        return
            $"/uploads/cars/{fileName}";
    }


    public void Delete(
        string? imagePath)
    {
        if (
            string.IsNullOrWhiteSpace(
                imagePath))
        {
            return;
        }


        var normalizedPath =
            imagePath.Replace(
                '\\',
                '/');


        if (
            !normalizedPath.StartsWith(
                "/uploads/cars/",
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }


        var fileName =
            Path.GetFileName(
                normalizedPath);


        if (
            string.IsNullOrWhiteSpace(
                fileName))
        {
            return;
        }


        var webRootPath =
            _environment.WebRootPath;


        if (
            string.IsNullOrWhiteSpace(
                webRootPath))
        {
            return;
        }


        var fullPath =
            Path.Combine(
                webRootPath,
                "uploads",
                "cars",
                fileName);


        if (
            File.Exists(
                fullPath))
        {
            File.Delete(
                fullPath);
        }
    }
}
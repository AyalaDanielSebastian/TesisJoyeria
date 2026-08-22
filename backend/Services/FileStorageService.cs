using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace backend.Services;

public class FileStorageService(IConfiguration config, IWebHostEnvironment env)
{
    private readonly string _basePath = Path.Combine(
        env.ContentRootPath,
        config["Uploads:ComprobantesPath"]?.Replace("comprobantes", "") ?? "uploads"
    );

    private bool UsaBlob => !string.IsNullOrWhiteSpace(config["AzureStorage:ConnectionString"]);

    public async Task<string> GuardarImagenProductoAsync(IFormFile file)
    {
        ValidarImagen(file);
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var nombre = $"{Guid.NewGuid():N}{ext}";

        if (UsaBlob)
        {
            var container = config["AzureStorage:ProductosContainer"] ?? "productos";
            return await SubirBlobAsync(container, nombre, file);
        }

        var dir = Path.Combine(_basePath, "productos");
        Directory.CreateDirectory(dir);
        var ruta = Path.Combine(dir, nombre);
        await using var stream = new FileStream(ruta, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/productos/{nombre}";
    }

    public async Task<(string Ruta, string NombreOriginal, string Mime, long Tamano)> GuardarComprobanteAsync(
        IFormFile file, int ordenId)
    {
        ValidarComprobante(file);
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var nombre = $"orden-{ordenId}-{Guid.NewGuid():N}{ext}";

        if (UsaBlob)
        {
            var container = config["AzureStorage:ComprobantesContainer"] ?? "comprobantes";
            var url = await SubirBlobAsync(container, nombre, file);
            return (url, file.FileName, file.ContentType, file.Length);
        }

        var dir = Path.Combine(_basePath, "comprobantes");
        Directory.CreateDirectory(dir);
        var ruta = Path.Combine(dir, nombre);
        await using var stream = new FileStream(ruta, FileMode.Create);
        await file.CopyToAsync(stream);
        return ($"/uploads/comprobantes/{nombre}", file.FileName, file.ContentType, file.Length);
    }

    private async Task<string> SubirBlobAsync(string containerName, string blobName, IFormFile file)
    {
        var client = new BlobServiceClient(config["AzureStorage:ConnectionString"]);
        var container = client.GetBlobContainerClient(containerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blob = container.GetBlobClient(blobName);
        var headers = new BlobHttpHeaders
        {
            ContentType = string.IsNullOrWhiteSpace(file.ContentType)
                ? "application/octet-stream"
                : file.ContentType
        };

        await using var stream = file.OpenReadStream();
        await blob.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });
        return blob.Uri.ToString();
    }

    private void ValidarImagen(IFormFile file)
    {
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            throw new InvalidOperationException("Formato de imagen no permitido. Use JPG, PNG o WEBP.");

        if (file.Length > 5 * 1024 * 1024)
            throw new InvalidOperationException("La imagen no puede superar 5 MB.");
    }

    private void ValidarComprobante(IFormFile file)
    {
        var allowed = config.GetSection("Uploads:AllowedExtensions").Get<string[]>() ?? [".jpg", ".jpeg", ".png", ".pdf"];
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            throw new InvalidOperationException("Formato no permitido. Use JPG, PNG o PDF.");

        var max = config.GetValue<long>("Uploads:MaxSizeBytes", 10 * 1024 * 1024);
        if (file.Length > max)
            throw new InvalidOperationException("El archivo excede el tamaño máximo permitido.");
    }
}

namespace backend.Services;

public class FileStorageService(IConfiguration config, IWebHostEnvironment env)
{
    private readonly string _basePath = Path.Combine(
        env.ContentRootPath,
        config["Uploads:ComprobantesPath"]?.Replace("comprobantes", "") ?? "uploads"
    );

    public async Task<string> GuardarImagenProductoAsync(IFormFile file)
    {
        ValidarImagen(file);
        var dir = Path.Combine(_basePath, "productos");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var nombre = $"{Guid.NewGuid():N}{ext}";
        var ruta = Path.Combine(dir, nombre);

        await using var stream = new FileStream(ruta, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/productos/{nombre}";
    }

    public async Task<(string Ruta, string NombreOriginal, string Mime, long Tamano)> GuardarComprobanteAsync(
        IFormFile file, int ordenId)
    {
        ValidarComprobante(file);
        var dir = Path.Combine(_basePath, "comprobantes");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var nombre = $"orden-{ordenId}-{Guid.NewGuid():N}{ext}";
        var ruta = Path.Combine(dir, nombre);

        await using var stream = new FileStream(ruta, FileMode.Create);
        await file.CopyToAsync(stream);

        return ($"/uploads/comprobantes/{nombre}", file.FileName, file.ContentType, file.Length);
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

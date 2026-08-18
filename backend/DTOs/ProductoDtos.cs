using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record CategoriaDto(int Id, string Nombre, string Descripcion);

public record OpcionMetalDto(string Nombre, decimal ModificadorPrecio = 0);

public record ProductoDto(
    int Id,
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Stock,
    string ImagenUrl,
    bool PermitePersonalizacion,
    bool Activo,
    int CategoriaId,
    string CategoriaNombre,
    string MaterialDefault,
    decimal RecargoGrabado,
    string TallasDisponibles,
    IReadOnlyList<string> MetalesDisponibles,
    bool RequiereTalla
);

public record ProductoDetalleDto(
    int Id,
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Stock,
    string ImagenUrl,
    bool PermitePersonalizacion,
    bool Activo,
    int CategoriaId,
    string CategoriaNombre,
    string MaterialDefault,
    decimal RecargoGrabado,
    IReadOnlyList<OpcionMetalDto> MetalesDisponibles,
    IReadOnlyList<string> TallasDisponibles
);

public record CalcularPrecioRequest(
    [StringLength(50)] string Metal = "",
    [StringLength(20)] string Talla = "",
    [StringLength(200)] string Grabado = "",
    [Range(1, int.MaxValue)] int Cantidad = 1
);

public record CalcularPrecioResponse(
    decimal PrecioUnitario,
    decimal PrecioTotal,
    int Cantidad,
    string Resumen
);

public record CreateProductoRequest(
    [Required][StringLength(100)] string Nombre,
    [StringLength(500)] string Descripcion,
    [Range(0.01, double.MaxValue)] decimal Precio,
    [Range(0, int.MaxValue)] int Stock,
    [Required] int CategoriaId,
    bool PermitePersonalizacion = true,
    string ImagenUrl = "",
    [StringLength(50)] string MaterialDefault = "Plata italiana",
    [StringLength(200)] string TallasDisponibles = "",
    [Range(0, double.MaxValue)] decimal RecargoGrabado = 1.50m,
    IReadOnlyList<string>? MetalesDisponibles = null
);

public record UpdateProductoRequest(
    [Required][StringLength(100)] string Nombre,
    [StringLength(500)] string Descripcion,
    [Range(0.01, double.MaxValue)] decimal Precio,
    [Range(0, int.MaxValue)] int Stock,
    [Required] int CategoriaId,
    bool PermitePersonalizacion,
    bool Activo,
    string ImagenUrl = "",
    [StringLength(50)] string MaterialDefault = "Plata italiana",
    [StringLength(200)] string TallasDisponibles = "",
    [Range(0, double.MaxValue)] decimal RecargoGrabado = 1.50m,
    IReadOnlyList<string>? MetalesDisponibles = null
);

using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record CarritoItemDto(
    int Id,
    int ProductoId,
    string ProductoNombre,
    string ImagenUrl,
    decimal PrecioBase,
    decimal PrecioUnitario,
    int StockDisponible,
    int Cantidad,
    string Metal,
    string Talla,
    string Grabado,
    string NotasPersonalizacion,
    bool PermitePersonalizacion,
    decimal Subtotal
);

public record CarritoDto(
    IReadOnlyList<CarritoItemDto> Items,
    decimal Subtotal,
    decimal Impuesto,
    decimal Total
);

public record AddCarritoRequest(
    [Required] int ProductoId,
    [Range(1, int.MaxValue)] int Cantidad = 1,
    [StringLength(50)] string Metal = "",
    [StringLength(20)] string Talla = "",
    [StringLength(200)] string Grabado = ""
);

public record UpdateCarritoRequest(
    [Range(1, int.MaxValue)] int Cantidad,
    [StringLength(50)] string Metal = "",
    [StringLength(20)] string Talla = "",
    [StringLength(200)] string Grabado = ""
);

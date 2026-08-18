using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record OrdenDetalleDto(
    int ProductoId,
    string ProductoNombre,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal,
    string NotasPersonalizacion
);

public record OrdenDto(
    int Id,
    string Estado,
    decimal Subtotal,
    decimal Impuesto,
    decimal Total,
    decimal MontoPagado,
    decimal SaldoPendiente,
    DateTime FechaCreacion,
    IReadOnlyList<OrdenDetalleDto> Detalles,
    string? ComprobanteUrl
);

public record OrdenResumenDto(
    int Id,
    string Estado,
    decimal Total,
    decimal MontoPagado,
    decimal SaldoPendiente,
    DateTime FechaCreacion,
    int CantidadItems
);

public record OrdenEmpleadoResumenDto(
    int Id,
    string Estado,
    decimal Total,
    decimal MontoPagado,
    decimal SaldoPendiente,
    DateTime FechaCreacion,
    int CantidadItems,
    string ClienteNombre,
    string ClienteEmail,
    bool TieneComprobante,
    string? ComprobanteUrl,
    string? ComprobanteMime
);

public record OrdenEmpleadoDetalleDto(
    int Id,
    string Estado,
    decimal Subtotal,
    decimal Impuesto,
    decimal Total,
    decimal MontoPagado,
    decimal SaldoPendiente,
    DateTime FechaCreacion,
    DateTime? FechaVerificacion,
    string ClienteNombre,
    string ClienteEmail,
    string? EmpleadoVerificadorNombre,
    string? NotasVerificacion,
    IReadOnlyList<OrdenDetalleDto> Detalles,
    string? ComprobanteUrl,
    string? ComprobanteMime,
    string? ComprobanteNombreOriginal
);

public record ActualizarEstadoOrdenRequest(
    [Required] string Estado,
    [StringLength(500)] string? NotasVerificacion = null,
    [Range(0, double.MaxValue)] decimal? MontoPagado = null
);

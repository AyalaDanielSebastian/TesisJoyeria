using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record DatosEnvioDto(
    string Nombre,
    string Telefono,
    string Direccion,
    string Ciudad,
    string? Referencia
);

public record CrearOrdenRequest(
    IReadOnlyList<int>? ItemIds = null,
    [Required, StringLength(100, MinimumLength = 3)] string NombreDestinatario = "",
    [Required, StringLength(20, MinimumLength = 7)] string Telefono = "",
    [Required, StringLength(250, MinimumLength = 5)] string Direccion = "",
    [Required, StringLength(80, MinimumLength = 2)] string Ciudad = "",
    [StringLength(200)] string? Referencia = null
);

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
    string? ComprobanteUrl,
    DatosEnvioDto? Envio
);

public record OrdenResumenDto(
    int Id,
    string Estado,
    decimal Total,
    decimal MontoPagado,
    decimal SaldoPendiente,
    DateTime FechaCreacion,
    int CantidadItems,
    DatosEnvioDto? Envio,
    bool TieneComprobante,
    string? ComprobanteUrl,
    string? ComprobanteMime
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
    string? ComprobanteNombreOriginal,
    DatosEnvioDto? Envio
);

public record ActualizarEstadoOrdenRequest(
    [Required] string Estado,
    [StringLength(500)] string? NotasVerificacion = null,
    [Range(0, double.MaxValue)] decimal? MontoPagado = null
);

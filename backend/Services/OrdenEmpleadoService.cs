using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrdenEmpleadoService(AppDbContext db)
{
    public async Task<List<OrdenEmpleadoResumenDto>> ListarEntrantesAsync()
    {
        var ordenes = await db.Ordenes
            .Include(o => o.Cliente)
            .Include(o => o.Comprobante)
            .Include(o => o.Detalles)
            .OrderByDescending(o => o.FechaCreacion)
            .ToListAsync();

        return ordenes.Select(o => new OrdenEmpleadoResumenDto(
            o.Id,
            o.Estado,
            o.Total,
            o.MontoPagado,
            Math.Max(0, o.Total - o.MontoPagado),
            o.FechaCreacion,
            o.Detalles.Count,
            o.Cliente.Nombre,
            o.Cliente.Email,
            o.Comprobante != null,
            o.Comprobante?.RutaArchivo,
            o.Comprobante?.TipoMime
        )).ToList();
    }

    public async Task<OrdenEmpleadoDetalleDto?> ObtenerAsync(int ordenId)
    {
        var orden = await db.Ordenes
            .Include(o => o.Cliente)
            .Include(o => o.Comprobante)
            .Include(o => o.EmpleadoVerificador)
            .Include(o => o.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(o => o.Id == ordenId);

        return orden is null ? null : MapDetalle(orden);
    }

    public async Task<(OrdenEmpleadoDetalleDto? Orden, string? Error)> ActualizarEstadoAsync(
        int ordenId, int empleadoId, ActualizarEstadoOrdenRequest req)
    {
        if (!EstadosOrden.TransicionesEmpleado.Contains(req.Estado))
            return (null, "Estado no permitido. Use AnticipoValidado o Rechazada.");

        var orden = await db.Ordenes
            .Include(o => o.Cliente)
            .Include(o => o.Comprobante)
            .Include(o => o.EmpleadoVerificador)
            .Include(o => o.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(o => o.Id == ordenId);

        if (orden is null)
            return (null, "Orden no encontrada.");

        if (EstadosOrden.EstadosFinalesVerificacion.Contains(orden.Estado))
            return (null, "Esta orden ya fue verificada. No se puede cambiar el estado nuevamente.");

        if (orden.Estado != EstadosOrden.PendienteVerificacion)
            return (null, "Solo se pueden verificar órdenes en estado PendienteVerificacion.");

        if (req.Estado == EstadosOrden.AnticipoValidado && orden.Comprobante is null)
            return (null, "No se puede validar el anticipo sin comprobante de pago.");

        if (req.Estado == EstadosOrden.AnticipoValidado)
        {
            var monto = req.MontoPagado ?? OrdenService.CalcularAnticipoSugerido(orden.Total);
            if (monto <= 0)
                return (null, "El monto pagado debe ser mayor a cero.");
            if (monto > orden.Total)
                return (null, "El monto pagado no puede superar el total de la orden.");
            orden.MontoPagado = monto;
        }

        orden.Estado = req.Estado;
        orden.EmpleadoVerificadorId = empleadoId;
        orden.FechaVerificacion = DateTime.UtcNow;
        orden.NotasVerificacion = req.NotasVerificacion?.Trim();

        await db.SaveChangesAsync();
        return (MapDetalle(orden), null);
    }

    private static OrdenEmpleadoDetalleDto MapDetalle(Orden o) => new(
        o.Id,
        o.Estado,
        o.Subtotal,
        o.Impuesto,
        o.Total,
        o.MontoPagado,
        Math.Max(0, o.Total - o.MontoPagado),
        o.FechaCreacion,
        o.FechaVerificacion,
        o.Cliente.Nombre,
        o.Cliente.Email,
        o.EmpleadoVerificador?.Nombre,
        o.NotasVerificacion,
        o.Detalles.Select(d => new OrdenDetalleDto(
            d.ProductoId,
            d.Producto.Nombre,
            d.Cantidad,
            d.PrecioUnitario,
            d.Subtotal,
            d.NotasPersonalizacion
        )).ToList(),
        o.Comprobante?.RutaArchivo,
        o.Comprobante?.TipoMime,
        o.Comprobante?.NombreOriginal,
        string.IsNullOrWhiteSpace(o.NombreDestinatario) && string.IsNullOrWhiteSpace(o.DireccionEnvio)
            ? null
            : new DatosEnvioDto(
                o.NombreDestinatario,
                o.TelefonoEnvio,
                o.DireccionEnvio,
                o.CiudadEnvio,
                o.ReferenciaEnvio)
    );
}

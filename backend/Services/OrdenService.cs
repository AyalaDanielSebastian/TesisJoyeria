using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrdenService(AppDbContext db)
{
    /// <summary>Porcentaje de anticipo por defecto sobre el total (50%).</summary>
    public const decimal PorcentajeAnticipoDefault = 0.50m;

    public async Task<(OrdenDto? Orden, string? Error)> CrearDesdeCarritoAsync(int clienteId)
    {
        var items = await db.CarritoItems
            .Include(c => c.Producto)
            .Where(c => c.UsuarioId == clienteId)
            .ToListAsync();

        if (items.Count == 0)
            return (null, "El carrito está vacío.");

        foreach (var item in items)
        {
            if (!item.Producto.Activo)
                return (null, $"El producto '{item.Producto.Nombre}' ya no está disponible.");

            if (item.Cantidad > item.Producto.Stock)
                return (null, $"Stock insuficiente para '{item.Producto.Nombre}'. Disponible: {item.Producto.Stock}.");
        }

        var subtotal = items.Sum(i => (i.PrecioUnitario > 0 ? i.PrecioUnitario : i.Producto.Precio) * i.Cantidad);
        var impuesto = DbSeeder.CalcularImpuesto(subtotal);
        var total = subtotal + impuesto;

        var orden = new Orden
        {
            ClienteId = clienteId,
            Estado = EstadosOrden.PendientePago,
            Subtotal = subtotal,
            Impuesto = impuesto,
            Total = total,
            MontoPagado = 0,
            Detalles = items.Select(i =>
            {
                var precio = i.PrecioUnitario > 0 ? i.PrecioUnitario : i.Producto.Precio;
                return new OrdenDetalle
                {
                    ProductoId = i.ProductoId,
                    Cantidad = i.Cantidad,
                    PrecioUnitario = precio,
                    Subtotal = precio * i.Cantidad,
                    Metal = i.Metal,
                    Talla = i.Talla,
                    Grabado = i.Grabado,
                    NotasPersonalizacion = i.NotasPersonalizacion
                };
            }).ToList()
        };

        db.Ordenes.Add(orden);
        db.CarritoItems.RemoveRange(items);
        await db.SaveChangesAsync();

        return (await ObtenerAsync(orden.Id, clienteId), null);
    }

    public async Task<List<OrdenResumenDto>> ListarMisOrdenesAsync(int clienteId)
    {
        var ordenes = await db.Ordenes
            .Where(o => o.ClienteId == clienteId)
            .OrderByDescending(o => o.FechaCreacion)
            .Select(o => new { o.Id, o.Estado, o.Total, o.MontoPagado, o.FechaCreacion, Cantidad = o.Detalles.Count })
            .ToListAsync();

        return ordenes.Select(o => new OrdenResumenDto(
            o.Id,
            o.Estado,
            o.Total,
            o.MontoPagado,
            Math.Max(0, o.Total - o.MontoPagado),
            o.FechaCreacion,
            o.Cantidad
        )).ToList();
    }

    public async Task<OrdenDto?> ObtenerAsync(int ordenId, int clienteId)
    {
        var orden = await db.Ordenes
            .Include(o => o.Detalles).ThenInclude(d => d.Producto)
            .Include(o => o.Comprobante)
            .FirstOrDefaultAsync(o => o.Id == ordenId && o.ClienteId == clienteId);

        return orden is null ? null : MapToDto(orden);
    }

    public async Task<(OrdenDto? Orden, string? Error)> SubirComprobanteAsync(
        int ordenId, int clienteId, string ruta, string nombreOriginal, string mime, long tamano)
    {
        var orden = await db.Ordenes
            .Include(o => o.Comprobante)
            .FirstOrDefaultAsync(o => o.Id == ordenId && o.ClienteId == clienteId);

        if (orden is null)
            return (null, "Orden no encontrada.");

        if (orden.Estado is not (EstadosOrden.PendientePago or EstadosOrden.PendienteVerificacion))
            return (null, "Esta orden no acepta comprobantes de pago.");

        if (orden.Comprobante is not null)
        {
            orden.Comprobante.RutaArchivo = ruta;
            orden.Comprobante.NombreOriginal = nombreOriginal;
            orden.Comprobante.TipoMime = mime;
            orden.Comprobante.TamanoBytes = tamano;
            orden.Comprobante.FechaSubida = DateTime.UtcNow;
        }
        else
        {
            db.ComprobantesPago.Add(new ComprobantePago
            {
                OrdenId = ordenId,
                RutaArchivo = ruta,
                NombreOriginal = nombreOriginal,
                TipoMime = mime,
                TamanoBytes = tamano
            });
        }

        orden.Estado = EstadosOrden.PendienteVerificacion;
        await db.SaveChangesAsync();

        return (await ObtenerAsync(ordenId, clienteId), null);
    }

    public static decimal CalcularAnticipoSugerido(decimal total) =>
        Math.Round(total * PorcentajeAnticipoDefault, 2);

    private static OrdenDto MapToDto(Orden o) => new(
        o.Id,
        o.Estado,
        o.Subtotal,
        o.Impuesto,
        o.Total,
        o.MontoPagado,
        Math.Max(0, o.Total - o.MontoPagado),
        o.FechaCreacion,
        o.Detalles.Select(d => new OrdenDetalleDto(
            d.ProductoId,
            d.Producto.Nombre,
            d.Cantidad,
            d.PrecioUnitario,
            d.Subtotal,
            d.NotasPersonalizacion
        )).ToList(),
        o.Comprobante?.RutaArchivo
    );
}

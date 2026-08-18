using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrdenService(AppDbContext db)
{
    /// <summary>Porcentaje de anticipo por defecto sobre el total (50%).</summary>
    public const decimal PorcentajeAnticipoDefault = 0.50m;

    public async Task<(OrdenDto? Orden, string? Error)> CrearDesdeCarritoAsync(
        int clienteId, CrearOrdenRequest request)
    {
        var errorEnvio = ValidarEnvio(request);
        if (errorEnvio is not null)
            return (null, errorEnvio);

        var itemIds = request.ItemIds;
        var query = db.CarritoItems
            .Include(c => c.Producto)
            .Where(c => c.UsuarioId == clienteId);

        List<CarritoItem> items;
        if (itemIds is not null)
        {
            var ids = itemIds.Distinct().ToList();
            if (ids.Count == 0)
                return (null, "Selecciona al menos un producto para confirmar la orden.");

            items = await query.Where(c => ids.Contains(c.Id)).ToListAsync();
            if (items.Count != ids.Count)
                return (null, "Algunos productos seleccionados ya no están en el carrito.");
        }
        else
        {
            items = await query.ToListAsync();
        }

        if (items.Count == 0)
            return (null, "Selecciona al menos un producto para confirmar la orden.");

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
            NombreDestinatario = request.NombreDestinatario.Trim(),
            TelefonoEnvio = request.Telefono.Trim(),
            DireccionEnvio = request.Direccion.Trim(),
            CiudadEnvio = request.Ciudad.Trim(),
            ReferenciaEnvio = string.IsNullOrWhiteSpace(request.Referencia) ? null : request.Referencia.Trim(),
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
            .Select(o => new {
                o.Id, o.Estado, o.Total, o.MontoPagado, o.FechaCreacion,
                Cantidad = o.Detalles.Count,
                o.NombreDestinatario, o.TelefonoEnvio, o.DireccionEnvio, o.CiudadEnvio, o.ReferenciaEnvio,
                TieneComprobante = o.Comprobante != null,
                ComprobanteUrl = o.Comprobante != null ? o.Comprobante.RutaArchivo : null,
                ComprobanteMime = o.Comprobante != null ? o.Comprobante.TipoMime : null
            })
            .ToListAsync();

        return ordenes.Select(o => new OrdenResumenDto(
            o.Id,
            o.Estado,
            o.Total,
            o.MontoPagado,
            Math.Max(0, o.Total - o.MontoPagado),
            o.FechaCreacion,
            o.Cantidad,
            MapEnvio(o.NombreDestinatario, o.TelefonoEnvio, o.DireccionEnvio, o.CiudadEnvio, o.ReferenciaEnvio),
            o.TieneComprobante,
            o.ComprobanteUrl,
            o.ComprobanteMime
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

    private static string? ValidarEnvio(CrearOrdenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NombreDestinatario) || request.NombreDestinatario.Trim().Length < 3)
            return "Indica el nombre de quien recibe el pedido.";
        if (string.IsNullOrWhiteSpace(request.Telefono) || request.Telefono.Trim().Length < 7)
            return "Indica un teléfono de contacto para el envío.";
        if (string.IsNullOrWhiteSpace(request.Direccion) || request.Direccion.Trim().Length < 5)
            return "Indica la dirección de envío.";
        if (string.IsNullOrWhiteSpace(request.Ciudad) || request.Ciudad.Trim().Length < 2)
            return "Indica la ciudad de envío.";
        return null;
    }

    private static DatosEnvioDto? MapEnvio(
        string nombre, string telefono, string direccion, string ciudad, string? referencia)
    {
        if (string.IsNullOrWhiteSpace(nombre) && string.IsNullOrWhiteSpace(direccion))
            return null;

        return new DatosEnvioDto(nombre, telefono, direccion, ciudad, referencia);
    }

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
        o.Comprobante?.RutaArchivo,
        MapEnvio(o.NombreDestinatario, o.TelefonoEnvio, o.DireccionEnvio, o.CiudadEnvio, o.ReferenciaEnvio)
    );
}

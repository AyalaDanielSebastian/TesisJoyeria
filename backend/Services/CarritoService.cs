using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CarritoService(AppDbContext db)
{
    public async Task<CarritoDto> ObtenerCarritoAsync(int usuarioId)
    {
        var items = await db.CarritoItems
            .Include(c => c.Producto)
            .Where(c => c.UsuarioId == usuarioId)
            .OrderByDescending(c => c.FechaAgregado)
            .ToListAsync();

        var dtos = items.Select(c => new CarritoItemDto(
            c.Id,
            c.ProductoId,
            c.Producto.Nombre,
            c.Producto.ImagenUrl,
            c.Producto.Precio,
            c.PrecioUnitario > 0 ? c.PrecioUnitario : c.Producto.Precio,
            c.Producto.Stock,
            c.Cantidad,
            c.Metal,
            c.Talla,
            c.Grabado,
            c.NotasPersonalizacion,
            c.Producto.PermitePersonalizacion,
            (c.PrecioUnitario > 0 ? c.PrecioUnitario : c.Producto.Precio) * c.Cantidad
        )).ToList();

        var subtotal = dtos.Sum(i => i.Subtotal);
        var impuesto = DbSeeder.CalcularImpuesto(subtotal);
        return new CarritoDto(dtos, subtotal, impuesto, subtotal + impuesto);
    }

    public async Task<(CarritoDto? Carrito, string? Error)> AgregarAsync(int usuarioId, AddCarritoRequest req)
    {
        var producto = await db.Productos.FirstOrDefaultAsync(p => p.Id == req.ProductoId && p.Activo);
        if (producto is null)
            return (null, "Producto no encontrado o no disponible.");

        var metal = req.Metal.Trim();
        var talla = req.Talla.Trim();
        var grabado = req.Grabado.Trim();

        decimal precioUnitario;
        if (producto.PermitePersonalizacion)
        {
            var (precio, errorPrecio) = PrecioPersonalizacionService.CalcularPrecioUnitario(
                producto, metal, talla, grabado);
            if (errorPrecio is not null)
                return (null, errorPrecio);
            precioUnitario = precio;
        }
        else
        {
            metal = string.Empty;
            talla = string.Empty;
            grabado = string.Empty;
            precioUnitario = producto.Precio;
        }

        var enCarrito = await db.CarritoItems
            .Where(c => c.UsuarioId == usuarioId && c.ProductoId == req.ProductoId)
            .SumAsync(c => c.Cantidad);

        if (enCarrito + req.Cantidad > producto.Stock)
            return (null, $"Stock insuficiente. Solo hay {producto.Stock} unidad(es) disponibles.");

        var existente = await db.CarritoItems.FirstOrDefaultAsync(c =>
            c.UsuarioId == usuarioId &&
            c.ProductoId == req.ProductoId &&
            c.Metal == metal &&
            c.Talla == talla &&
            c.Grabado == grabado);

        if (existente is not null)
        {
            existente.Cantidad += req.Cantidad;
            existente.PrecioUnitario = precioUnitario;
        }
        else
        {
            db.CarritoItems.Add(new Models.CarritoItem
            {
                UsuarioId = usuarioId,
                ProductoId = req.ProductoId,
                Cantidad = req.Cantidad,
                Metal = metal,
                Talla = talla,
                Grabado = grabado,
                PrecioUnitario = precioUnitario,
                NotasPersonalizacion = PrecioPersonalizacionService.ResumenPersonalizacion(metal, talla, grabado)
            });
        }

        await db.SaveChangesAsync();
        return (await ObtenerCarritoAsync(usuarioId), null);
    }

    public async Task<(CarritoDto? Carrito, string? Error)> ActualizarAsync(
        int usuarioId, int itemId, UpdateCarritoRequest req)
    {
        var item = await db.CarritoItems
            .Include(c => c.Producto)
            .FirstOrDefaultAsync(c => c.Id == itemId && c.UsuarioId == usuarioId);

        if (item is null)
            return (null, "Producto no encontrado en el carrito.");

        if (req.Cantidad > item.Producto.Stock)
            return (null, $"Stock insuficiente. Solo hay {item.Producto.Stock} unidad(es) disponibles.");

        item.Cantidad = req.Cantidad;

        if (item.Producto.PermitePersonalizacion)
        {
            var metal = req.Metal.Trim();
            var talla = req.Talla.Trim();
            var grabado = req.Grabado.Trim();
            var (precio, errorPrecio) = PrecioPersonalizacionService.CalcularPrecioUnitario(
                item.Producto, metal, talla, grabado);
            if (errorPrecio is not null)
                return (null, errorPrecio);

            item.Metal = metal;
            item.Talla = talla;
            item.Grabado = grabado;
            item.PrecioUnitario = precio;
            item.NotasPersonalizacion = PrecioPersonalizacionService.ResumenPersonalizacion(metal, talla, grabado);
        }

        await db.SaveChangesAsync();
        return (await ObtenerCarritoAsync(usuarioId), null);
    }

    public async Task<(CarritoDto? Carrito, string? Error)> EliminarAsync(int usuarioId, int itemId)
    {
        var item = await db.CarritoItems
            .FirstOrDefaultAsync(c => c.Id == itemId && c.UsuarioId == usuarioId);

        if (item is null)
            return (null, "Producto no encontrado en el carrito.");

        db.CarritoItems.Remove(item);
        await db.SaveChangesAsync();
        return (await ObtenerCarritoAsync(usuarioId), null);
    }
}

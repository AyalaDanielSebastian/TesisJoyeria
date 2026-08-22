using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ProductoService(AppDbContext db)
{
    public async Task<List<CategoriaDto>> ListarCategoriasAsync() =>
        await db.Categorias
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto(c.Id, c.Nombre, c.Descripcion))
            .ToListAsync();

    public async Task<List<ProductoDto>> ListarAsync(bool soloActivos = true, int? categoriaId = null)
    {
        var query = db.Productos.Include(p => p.Categoria).AsQueryable();

        if (soloActivos)
            query = query.Where(p => p.Activo);

        if (categoriaId.HasValue)
            query = query.Where(p => p.CategoriaId == categoriaId.Value);

        var productos = await query
            .OrderByDescending(p => p.FechaCreacion)
            .ToListAsync();

        return productos.Select(MapToDto).ToList();
    }

    public async Task<ProductoDetalleDto?> ObtenerDetalleAsync(int id)
    {
        var producto = await db.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.Id == id && p.Activo);

        return producto is null ? null : MapToDetalleDto(producto);
    }

    public async Task<(CalcularPrecioResponse? Resultado, string? Error)> CalcularPrecioAsync(
        int id, CalcularPrecioRequest req)
    {
        var producto = await db.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.Id == id && p.Activo);
        if (producto is null)
            return (null, "Producto no encontrado.");

        var (precioUnitario, error) = PrecioPersonalizacionService.CalcularPrecioUnitario(
            producto, req.Metal, req.Talla, req.Grabado);

        if (error is not null)
            return (null, error);

        var resumen = PrecioPersonalizacionService.ResumenPersonalizacion(
            req.Metal, req.Talla, req.Grabado);

        return (new CalcularPrecioResponse(
            precioUnitario,
            precioUnitario * req.Cantidad,
            req.Cantidad,
            resumen), null);
    }

    public async Task<(ProductoDto? Producto, string? Error)> CrearAsync(CreateProductoRequest req)
    {
        if (!await db.Categorias.AnyAsync(c => c.Id == req.CategoriaId))
            return (null, "Categoría no encontrada.");

        var metales = NormalizarMetales(req.MetalesDisponibles, req.MaterialDefault);
        var categoria = await db.Categorias.FindAsync(req.CategoriaId);
        var tallas = req.PermitePersonalizacion ? req.TallasDisponibles.Trim() : string.Empty;
        if (PrecioPersonalizacionService.CategoriaSinTalla(categoria?.Nombre))
            tallas = string.Empty;

        var producto = new Producto
        {
            Nombre = req.Nombre.Trim(),
            Descripcion = req.Descripcion.Trim(),
            Precio = req.Precio,
            Stock = req.Stock,
            CategoriaId = req.CategoriaId,
            PermitePersonalizacion = req.PermitePersonalizacion,
            ImagenUrl = req.ImagenUrl,
            MaterialDefault = metales[0],
            OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(metales),
            TallasDisponibles = tallas,
            RecargoGrabado = req.RecargoGrabado
        };

        db.Productos.Add(producto);
        await db.SaveChangesAsync();

        return (MapToDto(await db.Productos.Include(p => p.Categoria).FirstAsync(p => p.Id == producto.Id)), null);
    }

    public async Task<(ProductoDto? Producto, string? Error)> ActualizarAsync(int id, UpdateProductoRequest req, int usuarioId)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null)
            return (null, "Producto no encontrado.");

        if (!await db.Categorias.AnyAsync(c => c.Id == req.CategoriaId))
            return (null, "Categoría no encontrada.");

        var stockAnterior = producto.Stock;
        var metales = NormalizarMetales(req.MetalesDisponibles, req.MaterialDefault);
        var categoria = await db.Categorias.FindAsync(req.CategoriaId);
        var tallas = req.PermitePersonalizacion ? req.TallasDisponibles.Trim() : string.Empty;
        if (PrecioPersonalizacionService.CategoriaSinTalla(categoria?.Nombre))
            tallas = string.Empty;

        producto.Nombre = req.Nombre.Trim();
        producto.Descripcion = req.Descripcion.Trim();
        producto.Precio = req.Precio;
        producto.Stock = req.Stock;
        producto.CategoriaId = req.CategoriaId;
        producto.PermitePersonalizacion = req.PermitePersonalizacion;
        producto.Activo = req.Activo;
        producto.MaterialDefault = metales[0];
        producto.OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(metales);
        producto.TallasDisponibles = tallas;
        producto.RecargoGrabado = req.RecargoGrabado;
        producto.FechaActualizacion = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(req.ImagenUrl))
            producto.ImagenUrl = req.ImagenUrl;

        if (stockAnterior != req.Stock)
        {
            db.HistorialInventario.Add(new HistorialInventario
            {
                ProductoId = id,
                StockAnterior = stockAnterior,
                StockNuevo = req.Stock,
                UsuarioId = usuarioId,
                Motivo = "Actualización desde panel de gestión"
            });
        }

        await db.SaveChangesAsync();
        return (MapToDto(await db.Productos.Include(p => p.Categoria).FirstAsync(p => p.Id == id)), null);
    }

    public async Task<(bool Ok, string? Error)> EliminarAsync(int id)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null)
            return (false, "Producto no encontrado.");

        producto.Activo = false;
        producto.FechaActualizacion = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(ProductoDto? Producto, string? Error)> ActualizarImagenAsync(int id, string imagenUrl)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null)
            return (null, "Producto no encontrado.");

        producto.ImagenUrl = imagenUrl;
        producto.FechaActualizacion = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (MapToDto(await db.Productos.Include(p => p.Categoria).FirstAsync(p => p.Id == id)), null);
    }

    private static List<string> NormalizarMetales(IReadOnlyList<string>? metales, string materialDefault)
    {
        var list = (metales ?? [])
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Select(m => m.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (list.Count == 0)
        {
            if (!string.IsNullOrWhiteSpace(materialDefault))
                list.Add(materialDefault.Trim());
            else
                list.AddRange(PrecioPersonalizacionService.MetalesCatalogo);
        }

        return list;
    }

    private static ProductoDto MapToDto(Producto p)
    {
        var metales = PrecioPersonalizacionService.ObtenerMetales(p).Select(m => m.Nombre).ToList();
        return new ProductoDto(
            p.Id, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.ImagenUrl,
            p.PermitePersonalizacion, p.Activo, p.CategoriaId, p.Categoria.Nombre,
            p.MaterialDefault, p.RecargoGrabado,
            p.TallasDisponibles,
            metales,
            !string.IsNullOrWhiteSpace(p.TallasDisponibles));
    }

    private static ProductoDetalleDto MapToDetalleDto(Producto p)
    {
        var metales = PrecioPersonalizacionService.ObtenerMetales(p)
            .Select(m => new OpcionMetalDto(m.Nombre, 0))
            .ToList();

        return new ProductoDetalleDto(
            p.Id, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.ImagenUrl,
            p.PermitePersonalizacion, p.Activo, p.CategoriaId, p.Categoria.Nombre,
            p.MaterialDefault, p.RecargoGrabado,
            metales,
            PrecioPersonalizacionService.ObtenerTallas(p));
    }
}

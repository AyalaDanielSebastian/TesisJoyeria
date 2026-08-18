using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    private const decimal ImpuestoPorcentaje = 0.15m;

    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        await SeedUsuariosAsync(db);
        await SeedCategoriasAsync(db);
        await SeedProductosAsync(db);
        await SeedPersonalizacionProductosAsync(db);
    }

    private static async Task SeedUsuariosAsync(AppDbContext db)
    {
        if (await db.Usuarios.AnyAsync())
            return;

        db.Usuarios.AddRange(
            new Usuario
            {
                Nombre = "Administrador",
                Email = "admin@joyeria.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Rol = Roles.Administrador
            },
            new Usuario
            {
                Nombre = "Empleado Demo",
                Email = "empleado@joyeria.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Empleado123!"),
                Rol = Roles.Empleado
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task SeedCategoriasAsync(AppDbContext db)
    {
        if (await db.Categorias.AnyAsync())
            return;

        db.Categorias.AddRange(
            new Categoria { Nombre = "Anillos", Descripcion = "Anillos de oro, plata y gemas" },
            new Categoria { Nombre = "Collares", Descripcion = "Collares y gargantillas artesanales" },
            new Categoria { Nombre = "Pendientes", Descripcion = "Pendientes y aretes de diseño exclusivo" },
            new Categoria { Nombre = "Pulseras", Descripcion = "Pulseras y brazaletes finos" }
        );

        await db.SaveChangesAsync();
    }

    private static async Task SeedProductosAsync(AppDbContext db)
    {
        if (await db.Productos.AnyAsync())
            return;

        var categorias = await db.Categorias.ToDictionaryAsync(c => c.Nombre);

        db.Productos.AddRange(
            new Producto
            {
                Nombre = "Pulsera Constelación",
                Descripcion = "Pulsera en oro 18k con diamantes engastados en forma de constelación.",
                Precio = 2450m,
                Stock = 8,
                ImagenUrl = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
                CategoriaId = categorias["Pulseras"].Id,
                MaterialDefault = "Plata italiana",
                OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(PrecioPersonalizacionService.MetalesCatalogo),
                TallasDisponibles = "S,M,L",
                RecargoGrabado = 1.50m
            },
            new Producto
            {
                Nombre = "Anillo Esmeralda Imperial",
                Descripcion = "Anillo exclusivo con esmeralda central y halo de diamantes.",
                Precio = 8900m,
                Stock = 3,
                ImagenUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
                CategoriaId = categorias["Anillos"].Id,
                MaterialDefault = "Plata italiana",
                OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(PrecioPersonalizacionService.MetalesCatalogo),
                TallasDisponibles = "5,6,7,8,9,10",
                RecargoGrabado = 1.50m
            },
            new Producto
            {
                Nombre = "Pendientes Perla Divina",
                Descripcion = "Pendientes en oro con perlas naturales y detalles en brillantes.",
                Precio = 3200m,
                Stock = 12,
                ImagenUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
                CategoriaId = categorias["Pendientes"].Id
            },
            new Producto
            {
                Nombre = "Collar Aurora",
                Descripcion = "Collar de oro blanco con zafiro central y cadena artesanal.",
                Precio = 5600m,
                Stock = 5,
                ImagenUrl = "https://images.unsplash.com/photo-1599643478518-a784e5c4d839?w=600&q=80",
                CategoriaId = categorias["Collares"].Id
            },
            new Producto
            {
                Nombre = "Anillo Solitario Diamante",
                Descripcion = "Clásico solitario en oro 18k con diamante de 1 quilate.",
                Precio = 12500m,
                Stock = 2,
                ImagenUrl = "https://images.unsplash.com/photo-1603561596117-043a5f4632a4?w=600&q=80",
                CategoriaId = categorias["Anillos"].Id,
                MaterialDefault = "Plata italiana",
                OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(PrecioPersonalizacionService.MetalesCatalogo),
                TallasDisponibles = "5,6,7,8,9,10",
                RecargoGrabado = 1.50m
            },
            new Producto
            {
                Nombre = "Pulsera Eslabones Dorados",
                Descripcion = "Pulsera de eslabones en oro amarillo pulido, diseño atemporal.",
                Precio = 1800m,
                Stock = 15,
                ImagenUrl = "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80",
                CategoriaId = categorias["Pulseras"].Id,
                MaterialDefault = "Plata italiana",
                OpcionesMetales = PrecioPersonalizacionService.SerializarMetales(PrecioPersonalizacionService.MetalesCatalogo),
                TallasDisponibles = "S,M,L",
                RecargoGrabado = 1.50m
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task SeedPersonalizacionProductosAsync(AppDbContext db)
    {
        var productos = await db.Productos.Include(p => p.Categoria).ToListAsync();
        var metalesDefaultJson = PrecioPersonalizacionService.SerializarMetales(
            PrecioPersonalizacionService.MetalesCatalogo);

        foreach (var p in productos)
        {
            var metalesActuales = PrecioPersonalizacionService.ObtenerMetales(p);
            var esLegacy = metalesActuales.Any(m =>
                m.Nombre.Contains("Oro", StringComparison.OrdinalIgnoreCase) ||
                m.Nombre.Contains("Platino", StringComparison.OrdinalIgnoreCase) ||
                m.Nombre.Equals("Plata 925", StringComparison.OrdinalIgnoreCase) ||
                m.ModificadorPrecio != 0);

            if (string.IsNullOrWhiteSpace(p.OpcionesMetales) || esLegacy)
            {
                p.OpcionesMetales = metalesDefaultJson;
                p.MaterialDefault = "Plata italiana";
            }
            else if (string.IsNullOrWhiteSpace(p.MaterialDefault))
            {
                p.MaterialDefault = metalesActuales.FirstOrDefault()?.Nombre ?? "Plata italiana";
            }

            if (p.RecargoGrabado <= 0 || p.RecargoGrabado >= 10m)
                p.RecargoGrabado = 1.50m;
        }

        await db.SaveChangesAsync();
    }

    public static decimal CalcularImpuesto(decimal subtotal) =>
        Math.Round(subtotal * ImpuestoPorcentaje, 2);
}

using System.Text.Json;
using backend.Models;

namespace backend.Services;

public static class PrecioPersonalizacionService
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static readonly string[] MetalesCatalogo =
    [
        "Plata italiana",
        "Acero inoxidable"
    ];

    public static readonly OpcionMetal[] MetalesPorDefecto =
    [
        new() { Nombre = "Plata italiana", ModificadorPrecio = 0 },
        new() { Nombre = "Acero inoxidable", ModificadorPrecio = 0 }
    ];

    public static List<OpcionMetal> ObtenerMetales(Producto producto)
    {
        if (string.IsNullOrWhiteSpace(producto.OpcionesMetales))
            return MetalesPorDefecto.Select(m => new OpcionMetal { Nombre = m.Nombre, ModificadorPrecio = 0 }).ToList();

        try
        {
            var list = JsonSerializer.Deserialize<List<OpcionMetal>>(producto.OpcionesMetales, JsonOpts);
            if (list is null || list.Count == 0)
                return MetalesPorDefecto.Select(m => new OpcionMetal { Nombre = m.Nombre, ModificadorPrecio = 0 }).ToList();

            return list
                .Where(m => !string.IsNullOrWhiteSpace(m.Nombre))
                .Select(m => new OpcionMetal { Nombre = m.Nombre.Trim(), ModificadorPrecio = 0 })
                .ToList();
        }
        catch
        {
            return MetalesPorDefecto.Select(m => new OpcionMetal { Nombre = m.Nombre, ModificadorPrecio = 0 }).ToList();
        }
    }

    public static string SerializarMetales(IEnumerable<string> nombres)
    {
        var opciones = nombres
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Select(n => n.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(n => new OpcionMetal { Nombre = n, ModificadorPrecio = 0 })
            .ToList();

        if (opciones.Count == 0)
            opciones = MetalesPorDefecto.ToList();

        return JsonSerializer.Serialize(opciones, JsonOpts);
    }

    public static List<string> ObtenerTallas(Producto producto)
    {
        if (string.IsNullOrWhiteSpace(producto.TallasDisponibles))
            return [];

        return producto.TallasDisponibles
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
    }

    public static (decimal PrecioUnitario, string? Error) CalcularPrecioUnitario(
        Producto producto, string metal, string talla, string grabado)
    {
        var metales = ObtenerMetales(producto);
        var metalSeleccionado = string.IsNullOrWhiteSpace(metal)
            ? metales.FirstOrDefault()?.Nombre ?? producto.MaterialDefault
            : metal.Trim();

        if (metales.Count > 0 &&
            !metales.Any(m => m.Nombre.Equals(metalSeleccionado, StringComparison.OrdinalIgnoreCase)))
            return (0, $"Material '{metalSeleccionado}' no disponible para este producto.");

        var tallas = ObtenerTallas(producto);
        if (tallas.Count > 0)
        {
            if (string.IsNullOrWhiteSpace(talla))
                return (0, "Debe seleccionar una talla.");

            if (!tallas.Any(t => t.Equals(talla.Trim(), StringComparison.OrdinalIgnoreCase)))
                return (0, $"Talla '{talla}' no disponible.");
        }

        // El precio del admin es estable: el material no lo modifica.
        var precio = producto.Precio;

        if (!string.IsNullOrWhiteSpace(grabado.Trim()))
            precio += producto.RecargoGrabado;

        return (precio, null);
    }

    public static string ResumenPersonalizacion(string metal, string talla, string grabado)
    {
        var partes = new List<string>();
        if (!string.IsNullOrWhiteSpace(metal)) partes.Add($"Material: {metal.Trim()}");
        if (!string.IsNullOrWhiteSpace(talla)) partes.Add($"Talla: {talla.Trim()}");
        if (!string.IsNullOrWhiteSpace(grabado)) partes.Add($"Grabado: \"{grabado.Trim()}\"");
        return string.Join(" | ", partes);
    }
}

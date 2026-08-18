using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Producto
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Precio { get; set; }

    [Required]
    public int Stock { get; set; }

    [StringLength(250)]
    public string ImagenUrl { get; set; } = string.Empty;

    [StringLength(50)]
    public string MaterialDefault { get; set; } = "Oro 18k";

    /// <summary>JSON: [{ "nombre": "Oro 18k", "modificadorPrecio": 0 }, ...]</summary>
    [StringLength(1000)]
    public string OpcionesMetales { get; set; } = string.Empty;

    /// <summary>Tallas separadas por coma: 5,6,7,8</summary>
    [StringLength(200)]
    public string TallasDisponibles { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal RecargoGrabado { get; set; } = 1.50m;

    public bool PermitePersonalizacion { get; set; } = true;

    public bool Activo { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }

    [Required]
    public int CategoriaId { get; set; }

    public Categoria Categoria { get; set; } = null!;

    public ICollection<OrdenDetalle> DetallesOrden { get; set; } = [];

    public ICollection<CarritoItem> ItemsCarrito { get; set; } = [];

    public ICollection<HistorialInventario> HistorialInventario { get; set; } = [];
}

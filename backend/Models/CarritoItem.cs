using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class CarritoItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UsuarioId { get; set; }

    public Usuario Usuario { get; set; } = null!;

    [Required]
    public int ProductoId { get; set; }

    public Producto Producto { get; set; } = null!;

    [Required]
    public int Cantidad { get; set; }

    [StringLength(50)]
    public string Metal { get; set; } = string.Empty;

    [StringLength(20)]
    public string Talla { get; set; } = string.Empty;

    [StringLength(200)]
    public string Grabado { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecioUnitario { get; set; }

    [StringLength(500)]
    public string NotasPersonalizacion { get; set; } = string.Empty;

    public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;
}

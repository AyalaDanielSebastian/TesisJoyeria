using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class HistorialInventario
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProductoId { get; set; }

    public Producto Producto { get; set; } = null!;

    public int StockAnterior { get; set; }

    public int StockNuevo { get; set; }

    [Required]
    public int UsuarioId { get; set; }

    public Usuario Usuario { get; set; } = null!;

    [StringLength(300)]
    public string Motivo { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}

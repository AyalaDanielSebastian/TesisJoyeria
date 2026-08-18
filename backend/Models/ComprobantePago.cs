using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ComprobantePago
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrdenId { get; set; }

    public Orden Orden { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string RutaArchivo { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string NombreOriginal { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string TipoMime { get; set; } = string.Empty;

    public long TamanoBytes { get; set; }

    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;
}

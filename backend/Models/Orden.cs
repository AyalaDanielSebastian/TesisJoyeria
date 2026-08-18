using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Orden
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ClienteId { get; set; }

    public Usuario Cliente { get; set; } = null!;

    [Required]
    [StringLength(30)]
    public string Estado { get; set; } = EstadosOrden.PendientePago;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Impuesto { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    /// <summary>Monto ya abonado (anticipo u otros pagos).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal MontoPagado { get; set; }

    [Required]
    [StringLength(100)]
    public string NombreDestinatario { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string TelefonoEnvio { get; set; } = string.Empty;

    [Required]
    [StringLength(250)]
    public string DireccionEnvio { get; set; } = string.Empty;

    [Required]
    [StringLength(80)]
    public string CiudadEnvio { get; set; } = string.Empty;

    [StringLength(200)]
    public string? ReferenciaEnvio { get; set; }

    [StringLength(500)]
    public string? NotasVerificacion { get; set; }

    public int? EmpleadoVerificadorId { get; set; }

    public Usuario? EmpleadoVerificador { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaVerificacion { get; set; }

    public ICollection<OrdenDetalle> Detalles { get; set; } = [];

    public ComprobantePago? Comprobante { get; set; }
}

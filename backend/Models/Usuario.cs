using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Rol { get; set; } = "Cliente";

    public bool Activo { get; set; } = true;

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }

    public DateTime? UltimoAcceso { get; set; }

    public DateTime? FechaDesactivacion { get; set; }

    public int? ModificadoPorId { get; set; }

    public Usuario? ModificadoPor { get; set; }

    public ICollection<Orden> OrdenesComoCliente { get; set; } = [];

    public ICollection<Orden> OrdenesVerificadas { get; set; } = [];

    public ICollection<CarritoItem> ItemsCarrito { get; set; } = [];

    public ICollection<HistorialInventario> CambiosInventario { get; set; } = [];
}

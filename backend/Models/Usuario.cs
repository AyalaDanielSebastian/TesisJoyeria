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

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
}

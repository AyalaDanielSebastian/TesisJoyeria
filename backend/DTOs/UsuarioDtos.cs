using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record UsuarioDto(
    int Id,
    string Nombre,
    string Email,
    string Rol,
    bool Activo,
    DateTime FechaRegistro,
    DateTime? FechaActualizacion,
    DateTime? UltimoAcceso,
    DateTime? FechaDesactivacion,
    string? ModificadoPorNombre
);

public record UpdateRolRequest(
    [Required][StringLength(20)] string Rol
);

public record UpdateActivoRequest(
    [Required] bool Activo
);

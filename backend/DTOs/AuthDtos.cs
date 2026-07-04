using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public record RegisterRequest(
    [Required][StringLength(100)] string Nombre,
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password
);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    int Id,
    string Nombre,
    string Email,
    string Rol
);

public record ErrorResponse(string Message);

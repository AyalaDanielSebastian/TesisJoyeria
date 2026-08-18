using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService(AppDbContext db, IConfiguration config)
{
    public async Task<(AuthResponse? Response, string? Error)> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Usuarios.AnyAsync(u => u.Email == email))
            return (null, "El email ya está registrado.");

        var usuario = new Usuario
        {
            Nombre = request.Nombre.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Rol = Roles.Cliente
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        return (BuildAuthResponse(usuario), null);
    }

    public async Task<(AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            return (null, "Email o contraseña incorrectos.");

        if (!usuario.Activo)
            return (null, "Tu cuenta está desactivada. Contacta al administrador.");

        usuario.UltimoAcceso = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (BuildAuthResponse(usuario), null);
    }

    private AuthResponse BuildAuthResponse(Usuario usuario)
    {
        var jwt = config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Rol)
        };

        var expires = DateTime.UtcNow.AddHours(double.Parse(jwt["ExpiresInHours"] ?? "8"));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new AuthResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            usuario.Id,
            usuario.Nombre,
            usuario.Email,
            usuario.Rol
        );
    }
}

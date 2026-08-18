using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AdminService(AppDbContext db)
{
    public async Task<List<UsuarioDto>> ListarUsuariosAsync()
    {
        var usuarios = await db.Usuarios
            .Include(u => u.ModificadoPor)
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return usuarios.Select(MapDto).ToList();
    }

    public async Task<(UsuarioDto? Usuario, string? Error)> ActualizarRolAsync(
        int usuarioId,
        string nuevoRol,
        int adminId)
    {
        if (!Roles.Todos.Contains(nuevoRol))
            return (null, "Rol no válido. Use: Administrador, Empleado o Cliente.");

        if (usuarioId == adminId)
            return (null, "No puedes cambiar tu propio rol.");

        var usuario = await db.Usuarios
            .Include(u => u.ModificadoPor)
            .FirstOrDefaultAsync(u => u.Id == usuarioId);
        if (usuario is null)
            return (null, "Usuario no encontrado.");

        if (usuario.Rol == Roles.Administrador && nuevoRol != Roles.Administrador)
        {
            var adminsRestantes = await db.Usuarios
                .CountAsync(u => u.Rol == Roles.Administrador && u.Activo && u.Id != usuarioId);

            if (adminsRestantes == 0)
                return (null, "Debe existir al menos un administrador activo en el sistema.");
        }

        usuario.Rol = nuevoRol;
        MarcarAuditoria(usuario, adminId);
        await db.SaveChangesAsync();

        return (MapDto(usuario), null);
    }

    public async Task<(UsuarioDto? Usuario, string? Error)> ActualizarActivoAsync(
        int usuarioId,
        bool activo,
        int adminId)
    {
        if (usuarioId == adminId)
            return (null, "No puedes desactivar tu propia cuenta.");

        var usuario = await db.Usuarios
            .Include(u => u.ModificadoPor)
            .FirstOrDefaultAsync(u => u.Id == usuarioId);
        if (usuario is null)
            return (null, "Usuario no encontrado.");

        if (!activo && usuario.Rol == Roles.Administrador)
        {
            var adminsActivos = await db.Usuarios
                .CountAsync(u => u.Rol == Roles.Administrador && u.Activo && u.Id != usuarioId);
            if (adminsActivos == 0)
                return (null, "Debe existir al menos un administrador activo.");
        }

        usuario.Activo = activo;
        usuario.FechaDesactivacion = activo ? null : DateTime.UtcNow;
        MarcarAuditoria(usuario, adminId);
        await db.SaveChangesAsync();

        return (MapDto(usuario), null);
    }

    public static int ObtenerUsuarioId(ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static void MarcarAuditoria(Usuario usuario, int adminId)
    {
        usuario.FechaActualizacion = DateTime.UtcNow;
        usuario.ModificadoPorId = adminId;
    }

    private static UsuarioDto MapDto(Usuario u) => new(
        u.Id,
        u.Nombre,
        u.Email,
        u.Rol,
        u.Activo,
        u.FechaRegistro,
        u.FechaActualizacion,
        u.UltimoAcceso,
        u.FechaDesactivacion,
        u.ModificadoPor?.Nombre
    );
}

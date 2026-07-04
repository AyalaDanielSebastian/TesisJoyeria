using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Usuarios.AnyAsync())
            return;

        var usuarios = new[]
        {
            new Usuario
            {
                Nombre = "Administrador",
                Email = "admin@joyeria.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Rol = Roles.Administrador
            },
            new Usuario
            {
                Nombre = "Empleado Demo",
                Email = "empleado@joyeria.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Empleado123!"),
                Rol = Roles.Empleado
            }
        };

        db.Usuarios.AddRange(usuarios);
        await db.SaveChangesAsync();
    }
}

using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Orden> Ordenes => Set<Orden>();
    public DbSet<OrdenDetalle> OrdenesDetalle => Set<OrdenDetalle>();
    public DbSet<ComprobantePago> ComprobantesPago => Set<ComprobantePago>();
    public DbSet<CarritoItem> CarritoItems => Set<CarritoItem>();
    public DbSet<HistorialInventario> HistorialInventario => Set<HistorialInventario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.ModificadoPor)
            .WithMany()
            .HasForeignKey(u => u.ModificadoPorId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Producto>()
            .HasOne(p => p.Categoria)
            .WithMany(c => c.Productos)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Producto>()
            .HasCheckConstraint("CK_Producto_Stock", "[Stock] >= 0");

        modelBuilder.Entity<Orden>()
            .HasOne(o => o.Cliente)
            .WithMany(u => u.OrdenesComoCliente)
            .HasForeignKey(o => o.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Orden>()
            .HasOne(o => o.EmpleadoVerificador)
            .WithMany(u => u.OrdenesVerificadas)
            .HasForeignKey(o => o.EmpleadoVerificadorId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<OrdenDetalle>()
            .HasOne(d => d.Orden)
            .WithMany(o => o.Detalles)
            .HasForeignKey(d => d.OrdenId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrdenDetalle>()
            .HasOne(d => d.Producto)
            .WithMany(p => p.DetallesOrden)
            .HasForeignKey(d => d.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrdenDetalle>()
            .HasCheckConstraint("CK_OrdenDetalle_Cantidad", "[Cantidad] > 0");

        modelBuilder.Entity<ComprobantePago>()
            .HasOne(c => c.Orden)
            .WithOne(o => o.Comprobante)
            .HasForeignKey<ComprobantePago>(c => c.OrdenId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ComprobantePago>()
            .HasIndex(c => c.OrdenId)
            .IsUnique();

        modelBuilder.Entity<CarritoItem>()
            .HasOne(c => c.Usuario)
            .WithMany(u => u.ItemsCarrito)
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CarritoItem>()
            .HasOne(c => c.Producto)
            .WithMany(p => p.ItemsCarrito)
            .HasForeignKey(c => c.ProductoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CarritoItem>()
            .HasCheckConstraint("CK_CarritoItem_Cantidad", "[Cantidad] > 0");

        modelBuilder.Entity<HistorialInventario>()
            .HasOne(h => h.Producto)
            .WithMany(p => p.HistorialInventario)
            .HasForeignKey(h => h.ProductoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HistorialInventario>()
            .HasOne(h => h.Usuario)
            .WithMany(u => u.CambiosInventario)
            .HasForeignKey(h => h.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

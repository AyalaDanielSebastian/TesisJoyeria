using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Categoria
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(250)]
    public string Descripcion { get; set; } = string.Empty;

    public ICollection<Producto> Productos { get; set; } = [];
}

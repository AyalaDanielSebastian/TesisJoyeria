using System.Security.Claims;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController(
    ProductoService productoService,
    FileStorageService fileStorage) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? categoriaId) =>
        Ok(await productoService.ListarAsync(soloActivos: true, categoriaId));

    [HttpGet("gestion")]
    [Authorize(Roles = $"{Roles.Administrador},{Roles.Empleado}")]
    public async Task<IActionResult> ListarGestion() =>
        Ok(await productoService.ListarAsync(soloActivos: false));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var producto = await productoService.ObtenerDetalleAsync(id);
        return producto is null ? NotFound(new ErrorResponse("Producto no encontrado.")) : Ok(producto);
    }

    [HttpPost("{id:int}/calcular-precio")]
    public async Task<IActionResult> CalcularPrecio(int id, [FromBody] CalcularPrecioRequest request)
    {
        var (resultado, error) = await productoService.CalcularPrecioAsync(id, request);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(resultado);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.Administrador},{Roles.Empleado}")]
    public async Task<IActionResult> Crear([FromBody] CreateProductoRequest request)
    {
        var (producto, error) = await productoService.CrearAsync(request);
        return error is not null ? BadRequest(new ErrorResponse(error)) : CreatedAtAction(nameof(Obtener), new { id = producto!.Id }, producto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{Roles.Administrador},{Roles.Empleado}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] UpdateProductoRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (producto, error) = await productoService.ActualizarAsync(id, request, userId);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(producto);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{Roles.Administrador},{Roles.Empleado}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var (ok, error) = await productoService.EliminarAsync(id);
        return error is not null ? BadRequest(new ErrorResponse(error)) : NoContent();
    }

    [HttpPost("{id:int}/imagen")]
    [Authorize(Roles = $"{Roles.Administrador},{Roles.Empleado}")]
    public async Task<IActionResult> SubirImagen(int id, IFormFile archivo)
    {
        if (archivo is null || archivo.Length == 0)
            return BadRequest(new ErrorResponse("Debe enviar una imagen."));

        try
        {
            var url = await fileStorage.GuardarImagenProductoAsync(archivo);
            var (producto, error) = await productoService.ActualizarImagenAsync(id, url);
            return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(producto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse(ex.Message));
        }
    }
}

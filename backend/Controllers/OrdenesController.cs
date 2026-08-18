using System.Security.Claims;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Cliente)]
public class OrdenesController(
    OrdenService ordenService,
    FileStorageService fileStorage) : ControllerBase
{
    private int ClienteId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> MisOrdenes() =>
        Ok(await ordenService.ListarMisOrdenesAsync(ClienteId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var orden = await ordenService.ObtenerAsync(id, ClienteId);
        return orden is null ? NotFound(new ErrorResponse("Orden no encontrada.")) : Ok(orden);
    }

    [HttpPost]
    public async Task<IActionResult> CrearDesdeCarrito([FromBody] CrearOrdenRequest? request)
    {
        var (orden, error) = await ordenService.CrearDesdeCarritoAsync(ClienteId, request ?? new CrearOrdenRequest());
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(orden);
    }

    [HttpPost("{id:int}/comprobante")]
    public async Task<IActionResult> SubirComprobante(int id, IFormFile archivo)
    {
        if (archivo is null || archivo.Length == 0)
            return BadRequest(new ErrorResponse("Debe enviar un comprobante de pago."));

        try
        {
            var (ruta, nombre, mime, tamano) = await fileStorage.GuardarComprobanteAsync(archivo, id);
            var (orden, error) = await ordenService.SubirComprobanteAsync(id, ClienteId, ruta, nombre, mime, tamano);
            return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(orden);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse(ex.Message));
        }
    }
}

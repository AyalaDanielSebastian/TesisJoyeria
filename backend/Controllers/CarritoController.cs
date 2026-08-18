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
public class CarritoController(CarritoService carritoService) : ControllerBase
{
    private int ClienteId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Obtener() =>
        Ok(await carritoService.ObtenerCarritoAsync(ClienteId));

    [HttpPost]
    public async Task<IActionResult> Agregar([FromBody] AddCarritoRequest request)
    {
        var (carrito, error) = await carritoService.AgregarAsync(ClienteId, request);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(carrito);
    }

    [HttpPut("items/{itemId:int}")]
    public async Task<IActionResult> Actualizar(int itemId, [FromBody] UpdateCarritoRequest request)
    {
        var (carrito, error) = await carritoService.ActualizarAsync(ClienteId, itemId, request);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(carrito);
    }

    [HttpDelete("items/{itemId:int}")]
    public async Task<IActionResult> Eliminar(int itemId)
    {
        var (carrito, error) = await carritoService.EliminarAsync(ClienteId, itemId);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(carrito);
    }
}

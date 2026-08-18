using System.Security.Claims;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/empleado/ordenes")]
[Authorize(Roles = Roles.Empleado)]
public class EmpleadoOrdenesController(OrdenEmpleadoService ordenEmpleadoService) : ControllerBase
{
    private int EmpleadoId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Listar() =>
        Ok(await ordenEmpleadoService.ListarEntrantesAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var orden = await ordenEmpleadoService.ObtenerAsync(id);
        return orden is null ? NotFound(new ErrorResponse("Orden no encontrada.")) : Ok(orden);
    }

    [HttpPut("{id:int}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoOrdenRequest request)
    {
        var (orden, error) = await ordenEmpleadoService.ActualizarEstadoAsync(id, EmpleadoId, request);
        return error is not null ? BadRequest(new ErrorResponse(error)) : Ok(orden);
    }
}

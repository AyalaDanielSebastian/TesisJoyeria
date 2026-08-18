using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = Roles.Administrador)]
public class AdminController(AdminService adminService) : ControllerBase
{
    [HttpGet("usuarios")]
    public async Task<IActionResult> ListarUsuarios()
    {
        var usuarios = await adminService.ListarUsuariosAsync();
        return Ok(usuarios);
    }

    [HttpPut("usuarios/{id:int}/rol")]
    public async Task<IActionResult> ActualizarRol(int id, [FromBody] UpdateRolRequest request)
    {
        var adminId = AdminService.ObtenerUsuarioId(User);
        var (usuario, error) = await adminService.ActualizarRolAsync(id, request.Rol, adminId);

        if (error is not null)
            return BadRequest(new ErrorResponse(error));

        return Ok(usuario);
    }

    [HttpPut("usuarios/{id:int}/activo")]
    public async Task<IActionResult> ActualizarActivo(int id, [FromBody] UpdateActivoRequest request)
    {
        var adminId = AdminService.ObtenerUsuarioId(User);
        var (usuario, error) = await adminService.ActualizarActivoAsync(id, request.Activo, adminId);

        if (error is not null)
            return BadRequest(new ErrorResponse(error));

        return Ok(usuario);
    }
}

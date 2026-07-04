using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (response, error) = await authService.RegisterAsync(request);

        if (error is not null)
            return Conflict(new ErrorResponse(error));

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (response, error) = await authService.LoginAsync(request);

        if (error is not null)
            return Unauthorized(new ErrorResponse(error));

        return Ok(response);
    }
}

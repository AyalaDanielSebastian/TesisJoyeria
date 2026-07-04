namespace backend.Models;

public static class Roles
{
    public const string Administrador = "Administrador";
    public const string Empleado = "Empleado";
    public const string Cliente = "Cliente";

    public static readonly string[] Todos = [Administrador, Empleado, Cliente];
}

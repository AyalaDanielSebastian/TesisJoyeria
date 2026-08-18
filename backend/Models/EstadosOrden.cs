namespace backend.Models;

public static class EstadosOrden
{
    public const string PendientePago = "PendientePago";
    public const string PendienteVerificacion = "PendienteVerificacion";
    public const string AnticipoValidado = "AnticipoValidado";
    public const string Aprobada = "Aprobada";
    public const string Rechazada = "Rechazada";
    public const string Cancelada = "Cancelada";

    public static readonly string[] Todos =
    [
        PendientePago,
        PendienteVerificacion,
        AnticipoValidado,
        Aprobada,
        Rechazada,
        Cancelada
    ];

    public static readonly string[] EstadosFinalesVerificacion =
    [
        AnticipoValidado,
        Aprobada,
        Rechazada,
        Cancelada
    ];

    public static readonly string[] TransicionesEmpleado =
    [
        AnticipoValidado,
        Rechazada
    ];
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class DatosEnvioOrden : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CiudadEnvio",
                table: "Ordenes",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DireccionEnvio",
                table: "Ordenes",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NombreDestinatario",
                table: "Ordenes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReferenciaEnvio",
                table: "Ordenes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefonoEnvio",
                table: "Ordenes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CiudadEnvio",
                table: "Ordenes");

            migrationBuilder.DropColumn(
                name: "DireccionEnvio",
                table: "Ordenes");

            migrationBuilder.DropColumn(
                name: "NombreDestinatario",
                table: "Ordenes");

            migrationBuilder.DropColumn(
                name: "ReferenciaEnvio",
                table: "Ordenes");

            migrationBuilder.DropColumn(
                name: "TelefonoEnvio",
                table: "Ordenes");
        }
    }
}

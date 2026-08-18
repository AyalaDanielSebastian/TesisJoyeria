using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FichaProductoPersonalizacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarritoItems_UsuarioId_ProductoId",
                table: "CarritoItems");

            migrationBuilder.AddColumn<string>(
                name: "MaterialDefault",
                table: "Productos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OpcionesMetales",
                table: "Productos",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "RecargoGrabado",
                table: "Productos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TallasDisponibles",
                table: "Productos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grabado",
                table: "OrdenesDetalle",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metal",
                table: "OrdenesDetalle",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Talla",
                table: "OrdenesDetalle",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grabado",
                table: "CarritoItems",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metal",
                table: "CarritoItems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioUnitario",
                table: "CarritoItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Talla",
                table: "CarritoItems",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CarritoItems_UsuarioId",
                table: "CarritoItems",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarritoItems_UsuarioId",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "MaterialDefault",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "OpcionesMetales",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "RecargoGrabado",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "TallasDisponibles",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Grabado",
                table: "OrdenesDetalle");

            migrationBuilder.DropColumn(
                name: "Metal",
                table: "OrdenesDetalle");

            migrationBuilder.DropColumn(
                name: "Talla",
                table: "OrdenesDetalle");

            migrationBuilder.DropColumn(
                name: "Grabado",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "Metal",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "PrecioUnitario",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "Talla",
                table: "CarritoItems");

            migrationBuilder.CreateIndex(
                name: "IX_CarritoItems_UsuarioId_ProductoId",
                table: "CarritoItems",
                columns: new[] { "UsuarioId", "ProductoId" },
                unique: true);
        }
    }
}

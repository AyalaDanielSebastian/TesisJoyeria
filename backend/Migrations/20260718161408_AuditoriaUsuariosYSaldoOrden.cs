using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AuditoriaUsuariosYSaldoOrden : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaDesactivacion",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModificadoPorId",
                table: "Usuarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimoAcceso",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoPagado",
                table: "Ordenes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ModificadoPorId",
                table: "Usuarios",
                column: "ModificadoPorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Usuarios_ModificadoPorId",
                table: "Usuarios",
                column: "ModificadoPorId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Usuarios_ModificadoPorId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_ModificadoPorId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaDesactivacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "ModificadoPorId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UltimoAcceso",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "MontoPagado",
                table: "Ordenes");
        }
    }
}

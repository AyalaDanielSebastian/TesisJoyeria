using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonalizacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PermitePersonalizacion",
                table: "Productos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NotasPersonalizacion",
                table: "OrdenesDetalle",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NotasPersonalizacion",
                table: "CarritoItems",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PermitePersonalizacion",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "NotasPersonalizacion",
                table: "OrdenesDetalle");

            migrationBuilder.DropColumn(
                name: "NotasPersonalizacion",
                table: "CarritoItems");
        }
    }
}

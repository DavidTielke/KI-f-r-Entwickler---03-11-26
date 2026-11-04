using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Persons",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(
                "UPDATE \"Persons\" SET \"Order\" = (SELECT COUNT(*) + 1 FROM \"Persons\" AS p2 WHERE p2.\"Name\" < \"Persons\".\"Name\" OR (p2.\"Name\" = \"Persons\".\"Name\" AND p2.\"Id\" <= \"Persons\".\"Id\"));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Persons");
        }
    }
}

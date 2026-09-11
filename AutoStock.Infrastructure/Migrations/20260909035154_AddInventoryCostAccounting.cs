using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoStock.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryCostAccounting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostOfGoodsSold",
                table: "SaleItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GrossProfit",
                table: "SaleItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitCost",
                table: "SaleItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageUnitCost",
                table: "Cars",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostOfGoodsSold",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "GrossProfit",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "AverageUnitCost",
                table: "Cars");
        }
    }
}

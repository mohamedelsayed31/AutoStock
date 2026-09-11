using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoStock.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStockTransactionAccountingMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockTransactions_Cars_CarId",
                table: "StockTransactions");

            migrationBuilder.AddColumn<decimal>(
                name: "InventoryValue",
                table: "StockTransactions",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SourceId",
                table: "StockTransactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                table: "StockTransactions",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitCost",
                table: "StockTransactions",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockTransactions_SourceType_SourceId",
                table: "StockTransactions",
                columns: new[] { "SourceType", "SourceId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransactions_TransactionDate",
                table: "StockTransactions",
                column: "TransactionDate");

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransactions_Cars_CarId",
                table: "StockTransactions",
                column: "CarId",
                principalTable: "Cars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockTransactions_Cars_CarId",
                table: "StockTransactions");

            migrationBuilder.DropIndex(
                name: "IX_StockTransactions_SourceType_SourceId",
                table: "StockTransactions");

            migrationBuilder.DropIndex(
                name: "IX_StockTransactions_TransactionDate",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "InventoryValue",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "SourceId",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "SourceType",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                table: "StockTransactions");

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransactions_Cars_CarId",
                table: "StockTransactions",
                column: "CarId",
                principalTable: "Cars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

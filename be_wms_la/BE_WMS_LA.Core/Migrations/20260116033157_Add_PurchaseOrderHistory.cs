using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE_WMS_LA.Core.Migrations
{
    /// <inheritdoc />
    public partial class Add_PurchaseOrderHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PurchaseOrderHistory",
                columns: table => new
                {
                    HistoryID = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderID = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OldStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NewStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PerformedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Metadata = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrderHistory", x => x.HistoryID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderHistory_PurchaseOrders_PurchaseOrderID",
                        column: x => x.PurchaseOrderID,
                        principalTable: "PurchaseOrders",
                        principalColumn: "PurchaseOrderID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderHistory_User_PerformedByUserID",
                        column: x => x.PerformedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderHistory_PerformedByUserID",
                table: "PurchaseOrderHistory",
                column: "PerformedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderHistory_PurchaseOrderID",
                table: "PurchaseOrderHistory",
                column: "PurchaseOrderID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PurchaseOrderHistory");
        }
    }
}

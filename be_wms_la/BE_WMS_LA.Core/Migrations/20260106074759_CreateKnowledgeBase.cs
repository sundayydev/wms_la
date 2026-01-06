using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE_WMS_LA.Core.Migrations
{
    /// <inheritdoc />
    public partial class CreateKnowledgeBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductKnowledgeBase",
                columns: table => new
                {
                    KnowledgeID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ContentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContentURL = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ThumbnailURL = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BucketName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ObjectKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ETag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    VersionID = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ShareToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SharedURL = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SharedExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsShared = table.Column<bool>(type: "boolean", nullable: false),
                    MaxDownloads = table.Column<int>(type: "integer", nullable: true),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false),
                    SharedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    SharedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AccessLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AllowedRoles = table.Column<string>(type: "jsonb", nullable: false),
                    UploadedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductKnowledgeBase", x => x.KnowledgeID);
                    table.ForeignKey(
                        name: "FK_ProductKnowledgeBase_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductKnowledgeBase_User_SharedByUserID",
                        column: x => x.SharedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductKnowledgeBase_User_UploadedByUserID",
                        column: x => x.UploadedByUserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductKnowledgeBase_ComponentID",
                table: "ProductKnowledgeBase",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductKnowledgeBase_SharedByUserID",
                table: "ProductKnowledgeBase",
                column: "SharedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductKnowledgeBase_ShareToken",
                table: "ProductKnowledgeBase",
                column: "ShareToken",
                unique: true,
                filter: "\"ShareToken\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProductKnowledgeBase_UploadedByUserID",
                table: "ProductKnowledgeBase",
                column: "UploadedByUserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductKnowledgeBase");
        }
    }
}

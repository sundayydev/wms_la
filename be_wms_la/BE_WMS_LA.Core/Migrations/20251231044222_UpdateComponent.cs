using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE_WMS_LA.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "Components",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Components",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompatibleWith",
                table: "Components",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ComponentNameVN",
                table: "Components",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultWarrantyMonths",
                table: "Components",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FullDescription",
                table: "Components",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Height",
                table: "Components",
                type: "numeric(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageGallery",
                table: "Components",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Length",
                table: "Components",
                type: "numeric(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManufacturerSKU",
                table: "Components",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxStockLevel",
                table: "Components",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinStockLevel",
                table: "Components",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Components",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductType",
                table: "Components",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                table: "Components",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Components",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Components",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Components",
                type: "numeric(10,3)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WholesalePrice",
                table: "Components",
                type: "numeric(15,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Width",
                table: "Components",
                type: "numeric(10,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "CompatibleWith",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "ComponentNameVN",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "DefaultWarrantyMonths",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "FullDescription",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "ImageGallery",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Length",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "ManufacturerSKU",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "MaxStockLevel",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "MinStockLevel",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "ProductType",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "ShortDescription",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "WholesalePrice",
                table: "Components");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "Components");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BE_WMS_LA.Core.Migrations
{
    /// <inheritdoc />
    public partial class InitDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CustomerGroup = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Ward = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerID);
                });

            migrationBuilder.CreateTable(
                name: "Permission",
                columns: table => new
                {
                    PermissionID = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permission", x => x.PermissionID);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    SupplierID = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactPerson = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BankAccount = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.SupplierID);
                });

            migrationBuilder.CreateTable(
                name: "CustomerContacts",
                columns: table => new
                {
                    ContactID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsDefaultReceiver = table.Column<bool>(type: "boolean", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerContacts", x => x.ContactID);
                    table.ForeignKey(
                        name: "FK_CustomerContacts_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Components",
                columns: table => new
                {
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    SKU = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ComponentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ComponentNameVN = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CategoryID = table.Column<Guid>(type: "uuid", nullable: true),
                    SupplierID = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ManufacturerSKU = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ImageURL = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImageGallery = table.Column<string>(type: "jsonb", nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    SellPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    WholesalePrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    IsSerialized = table.Column<bool>(type: "boolean", nullable: false),
                    MinStockLevel = table.Column<int>(type: "integer", nullable: false),
                    MaxStockLevel = table.Column<int>(type: "integer", nullable: true),
                    DefaultWarrantyMonths = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(10,3)", nullable: true),
                    Length = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    Width = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    Height = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    Specifications = table.Column<string>(type: "jsonb", nullable: false),
                    Tags = table.Column<string>(type: "jsonb", nullable: false),
                    Documents = table.Column<string>(type: "jsonb", nullable: false),
                    Competitors = table.Column<string>(type: "jsonb", nullable: false),
                    CompatibleWith = table.Column<string>(type: "jsonb", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShortDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FullDescription = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Components", x => x.ComponentID);
                    table.ForeignKey(
                        name: "FK_Components_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Components_Suppliers_SupplierID",
                        column: x => x.SupplierID,
                        principalTable: "Suppliers",
                        principalColumn: "SupplierID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ComponentVariants",
                columns: table => new
                {
                    VariantID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    PartNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    VariantName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    VariantDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    VariantSpecs = table.Column<string>(type: "jsonb", nullable: true),
                    BasePrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    SellPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    WholesalePrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    Barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MinStockLevel = table.Column<int>(type: "integer", nullable: false),
                    MaxStockLevel = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComponentVariants", x => x.VariantID);
                    table.ForeignKey(
                        name: "FK_ComponentVariants_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    SettingID = table.Column<Guid>(type: "uuid", nullable: false),
                    SettingKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DataType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InputType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Options = table.Column<string>(type: "jsonb", nullable: true),
                    IsEncrypted = table.Column<bool>(type: "boolean", nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.SettingID);
                });

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    AttachmentID = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityID = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    FileURL = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UploadedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.AttachmentID);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    LogID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EntityID = table.Column<Guid>(type: "uuid", nullable: true),
                    OldValue = table.Column<string>(type: "jsonb", nullable: true),
                    NewValue = table.Column<string>(type: "jsonb", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RequestID = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IPAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.LogID);
                });

            migrationBuilder.CreateTable(
                name: "DeviceTokens",
                columns: table => new
                {
                    TokenID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DeviceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DeviceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceTokens", x => x.TokenID);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                columns: table => new
                {
                    TransactionID = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReferenceID = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.TransactionID);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    NotificationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceID = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentID = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReferenceID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: true),
                    SupplierID = table.Column<Guid>(type: "uuid", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionID = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_Payments_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_Suppliers_SupplierID",
                        column: x => x.SupplierID,
                        principalTable: "Suppliers",
                        principalColumn: "SupplierID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProductInstances",
                columns: table => new
                {
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    VariantID = table.Column<Guid>(type: "uuid", nullable: true),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: true),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModelNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InboundBoxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IMEI1 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IMEI2 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    MACAddress = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LocationCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Zone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CurrentOwnerType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CurrentOwnerID = table.Column<Guid>(type: "uuid", nullable: true),
                    WarrantyStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WarrantyMonths = table.Column<int>(type: "integer", nullable: false),
                    TotalRepairCount = table.Column<int>(type: "integer", nullable: false),
                    LastRepairDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualImportPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    ActualSellPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    SoldDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SoldToCustomerID = table.Column<Guid>(type: "uuid", nullable: true),
                    ImportDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductInstances", x => x.InstanceID);
                    table.ForeignKey(
                        name: "FK_ProductInstances_ComponentVariants_VariantID",
                        column: x => x.VariantID,
                        principalTable: "ComponentVariants",
                        principalColumn: "VariantID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductInstances_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrderDetails",
                columns: table => new
                {
                    PurchaseOrderDetailID = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrderDetails", x => x.PurchaseOrderDetailID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderDetails_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    PurchaseOrderID = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SupplierID = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedDeliveryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ActualDeliveryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    CreatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.PurchaseOrderID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrders_Suppliers_SupplierID",
                        column: x => x.SupplierID,
                        principalTable: "Suppliers",
                        principalColumn: "SupplierID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RepairParts",
                columns: table => new
                {
                    RepairPartID = table.Column<Guid>(type: "uuid", nullable: false),
                    RepairID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairParts", x => x.RepairPartID);
                    table.ForeignKey(
                        name: "FK_RepairParts_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RepairParts_ProductInstances_InstanceID",
                        column: x => x.InstanceID,
                        principalTable: "ProductInstances",
                        principalColumn: "InstanceID");
                });

            migrationBuilder.CreateTable(
                name: "Repairs",
                columns: table => new
                {
                    RepairID = table.Column<Guid>(type: "uuid", nullable: false),
                    RepairCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: true),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: true),
                    ProblemDescription = table.Column<string>(type: "text", nullable: false),
                    RepairDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedCompletionDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ActualCompletionDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TechnicianUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    RepairCost = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    PartsCost = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    WarrantyType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Repairs", x => x.RepairID);
                    table.ForeignKey(
                        name: "FK_Repairs_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID");
                    table.ForeignKey(
                        name: "FK_Repairs_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Repairs_ProductInstances_InstanceID",
                        column: x => x.InstanceID,
                        principalTable: "ProductInstances",
                        principalColumn: "InstanceID");
                });

            migrationBuilder.CreateTable(
                name: "RepairStatusHistory",
                columns: table => new
                {
                    HistoryID = table.Column<Guid>(type: "uuid", nullable: false),
                    RepairID = table.Column<Guid>(type: "uuid", nullable: false),
                    OldStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NewStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ChangedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairStatusHistory", x => x.HistoryID);
                    table.ForeignKey(
                        name: "FK_RepairStatusHistory_Repairs_RepairID",
                        column: x => x.RepairID,
                        principalTable: "Repairs",
                        principalColumn: "RepairID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesOrderDetails",
                columns: table => new
                {
                    SalesOrderDetailID = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: true),
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesOrderDetails", x => x.SalesOrderDetailID);
                    table.ForeignKey(
                        name: "FK_SalesOrderDetails_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID");
                    table.ForeignKey(
                        name: "FK_SalesOrderDetails_ProductInstances_InstanceID",
                        column: x => x.InstanceID,
                        principalTable: "ProductInstances",
                        principalColumn: "InstanceID");
                });

            migrationBuilder.CreateTable(
                name: "SalesOrders",
                columns: table => new
                {
                    SalesOrderID = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerID = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerPONumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CustomerPODate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerReference = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    QuotationID = table.Column<Guid>(type: "uuid", nullable: true),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrderType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubTotal = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    ShippingFee = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PaymentDueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaidAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    ShippingMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ShippingPartner = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TrackingNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ExpectedDeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualDeliveryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ShippingContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShippingPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ShippingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ShippingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingWard = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ShippingNotes = table.Column<string>(type: "text", nullable: true),
                    SalesPersonID = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesOrders", x => x.SalesOrderID);
                    table.ForeignKey(
                        name: "FK_SalesOrders_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockTransferDetails",
                columns: table => new
                {
                    TransferDetailID = table.Column<Guid>(type: "uuid", nullable: false),
                    TransferID = table.Column<Guid>(type: "uuid", nullable: false),
                    InstanceID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTransferDetails", x => x.TransferDetailID);
                    table.ForeignKey(
                        name: "FK_StockTransferDetails_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockTransferDetails_ProductInstances_InstanceID",
                        column: x => x.InstanceID,
                        principalTable: "ProductInstances",
                        principalColumn: "InstanceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StockTransfers",
                columns: table => new
                {
                    TransferID = table.Column<Guid>(type: "uuid", nullable: false),
                    TransferCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FromWarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    ToWarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedReceiveDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ActualReceiveDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceivedByUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTransfers", x => x.TransferID);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Avatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    LockedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginIP = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PasswordChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "UserPermission",
                columns: table => new
                {
                    UserPermissionID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermission", x => x.UserPermissionID);
                    table.ForeignKey(
                        name: "FK_UserPermission_Permission_PermissionID",
                        column: x => x.PermissionID,
                        principalTable: "Permission",
                        principalColumn: "PermissionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermission_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ManagerUserID = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.WarehouseID);
                    table.ForeignKey(
                        name: "FK_Warehouses_User_ManagerUserID",
                        column: x => x.ManagerUserID,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseStock",
                columns: table => new
                {
                    StockID = table.Column<Guid>(type: "uuid", nullable: false),
                    WarehouseID = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentID = table.Column<Guid>(type: "uuid", nullable: false),
                    VariantID = table.Column<Guid>(type: "uuid", nullable: true),
                    QuantityOnHand = table.Column<int>(type: "integer", nullable: false),
                    QuantityReserved = table.Column<int>(type: "integer", nullable: false),
                    DefaultLocationCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastStockUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastCountDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehouseStock", x => x.StockID);
                    table.ForeignKey(
                        name: "FK_WarehouseStock_ComponentVariants_VariantID",
                        column: x => x.VariantID,
                        principalTable: "ComponentVariants",
                        principalColumn: "VariantID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WarehouseStock_Components_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "Components",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WarehouseStock_Warehouses_WarehouseID",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permission",
                columns: new[] { "PermissionID", "CreatedAt", "DeletedAt", "PermissionName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("0c18c197-2d12-3bed-3985-1e63182b14c8"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("0fb70896-6350-7ea2-bf46-b85a5f299ddf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("191dc14e-f95a-64fe-bed6-0637850b83cc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Customer.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("1aaf3054-c5f8-bc0d-ea2c-7404be108302"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("1ed1dade-61f7-976a-7102-e6b9292ec6b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Warehouse.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("1f306bf9-1304-0075-31c6-0158c05ac57b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inventory.Count", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("20225e94-8984-e649-be1d-942fe782c915"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("225e1afc-cc1e-1cba-4e2c-f3f06a163944"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Warehouse.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("256d7f44-7535-b54c-0805-fa01960daae1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "AuditLog.Export", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("276901b5-0b4f-8248-f857-04c2361df30b"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Warehouse.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("2f44f9f2-8195-9a37-11aa-e9123e863ebe"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Inventory", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("2f66365a-b29b-8865-39d2-7edcaca391ee"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("2f981151-9d06-3700-a7d1-d608777c2597"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Pack", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("31875766-0906-e539-4e0e-41ce444541e0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "All.Permissions", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("34163b20-cb33-93a0-1c9d-13c1b8cc73f9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "ProductInstance.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("34bc353b-f7a8-47a1-3837-9d1bb1e6cfcf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("36f54f5f-4939-4515-61d8-b27e7e200b82"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Ship", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("41184c23-1733-9a76-e31f-bae25cf92824"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.Cancel", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("43a08ab0-6d3d-84e3-916f-44417ff1a43d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Location.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("45f359b5-5e66-0dde-362f-93377421223c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Cancel", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("473d7b43-0b58-a080-2dbd-32497333468f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Supplier.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("4a262c51-9c8f-3a09-33b6-2a2d89a088c6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "AuditLog.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("4bd328f1-05ed-33c4-84f6-a66326d8d486"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Audit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("5160b6ef-5a7f-4f8c-8f4d-2924326ee266"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Warehouse.Manage", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("533e42e4-469a-2594-10d3-85cabcd3eb7e"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Dashboard.Admin", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("5741b1e2-13e3-a447-9c44-34a852e8e3d5"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Warehouse.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("57783e72-bf4a-eba7-cc78-f115969fbfbf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Outbound", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("58f92f26-07a4-06d7-38ef-d79984a9b6f1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inventory.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("598dc7d3-798e-fe69-709d-604f1870f848"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.AssignPermission", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("5b4d90f2-f1cd-6cb1-b3d1-e9616cf641b9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Inbound", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("62406fcb-6ea8-dc1c-f390-c5820a390f3c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "ProductInstance.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("6443f715-cef8-168a-9da7-0f580757a251"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("64c3b0cf-b9d0-d9d4-7119-a942d10f3fa2"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Dashboard.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("68f698b3-20b3-cbc8-adbb-92404c967b5f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Approve", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("692f7804-5dfc-8d93-406e-aaf7391d0a96"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Location.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("70c6fc8f-3802-e66c-44e5-f0609790ecfc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Role.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("7c4799f9-e9da-c537-9b21-5e41732cd370"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("8a75ed97-5bf8-1b45-32a8-725ec240467c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "ProductInstance.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("92d2d014-b54e-24a0-4a9b-a05a70148432"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Movement", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("93455048-cc11-049a-b549-362ac4917e57"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Report.Export", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("93dce459-1669-e9b1-7e89-f1a05d5f0e63"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inventory.Adjust", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("993af303-fa66-3433-850c-74f8b3e82e4d"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Cancel", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9ad393f2-dd00-d1f1-2c1e-07eab87aeb70"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a077e65c-49b3-9c88-205e-6d8ea2d249bf"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.Approve", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a0b5f186-30dc-ed15-1b0f-29e5446c2c6e"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Role.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a18ea7b1-8384-afc4-7841-859a41e462d6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Approve", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a3d1a438-cf6f-8278-8f44-1208cbf937c6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a4bd8f32-4000-654a-c90b-3dc275e8bbda"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a8286cdf-2929-ef91-b072-2c2f7780c6fa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Supplier.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a95ad46b-783a-af2f-e4ef-5cf31f291177"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Receive", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("bbb64490-1605-147d-a90d-d824fdac98e0"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.AssignRole", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0ea8916-578a-92e7-bc1e-afea5a694bdc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c0efd1eb-d47c-6449-3f9e-4e48b29c5bd1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Customer.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c7d5e794-732c-3cc6-bcf2-c0576ef330b7"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c8a3c8e0-9179-b00e-0080-0f61c019c6d1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d03523ab-d91f-1151-3282-ae421c908c90"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Settings.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d044837b-7623-8ea4-5a53-6f29da6f2894"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d14752df-3610-7c05-4c4e-306e9eba3fed"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Supplier.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d5847abc-73f0-6a8d-57b1-139e6aaeea35"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("d76e649d-8250-d06a-5108-7fc5a2e40dfe"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.Import", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("dc11844d-1403-5509-f90b-562ce938f1a2"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ddc7ec2d-7fdb-8da5-7d38-09c513120390"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Role.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e079b87c-25c9-d813-98f0-a3275a84a07c"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "ProductInstance.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e3938353-748e-34c3-92ac-64acbe8cc467"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Supplier.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e4a1f163-1aa5-762a-5bfa-5339ff2561b1"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product.Export", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e5473e92-33c0-8406-d184-e9e51499abea"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Customer.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e61b2985-78c0-5fc3-ddf5-0b79519a4910"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inventory.Transfer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e776e0a0-caf1-90c5-cf7c-ed624c14fffa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Settings.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ec99b005-6a22-3f9e-6e27-5013e9f92fb9"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ed36947f-761b-325a-f970-cb8bbcc5d748"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("edf2816d-18a4-b147-3c41-3d14eba93be5"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Create", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("efe3e8a5-906f-35a3-f6d4-8a96a7a8d123"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outbound.Pick", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f0c8cad0-2169-e761-8166-ebe0621b42e6"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f135474d-9b29-683c-825b-454f7d1e2647"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Customer.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f149a130-8402-f611-4b56-cfa03d64c3bb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "User.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f6937a06-c0d3-bc7c-4569-5deebf252361"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Inbound.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f871a395-bde8-c353-dae9-116f8beb6e4a"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Location.Delete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("fb9781c6-91b5-f169-16fb-2687c599e80f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Transfer.Complete", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("fbabc752-ac0f-5be6-4583-33a0f5fc2585"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Role.View", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("fdb95044-03c5-e036-331a-c535f572922f"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Location.Edit", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppSettings_SettingKey",
                table: "AppSettings",
                column: "SettingKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppSettings_UpdatedByUserID",
                table: "AppSettings",
                column: "UpdatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_UploadedByUserID",
                table: "Attachments",
                column: "UploadedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserID",
                table: "AuditLogs",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_WarehouseID",
                table: "AuditLogs",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_Components_CategoryID",
                table: "Components",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_Components_SKU",
                table: "Components",
                column: "SKU",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Components_SupplierID",
                table: "Components",
                column: "SupplierID");

            migrationBuilder.CreateIndex(
                name: "IX_ComponentVariants_ComponentID",
                table: "ComponentVariants",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_ComponentVariants_PartNumber",
                table: "ComponentVariants",
                column: "PartNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerContacts_CustomerID",
                table: "CustomerContacts",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_CustomerCode",
                table: "Customers",
                column: "CustomerCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_Token",
                table: "DeviceTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTokens_UserID",
                table: "DeviceTokens",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_ComponentID",
                table: "InventoryTransactions",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_CreatedByUserID",
                table: "InventoryTransactions",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_InstanceID",
                table: "InventoryTransactions",
                column: "InstanceID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_TransactionCode",
                table: "InventoryTransactions",
                column: "TransactionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_WarehouseID",
                table: "InventoryTransactions",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedByUserID",
                table: "Payments",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CustomerID",
                table: "Payments",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentCode",
                table: "Payments",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_SupplierID",
                table: "Payments",
                column: "SupplierID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInstances_ComponentID",
                table: "ProductInstances",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInstances_IMEI1",
                table: "ProductInstances",
                column: "IMEI1",
                unique: true,
                filter: "\"IMEI1\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInstances_SerialNumber",
                table: "ProductInstances",
                column: "SerialNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductInstances_VariantID",
                table: "ProductInstances",
                column: "VariantID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductInstances_WarehouseID",
                table: "ProductInstances",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderDetails_ComponentID",
                table: "PurchaseOrderDetails",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderDetails_PurchaseOrderID",
                table: "PurchaseOrderDetails",
                column: "PurchaseOrderID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_CreatedByUserID",
                table: "PurchaseOrders",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_OrderCode",
                table: "PurchaseOrders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_SupplierID",
                table: "PurchaseOrders",
                column: "SupplierID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_WarehouseID",
                table: "PurchaseOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_RepairParts_ComponentID",
                table: "RepairParts",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_RepairParts_InstanceID",
                table: "RepairParts",
                column: "InstanceID");

            migrationBuilder.CreateIndex(
                name: "IX_RepairParts_RepairID",
                table: "RepairParts",
                column: "RepairID");

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_ComponentID",
                table: "Repairs",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_CustomerID",
                table: "Repairs",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_InstanceID",
                table: "Repairs",
                column: "InstanceID");

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_RepairCode",
                table: "Repairs",
                column: "RepairCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Repairs_TechnicianUserID",
                table: "Repairs",
                column: "TechnicianUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RepairStatusHistory_ChangedByUserID",
                table: "RepairStatusHistory",
                column: "ChangedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_RepairStatusHistory_RepairID",
                table: "RepairStatusHistory",
                column: "RepairID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrderDetails_ComponentID",
                table: "SalesOrderDetails",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrderDetails_InstanceID",
                table: "SalesOrderDetails",
                column: "InstanceID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrderDetails_SalesOrderID",
                table: "SalesOrderDetails",
                column: "SalesOrderID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_ApprovedByUserID",
                table: "SalesOrders",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_CreatedByUserID",
                table: "SalesOrders",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_CustomerID",
                table: "SalesOrders",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_OrderCode",
                table: "SalesOrders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_SalesPersonID",
                table: "SalesOrders",
                column: "SalesPersonID");

            migrationBuilder.CreateIndex(
                name: "IX_SalesOrders_WarehouseID",
                table: "SalesOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferDetails_ComponentID",
                table: "StockTransferDetails",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferDetails_InstanceID",
                table: "StockTransferDetails",
                column: "InstanceID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransferDetails_TransferID",
                table: "StockTransferDetails",
                column: "TransferID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_CreatedByUserID",
                table: "StockTransfers",
                column: "CreatedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_FromWarehouseID",
                table: "StockTransfers",
                column: "FromWarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_ReceivedByUserID",
                table: "StockTransfers",
                column: "ReceivedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_ToWarehouseID",
                table: "StockTransfers",
                column: "ToWarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_TransferCode",
                table: "StockTransfers",
                column: "TransferCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers",
                column: "SupplierCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Username",
                table: "User",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_WarehouseID",
                table: "User",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermission_PermissionID",
                table: "UserPermission",
                column: "PermissionID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermission_UserID",
                table: "UserPermission",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_ManagerUserID",
                table: "Warehouses",
                column: "ManagerUserID");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseStock_ComponentID",
                table: "WarehouseStock",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseStock_VariantID",
                table: "WarehouseStock",
                column: "VariantID");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseStock_WarehouseID_ComponentID_VariantID",
                table: "WarehouseStock",
                columns: new[] { "WarehouseID", "ComponentID", "VariantID" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppSettings_User_UpdatedByUserID",
                table: "AppSettings",
                column: "UpdatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_User_UploadedByUserID",
                table: "Attachments",
                column: "UploadedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_User_UserID",
                table: "AuditLogs",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Warehouses_WarehouseID",
                table: "AuditLogs",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID");

            migrationBuilder.AddForeignKey(
                name: "FK_DeviceTokens_User_UserID",
                table: "DeviceTokens",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_ProductInstances_InstanceID",
                table: "InventoryTransactions",
                column: "InstanceID",
                principalTable: "ProductInstances",
                principalColumn: "InstanceID");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_User_CreatedByUserID",
                table: "InventoryTransactions",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_Warehouses_WarehouseID",
                table: "InventoryTransactions",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_User_UserID",
                table: "Notifications",
                column: "UserID",
                principalTable: "User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_User_CreatedByUserID",
                table: "Payments",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductInstances_Warehouses_WarehouseID",
                table: "ProductInstances",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrderDetails_PurchaseOrders_PurchaseOrderID",
                table: "PurchaseOrderDetails",
                column: "PurchaseOrderID",
                principalTable: "PurchaseOrders",
                principalColumn: "PurchaseOrderID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_User_CreatedByUserID",
                table: "PurchaseOrders",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Warehouses_WarehouseID",
                table: "PurchaseOrders",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RepairParts_Repairs_RepairID",
                table: "RepairParts",
                column: "RepairID",
                principalTable: "Repairs",
                principalColumn: "RepairID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Repairs_User_TechnicianUserID",
                table: "Repairs",
                column: "TechnicianUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_RepairStatusHistory_User_ChangedByUserID",
                table: "RepairStatusHistory",
                column: "ChangedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrderDetails_SalesOrders_SalesOrderID",
                table: "SalesOrderDetails",
                column: "SalesOrderID",
                principalTable: "SalesOrders",
                principalColumn: "SalesOrderID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_User_ApprovedByUserID",
                table: "SalesOrders",
                column: "ApprovedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_User_CreatedByUserID",
                table: "SalesOrders",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_User_SalesPersonID",
                table: "SalesOrders",
                column: "SalesPersonID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesOrders_Warehouses_WarehouseID",
                table: "SalesOrders",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransferDetails_StockTransfers_TransferID",
                table: "StockTransferDetails",
                column: "TransferID",
                principalTable: "StockTransfers",
                principalColumn: "TransferID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransfers_User_CreatedByUserID",
                table: "StockTransfers",
                column: "CreatedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransfers_User_ReceivedByUserID",
                table: "StockTransfers",
                column: "ReceivedByUserID",
                principalTable: "User",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransfers_Warehouses_FromWarehouseID",
                table: "StockTransfers",
                column: "FromWarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockTransfers_Warehouses_ToWarehouseID",
                table: "StockTransfers",
                column: "ToWarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Warehouses_WarehouseID",
                table: "User",
                column: "WarehouseID",
                principalTable: "Warehouses",
                principalColumn: "WarehouseID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Warehouses_User_ManagerUserID",
                table: "Warehouses");

            migrationBuilder.DropTable(
                name: "AppSettings");

            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CustomerContacts");

            migrationBuilder.DropTable(
                name: "DeviceTokens");

            migrationBuilder.DropTable(
                name: "InventoryTransactions");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "PurchaseOrderDetails");

            migrationBuilder.DropTable(
                name: "RepairParts");

            migrationBuilder.DropTable(
                name: "RepairStatusHistory");

            migrationBuilder.DropTable(
                name: "SalesOrderDetails");

            migrationBuilder.DropTable(
                name: "StockTransferDetails");

            migrationBuilder.DropTable(
                name: "UserPermission");

            migrationBuilder.DropTable(
                name: "WarehouseStock");

            migrationBuilder.DropTable(
                name: "PurchaseOrders");

            migrationBuilder.DropTable(
                name: "Repairs");

            migrationBuilder.DropTable(
                name: "SalesOrders");

            migrationBuilder.DropTable(
                name: "StockTransfers");

            migrationBuilder.DropTable(
                name: "Permission");

            migrationBuilder.DropTable(
                name: "ProductInstances");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "ComponentVariants");

            migrationBuilder.DropTable(
                name: "Components");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Warehouses");
        }
    }
}

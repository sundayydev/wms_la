using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BE_WMS_LA.Core.Migrations
{
    /// <inheritdoc />
    public partial class SeedPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("0c18c197-2d12-3bed-3985-1e63182b14c8"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("0fb70896-6350-7ea2-bf46-b85a5f299ddf"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("191dc14e-f95a-64fe-bed6-0637850b83cc"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("1aaf3054-c5f8-bc0d-ea2c-7404be108302"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("1ed1dade-61f7-976a-7102-e6b9292ec6b9"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("1f306bf9-1304-0075-31c6-0158c05ac57b"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("20225e94-8984-e649-be1d-942fe782c915"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("225e1afc-cc1e-1cba-4e2c-f3f06a163944"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("256d7f44-7535-b54c-0805-fa01960daae1"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("276901b5-0b4f-8248-f857-04c2361df30b"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("2f44f9f2-8195-9a37-11aa-e9123e863ebe"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("2f66365a-b29b-8865-39d2-7edcaca391ee"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("2f981151-9d06-3700-a7d1-d608777c2597"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("31875766-0906-e539-4e0e-41ce444541e0"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("34163b20-cb33-93a0-1c9d-13c1b8cc73f9"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("34bc353b-f7a8-47a1-3837-9d1bb1e6cfcf"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("36f54f5f-4939-4515-61d8-b27e7e200b82"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("41184c23-1733-9a76-e31f-bae25cf92824"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("43a08ab0-6d3d-84e3-916f-44417ff1a43d"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("45f359b5-5e66-0dde-362f-93377421223c"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("473d7b43-0b58-a080-2dbd-32497333468f"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("4a262c51-9c8f-3a09-33b6-2a2d89a088c6"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("4bd328f1-05ed-33c4-84f6-a66326d8d486"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("5160b6ef-5a7f-4f8c-8f4d-2924326ee266"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("533e42e4-469a-2594-10d3-85cabcd3eb7e"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("5741b1e2-13e3-a447-9c44-34a852e8e3d5"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("57783e72-bf4a-eba7-cc78-f115969fbfbf"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("58f92f26-07a4-06d7-38ef-d79984a9b6f1"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("598dc7d3-798e-fe69-709d-604f1870f848"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("5b4d90f2-f1cd-6cb1-b3d1-e9616cf641b9"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("62406fcb-6ea8-dc1c-f390-c5820a390f3c"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("6443f715-cef8-168a-9da7-0f580757a251"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("64c3b0cf-b9d0-d9d4-7119-a942d10f3fa2"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("68f698b3-20b3-cbc8-adbb-92404c967b5f"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("692f7804-5dfc-8d93-406e-aaf7391d0a96"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("70c6fc8f-3802-e66c-44e5-f0609790ecfc"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("7c4799f9-e9da-c537-9b21-5e41732cd370"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("8a75ed97-5bf8-1b45-32a8-725ec240467c"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("92d2d014-b54e-24a0-4a9b-a05a70148432"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("93455048-cc11-049a-b549-362ac4917e57"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("93dce459-1669-e9b1-7e89-f1a05d5f0e63"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("993af303-fa66-3433-850c-74f8b3e82e4d"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("9ad393f2-dd00-d1f1-2c1e-07eab87aeb70"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a077e65c-49b3-9c88-205e-6d8ea2d249bf"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a0b5f186-30dc-ed15-1b0f-29e5446c2c6e"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a18ea7b1-8384-afc4-7841-859a41e462d6"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a3d1a438-cf6f-8278-8f44-1208cbf937c6"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a4bd8f32-4000-654a-c90b-3dc275e8bbda"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a8286cdf-2929-ef91-b072-2c2f7780c6fa"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("a95ad46b-783a-af2f-e4ef-5cf31f291177"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("bbb64490-1605-147d-a90d-d824fdac98e0"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("c0ea8916-578a-92e7-bc1e-afea5a694bdc"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("c0efd1eb-d47c-6449-3f9e-4e48b29c5bd1"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("c7d5e794-732c-3cc6-bcf2-c0576ef330b7"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("c8a3c8e0-9179-b00e-0080-0f61c019c6d1"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("d03523ab-d91f-1151-3282-ae421c908c90"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("d044837b-7623-8ea4-5a53-6f29da6f2894"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("d14752df-3610-7c05-4c4e-306e9eba3fed"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("d5847abc-73f0-6a8d-57b1-139e6aaeea35"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("d76e649d-8250-d06a-5108-7fc5a2e40dfe"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("dc11844d-1403-5509-f90b-562ce938f1a2"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("ddc7ec2d-7fdb-8da5-7d38-09c513120390"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e079b87c-25c9-d813-98f0-a3275a84a07c"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e3938353-748e-34c3-92ac-64acbe8cc467"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e4a1f163-1aa5-762a-5bfa-5339ff2561b1"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e5473e92-33c0-8406-d184-e9e51499abea"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e61b2985-78c0-5fc3-ddf5-0b79519a4910"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("e776e0a0-caf1-90c5-cf7c-ed624c14fffa"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("ec99b005-6a22-3f9e-6e27-5013e9f92fb9"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("ed36947f-761b-325a-f970-cb8bbcc5d748"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("edf2816d-18a4-b147-3c41-3d14eba93be5"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("efe3e8a5-906f-35a3-f6d4-8a96a7a8d123"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("f0c8cad0-2169-e761-8166-ebe0621b42e6"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("f135474d-9b29-683c-825b-454f7d1e2647"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("f149a130-8402-f611-4b56-cfa03d64c3bb"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("f6937a06-c0d3-bc7c-4569-5deebf252361"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("f871a395-bde8-c353-dae9-116f8beb6e4a"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("fb9781c6-91b5-f169-16fb-2687c599e80f"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("fbabc752-ac0f-5be6-4583-33a0f5fc2585"));

            migrationBuilder.DeleteData(
                table: "Permission",
                keyColumn: "PermissionID",
                keyValue: new Guid("fdb95044-03c5-e036-331a-c535f572922f"));
        }
    }
}

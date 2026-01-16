using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Configurations;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    #region DbSets

    // User & Permission
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<UserPermission> UserPermissions { get; set; } = null!;

    // Warehouse & Inventory
    public DbSet<Warehouse> Warehouses { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Component> Components { get; set; } = null!;
    public DbSet<ProductInstance> ProductInstances { get; set; } = null!;
    public DbSet<InventoryTransaction> InventoryTransactions { get; set; } = null!;

    // Supplier & Customer
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<CustomerContact> CustomerContacts { get; set; } = null!;

    // Purchase Orders
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
    public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = null!;
    public DbSet<PurchaseOrderHistory> PurchaseOrderHistories { get; set; } = null!;

    // Sales Orders
    public DbSet<SalesOrder> SalesOrders { get; set; } = null!;
    public DbSet<SalesOrderDetail> SalesOrderDetails { get; set; } = null!;

    // Stock Transfers
    public DbSet<StockTransfer> StockTransfers { get; set; } = null!;
    public DbSet<StockTransferDetail> StockTransferDetails { get; set; } = null!;

    // Repairs
    public DbSet<Repair> Repairs { get; set; } = null!;
    public DbSet<RepairPart> RepairParts { get; set; } = null!;
    public DbSet<RepairStatusHistory> RepairStatusHistories { get; set; } = null!;

    // Payments
    public DbSet<Payment> Payments { get; set; } = null!;

    // Notifications & Device Tokens
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<DeviceToken> DeviceTokens { get; set; } = null!;

    // System
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<Attachment> Attachments { get; set; } = null!;
    public DbSet<AppSetting> AppSettings { get; set; } = null!;

    // Component Variants & Stock
    public DbSet<ComponentVariant> ComponentVariants { get; set; } = null!;
    public DbSet<WarehouseStock> WarehouseStocks { get; set; } = null!;

    // Knowledge Base
    public DbSet<ProductKnowledgeBase> ProductKnowledgeBases { get; set; } = null!;
    public DbSet<DocumentShare> DocumentShares { get; set; } = null!;

    // Component Compatibility
    public DbSet<ComponentCompatibility> ComponentCompatibilities { get; set; } = null!;

    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =====================================================
        // User & Permission Relationships
        // =====================================================

        modelBuilder.Entity<User>()
            .HasOne(u => u.Warehouse)
            .WithMany(w => w.Users)
            .HasForeignKey(u => u.WarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserPermission>()
            .HasOne(up => up.User)
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(up => up.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPermission>()
            .HasOne(up => up.Permission)
            .WithMany(p => p.UserPermissions)
            .HasForeignKey(up => up.PermissionID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // Component & Category Relationships
        // =====================================================

        modelBuilder.Entity<Component>()
            .HasOne(c => c.Category)
            .WithMany(cat => cat.Components)
            .HasForeignKey(c => c.CategoryID)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ProductInstance>()
            .HasOne(pi => pi.Component)
            .WithMany(c => c.ProductInstances)
            .HasForeignKey(pi => pi.ComponentID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductInstance>()
            .HasOne(pi => pi.Warehouse)
            .WithMany()
            .HasForeignKey(pi => pi.WarehouseID)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ProductInstance>()
            .HasOne(pi => pi.Variant)
            .WithMany(v => v.ProductInstances)
            .HasForeignKey(pi => pi.VariantID)
            .OnDelete(DeleteBehavior.SetNull);

        // =====================================================
        // ComponentVariant Relationships
        // =====================================================

        modelBuilder.Entity<ComponentVariant>()
            .HasOne(cv => cv.Component)
            .WithMany(c => c.Variants)
            .HasForeignKey(cv => cv.ComponentID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ComponentVariant>()
            .HasIndex(cv => cv.PartNumber)
            .IsUnique();

        // =====================================================
        // Component → Supplier (Manufacturer) Relationship
        // =====================================================

        modelBuilder.Entity<Component>()
            .HasOne(c => c.Supplier)
            .WithMany(s => s.Components)
            .HasForeignKey(c => c.SupplierID)
            .OnDelete(DeleteBehavior.SetNull);

        // =====================================================
        // WarehouseStock Relationships
        // =====================================================

        modelBuilder.Entity<WarehouseStock>()
            .HasOne(ws => ws.Warehouse)
            .WithMany()
            .HasForeignKey(ws => ws.WarehouseID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WarehouseStock>()
            .HasOne(ws => ws.Component)
            .WithMany()
            .HasForeignKey(ws => ws.ComponentID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WarehouseStock>()
            .HasOne(ws => ws.Variant)
            .WithMany()
            .HasForeignKey(ws => ws.VariantID)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WarehouseStock>()
            .HasIndex(ws => new { ws.WarehouseID, ws.ComponentID, ws.VariantID })
            .IsUnique();

        // =====================================================
        // Customer Relationships
        // =====================================================

        modelBuilder.Entity<CustomerContact>()
            .HasOne(cc => cc.Customer)
            .WithMany(c => c.Contacts)
            .HasForeignKey(cc => cc.CustomerID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // Purchase Order Relationships
        // =====================================================

        modelBuilder.Entity<PurchaseOrder>()
            .HasOne(po => po.Supplier)
            .WithMany(s => s.PurchaseOrders)
            .HasForeignKey(po => po.SupplierID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrder>()
            .HasOne(po => po.Warehouse)
            .WithMany()
            .HasForeignKey(po => po.WarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrderDetail>()
            .HasOne(pod => pod.PurchaseOrder)
            .WithMany(po => po.Details)
            .HasForeignKey(pod => pod.PurchaseOrderID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseOrderHistory>()
            .HasOne(poh => poh.PurchaseOrder)
            .WithMany(po => po.History)
            .HasForeignKey(poh => poh.PurchaseOrderID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseOrderHistory>()
            .HasOne(poh => poh.PerformedByUser)
            .WithMany()
            .HasForeignKey(poh => poh.PerformedByUserID)
            .OnDelete(DeleteBehavior.SetNull);

        // =====================================================
        // Sales Order Relationships
        // =====================================================

        modelBuilder.Entity<SalesOrder>()
            .HasOne(so => so.Customer)
            .WithMany(c => c.SalesOrders)
            .HasForeignKey(so => so.CustomerID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesOrder>()
            .HasOne(so => so.Warehouse)
            .WithMany()
            .HasForeignKey(so => so.WarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesOrderDetail>()
            .HasOne(sod => sod.SalesOrder)
            .WithMany(so => so.Details)
            .HasForeignKey(sod => sod.SalesOrderID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // Stock Transfer Relationships
        // =====================================================

        modelBuilder.Entity<StockTransfer>()
            .HasOne(st => st.FromWarehouse)
            .WithMany()
            .HasForeignKey(st => st.FromWarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransfer>()
            .HasOne(st => st.ToWarehouse)
            .WithMany()
            .HasForeignKey(st => st.ToWarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransferDetail>()
            .HasOne(std => std.StockTransfer)
            .WithMany(st => st.Details)
            .HasForeignKey(std => std.TransferID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // Repair Relationships
        // =====================================================

        modelBuilder.Entity<Repair>()
            .HasOne(r => r.Customer)
            .WithMany(c => c.Repairs)
            .HasForeignKey(r => r.CustomerID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RepairPart>()
            .HasOne(rp => rp.Repair)
            .WithMany(r => r.Parts)
            .HasForeignKey(rp => rp.RepairID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RepairStatusHistory>()
            .HasOne(rsh => rsh.Repair)
            .WithMany(r => r.StatusHistory)
            .HasForeignKey(rsh => rsh.RepairID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // Payment Relationships
        // =====================================================

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Customer)
            .WithMany(c => c.Payments)
            .HasForeignKey(p => p.CustomerID)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SupplierID)
            .OnDelete(DeleteBehavior.SetNull);

        // =====================================================
        // Notification Relationships
        // =====================================================

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DeviceToken>()
            .HasOne(dt => dt.User)
            .WithMany()
            .HasForeignKey(dt => dt.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        // =====================================================
        // ProductKnowledgeBase Relationships
        // =====================================================

        modelBuilder.Entity<ProductKnowledgeBase>()
            .HasOne(kb => kb.CreatedByUser)
            .WithMany()
            .HasForeignKey(kb => kb.CreatedByUserID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductKnowledgeBase>()
            .HasOne(kb => kb.UpdatedByUser)
            .WithMany()
            .HasForeignKey(kb => kb.UpdatedByUserID)
            .OnDelete(DeleteBehavior.SetNull);

        // =====================================================
        // DocumentShare Relationships
        // =====================================================

        modelBuilder.Entity<DocumentShare>()
            .HasOne(ds => ds.KnowledgeBase)
            .WithMany(kb => kb.Shares)
            .HasForeignKey(ds => ds.KnowledgeID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentShare>()
            .HasOne(ds => ds.TargetUser)
            .WithMany()
            .HasForeignKey(ds => ds.TargetUserID)
            .OnDelete(DeleteBehavior.SetNull);

        // Index for ShareToken (used for public sharing links)
        modelBuilder.Entity<DocumentShare>()
            .HasIndex(ds => ds.ShareToken)
            .IsUnique();

        // Cấu hình bảng ComponentCompatibility
        modelBuilder.Entity<ComponentCompatibility>(entity =>
        {
            // Set khóa chính là cặp (SourceID, TargetID) để tránh trùng lặp
            entity.HasKey(e => new { e.SourceComponentID, e.TargetComponentID });

            // Cấu hình mối quan hệ chiều đi (Phụ kiện -> Thiết bị)
            entity.HasOne(e => e.SourceComponent)
                .WithMany(c => c.SupportedDevices)
                .HasForeignKey(e => e.SourceComponentID)
                .OnDelete(DeleteBehavior.Restrict); // Dùng Restrict để an toàn, tránh xóa nhầm dây chuyền

            // Cấu hình mối quan hệ chiều về (Thiết bị -> Phụ kiện)
            entity.HasOne(e => e.TargetComponent)
                .WithMany(c => c.CompatibleAccessories)
                .HasForeignKey(e => e.TargetComponentID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =====================================================
        // Unique Indexes
        // =====================================================

        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Component
        modelBuilder.Entity<Component>()
            .HasIndex(c => c.SKU)
            .IsUnique();

        // ProductInstance
        modelBuilder.Entity<ProductInstance>()
            .HasIndex(pi => pi.SerialNumber)
            .IsUnique();

        // Unique index for IMEI1 (only when not null)
        modelBuilder.Entity<ProductInstance>()
            .HasIndex(pi => pi.IMEI1)
            .IsUnique()
            .HasFilter("\"IMEI1\" IS NOT NULL");

        // Supplier
        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.SupplierCode)
            .IsUnique();

        // Customer
        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.CustomerCode)
            .IsUnique();

        // Orders
        modelBuilder.Entity<PurchaseOrder>()
            .HasIndex(po => po.OrderCode)
            .IsUnique();

        modelBuilder.Entity<SalesOrder>()
            .HasIndex(so => so.OrderCode)
            .IsUnique();

        modelBuilder.Entity<StockTransfer>()
            .HasIndex(st => st.TransferCode)
            .IsUnique();

        modelBuilder.Entity<Repair>()
            .HasIndex(r => r.RepairCode)
            .IsUnique();

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.PaymentCode)
            .IsUnique();

        modelBuilder.Entity<InventoryTransaction>()
            .HasIndex(it => it.TransactionCode)
            .IsUnique();

        // DeviceToken
        modelBuilder.Entity<DeviceToken>()
            .HasIndex(dt => dt.Token)
            .IsUnique();

        // AppSetting
        modelBuilder.Entity<AppSetting>()
            .HasIndex(s => s.SettingKey)
            .IsUnique();

        // =====================================================
        // Seed Data
        // =====================================================

        SeedPermissions(modelBuilder);
    }

    /// <summary>
    /// Seed tất cả permissions từ SystemPermissions constants vào database
    /// </summary>
    private void SeedPermissions(ModelBuilder modelBuilder)
    {
        var permissions = SystemPermissions.GetAll();
        var permissionEntities = new List<Permission>();

        // Tạo GUID cố định cho mỗi permission dựa trên tên để đảm bảo idempotent
        foreach (var permissionName in permissions)
        {
            // Sử dụng deterministic GUID để tránh tạo lại khi chạy migration
            var permissionId = GenerateDeterministicGuid(permissionName);
            permissionEntities.Add(new Permission
            {
                PermissionID = permissionId,
                PermissionName = permissionName,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        }

        modelBuilder.Entity<Permission>().HasData(permissionEntities);
    }

    /// <summary>
    /// Tạo GUID cố định dựa trên string để đảm bảo migration idempotent
    /// </summary>
    private static Guid GenerateDeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Configurations;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserPermission> UserPermissions { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<Warehouse> Warehouses { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasOne(u => u.Warehouse)
            .WithMany(w => w.Users)
            .HasForeignKey(u => u.WarehouseID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserPermission>()
            .HasOne(up => up.User)
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(up => up.UserID)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed permissions từ SystemPermissions
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
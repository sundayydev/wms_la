using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Danh sách kho hàng trong hệ thống
/// </summary>
[Table("Warehouses")]
public class Warehouse
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid WarehouseID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Tên kho (VD: Kho chính HCM, Kho chi nhánh HN)
    /// </summary>
    [Required]
    [StringLength(200)]
    public string WarehouseName { get; set; } = string.Empty;

    /// <summary>
    /// Địa chỉ chi tiết của kho
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Số điện thoại liên hệ kho
    /// </summary>
    [StringLength(20)]
    [Phone]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// FK: Người quản lý kho (User)
    /// </summary>
    public Guid? ManagerUserID { get; set; }

    /// <summary>
    /// Trạng thái hoạt động của kho
    /// </summary>
    public bool IsActive { get; set; } = true;

    #region Audit fields

    /// <summary>
    /// Thời điểm tạo bản ghi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời điểm cập nhật gần nhất
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft delete - ngày xóa (NULL = chưa xóa)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Người quản lý kho
    /// </summary>
    [ForeignKey(nameof(ManagerUserID))]
    public virtual User? Manager { get; set; }

    /// <summary>
    /// Danh sách nhân viên được gán vào kho
    /// </summary>
    public virtual ICollection<User> Users { get; set; } = new List<User>();

    #endregion
}

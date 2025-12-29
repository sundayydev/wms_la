using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Cấu hình hệ thống (lưu dạng Key-Value)
/// </summary>
[Table("AppSettings")]
public class AppSetting
{
    [Key]
    public Guid SettingID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Khóa cài đặt (VD: COMPANY_NAME, TAX_RATE, MAX_DISCOUNT)
    /// </summary>
    [Required]
    [StringLength(100)]
    public string SettingKey { get; set; } = string.Empty;

    /// <summary>
    /// Giá trị cài đặt
    /// </summary>
    public string? SettingValue { get; set; }

    /// <summary>
    /// Phân nhóm: GENERAL, INVENTORY, FINANCE, SYSTEM
    /// </summary>
    [StringLength(50)]
    public string Category { get; set; } = "GENERAL";

    /// <summary>
    /// Mô tả ý nghĩa của cài đặt
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Kiểu dữ liệu: STRING, NUMBER, BOOLEAN, JSON
    /// </summary>
    [StringLength(50)]
    public string DataType { get; set; } = "STRING";

    /// <summary>
    /// Cách hiển thị: TEXT, TEXTAREA, SWITCH, SELECT, NUMBER, PASSWORD, COLOR
    /// </summary>
    [StringLength(50)]
    public string InputType { get; set; } = "TEXT";

    /// <summary>
    /// Dữ liệu cho Dropdown (nếu InputType = SELECT)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Options { get; set; }

    /// <summary>
    /// Đánh dấu dữ liệu nhạy cảm (SMTP Pass, API Key)
    /// </summary>
    public bool IsEncrypted { get; set; } = false;

    /// <summary>
    /// True = Cài đặt hệ thống, không cho phép xóa
    /// </summary>
    public bool IsSystem { get; set; } = false;

    public Guid? UpdatedByUserID { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #region Navigation Properties

    [ForeignKey(nameof(UpdatedByUserID))]
    public virtual User? UpdatedByUser { get; set; }

    #endregion
}

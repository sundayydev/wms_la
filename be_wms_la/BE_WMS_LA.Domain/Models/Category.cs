using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Phân loại sản phẩm/linh kiện (VD: Màn hình, Pin, Mainboard, Thiết bị cầm tay)
/// </summary>
[Table("Categories")]
public class Category
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid CategoryID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Tên danh mục sản phẩm
    /// </summary>
    [Required]
    [StringLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Danh sách sản phẩm thuộc danh mục này
    /// </summary>
    public virtual ICollection<Component> Components { get; set; } = new List<Component>();

    #endregion
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Theo dõi hành trình sửa chữa chi tiết (Audit log cho quy trình sửa chữa)
/// </summary>
[Table("RepairStatusHistory")]
public class RepairStatusHistory
{
    [Key]
    public Guid HistoryID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid RepairID { get; set; }

    [StringLength(50)]
    public string? OldStatus { get; set; }

    [Required]
    [StringLength(50)]
    public string NewStatus { get; set; } = string.Empty;

    public Guid? ChangedByUserID { get; set; }

    public DateTime ChangeDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Ghi chú lý do chuyển trạng thái
    /// </summary>
    public string? Note { get; set; }

    #region Navigation Properties

    [ForeignKey(nameof(RepairID))]
    public virtual Repair Repair { get; set; } = null!;

    [ForeignKey(nameof(ChangedByUserID))]
    public virtual User? ChangedByUser { get; set; }

    #endregion
}

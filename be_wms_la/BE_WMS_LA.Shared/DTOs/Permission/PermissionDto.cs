namespace BE_WMS_LA.Shared.DTOs.Permission;

/// <summary>
/// DTO chi tiết quyền
/// </summary>
public class PermissionDto
{
    /// <summary>
    /// ID quyền
    /// </summary>
    public Guid PermissionID { get; set; }

    /// <summary>
    /// Tên quyền
    /// </summary>
    public string PermissionName { get; set; } = string.Empty;

    /// <summary>
    /// Tên module (phần trước dấu chấm)
    /// </summary>
    public string Module { get; set; } = string.Empty;

    /// <summary>
    /// Hành động (phần sau dấu chấm)
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Thời gian tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

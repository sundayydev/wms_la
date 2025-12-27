using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.User;

/// <summary>
/// DTO gán quyền cho người dùng
/// </summary>
public class AssignPermissionsDto
{
    /// <summary>
    /// ID người dùng
    /// </summary>
    [Required(ErrorMessage = "ID người dùng là bắt buộc")]
    public Guid UserID { get; set; }

    /// <summary>
    /// Danh sách ID quyền cần gán
    /// </summary>
    [Required(ErrorMessage = "Danh sách quyền là bắt buộc")]
    public List<Guid> PermissionIDs { get; set; } = new();
}

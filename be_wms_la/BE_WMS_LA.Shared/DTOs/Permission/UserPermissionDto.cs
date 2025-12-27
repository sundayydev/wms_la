namespace BE_WMS_LA.Shared.DTOs.Permission;

/// <summary>
/// DTO quyền của người dùng
/// </summary>
public class UserPermissionDto
{
    /// <summary>
    /// ID người dùng
    /// </summary>
    public Guid UserID { get; set; }

    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Danh sách quyền được gán
    /// </summary>
    public List<PermissionDto> Permissions { get; set; } = new();

    /// <summary>
    /// Có phải Admin không (có tất cả quyền)
    /// </summary>
    public bool IsAdmin { get; set; }
}

namespace BE_WMS_LA.Shared.DTOs.Permission;

/// <summary>
/// DTO nhóm quyền theo module
/// </summary>
public class PermissionGroupDto
{
    /// <summary>
    /// Tên module
    /// </summary>
    public string Module { get; set; } = string.Empty;

    /// <summary>
    /// Danh sách quyền trong module
    /// </summary>
    public List<PermissionDto> Permissions { get; set; } = new();
}

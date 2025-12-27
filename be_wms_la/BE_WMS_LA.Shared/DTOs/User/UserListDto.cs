namespace BE_WMS_LA.Shared.DTOs.User;

/// <summary>
/// DTO danh sách người dùng (rút gọn)
/// </summary>
public class UserListDto
{
    public Guid UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? WarehouseName { get; set; }
    public bool IsActive { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

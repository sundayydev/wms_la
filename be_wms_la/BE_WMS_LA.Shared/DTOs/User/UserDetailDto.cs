namespace BE_WMS_LA.Shared.DTOs.User;

/// <summary>
/// DTO chi tiết thông tin người dùng
/// </summary>
public class UserDetailDto
{
    public Guid UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? Avatar { get; set; }
    public string Role { get; set; } = string.Empty;
    public Guid? WarehouseID { get; set; }
    public string? WarehouseName { get; set; }
    public bool IsActive { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? LastLoginIP { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Danh sách quyền của người dùng
    /// </summary>
    public List<string> Permissions { get; set; } = new();
}

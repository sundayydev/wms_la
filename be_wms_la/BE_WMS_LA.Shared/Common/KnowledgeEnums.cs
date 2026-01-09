namespace BE_WMS_LA.Shared.Common;

/// <summary>
/// Loại nội dung Knowledge Base
/// </summary>
public enum KnowledgeType
{
    DOCUMENT,
    VIDEO,
    DRIVER,
    FIRMWARE
}

/// <summary>
/// Phạm vi truy cập
/// Public: Ai cũng xem được
/// Internal: Phải đăng nhập
/// </summary>
public enum AccessScope
{
    PUBLIC,
    INTERNAL
}

/// <summary>
/// Trạng thái xử lý file để preview
/// </summary>
public enum FileStatus
{
    PENDING,
    PROCESSING,
    READY,
    FAILED
}

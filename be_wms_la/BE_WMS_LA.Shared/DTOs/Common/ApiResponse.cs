namespace BE_WMS_LA.Shared.DTOs.Common;

/// <summary>
/// Response wrapper chuẩn cho API
/// </summary>
/// <typeparam name="T">Kiểu dữ liệu của Data</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Trạng thái thành công
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Thông báo
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Dữ liệu trả về
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Danh sách lỗi (nếu có)
    /// </summary>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Tạo response thành công
    /// </summary>
    public static ApiResponse<T> SuccessResponse(T data, string message = "Thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    /// <summary>
    /// Tạo response thất bại
    /// </summary>
    public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
}

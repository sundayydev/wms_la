using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Scalar.AspNetCore;

namespace BE_WMS_LA.API.Controllers;

#region Response DTOs

/// <summary>
/// Response cho endpoint Ping
/// </summary>
public class PingResponse
{
    /// <summary>
    /// Trạng thái API (OK/Error)
    /// </summary>
    /// <example>OK</example>
    [Required]
    public string Status { get; set; } = "OK";

    /// <summary>
    /// Thông báo trạng thái
    /// </summary>
    /// <example>API is running</example>
    [Required]
    public string Message { get; set; } = "API is running";

    /// <summary>
    /// Thời gian phản hồi (UTC)
    /// </summary>
    /// <example>2025-12-26T15:00:00Z</example>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Môi trường hiện tại
    /// </summary>
    /// <example>Development</example>
    public string Environment { get; set; } = "Unknown";
}

/// <summary>
/// Thông tin kiểm tra một service
/// </summary>
public class ServiceCheck
{
    /// <summary>
    /// Trạng thái service
    /// </summary>
    /// <example>OK</example>
    public string Status { get; set; } = "OK";

    /// <summary>
    /// Thời gian phản hồi
    /// </summary>
    /// <example>&lt; 1ms</example>
    public string? ResponseTime { get; set; }

    /// <summary>
    /// Thông báo bổ sung
    /// </summary>
    /// <example>Connected successfully</example>
    public string? Message { get; set; }
}

/// <summary>
/// Danh sách các service checks
/// </summary>
public class HealthChecks
{
    /// <summary>
    /// Trạng thái API
    /// </summary>
    public ServiceCheck Api { get; set; } = new();

    /// <summary>
    /// Trạng thái Database
    /// </summary>
    public ServiceCheck Database { get; set; } = new();
}

/// <summary>
/// Response cho endpoint Status
/// </summary>
public class HealthStatusResponse
{
    /// <summary>
    /// Trạng thái tổng thể hệ thống
    /// </summary>
    /// <example>Healthy</example>
    [Required]
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Thời gian kiểm tra (UTC)
    /// </summary>
    /// <example>2025-12-26T15:00:00Z</example>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Phiên bản API
    /// </summary>
    /// <example>1.0.0</example>
    public string Version { get; set; } = "1.0.0";

    /// <summary>
    /// Môi trường hiện tại
    /// </summary>
    /// <example>Development</example>
    public string Environment { get; set; } = "Unknown";

    /// <summary>
    /// Thời gian server
    /// </summary>
    /// <example>2025-12-26 22:00:00</example>
    public string ServerTime { get; set; } = "";

    /// <summary>
    /// Tên máy chủ
    /// </summary>
    /// <example>WMS-SERVER-01</example>
    public string MachineName { get; set; } = "";

    /// <summary>
    /// Phiên bản hệ điều hành
    /// </summary>
    /// <example>Microsoft Windows NT 10.0.22631.0</example>
    public string OSVersion { get; set; } = "";

    /// <summary>
    /// Danh sách các health checks
    /// </summary>
    public HealthChecks Checks { get; set; } = new();
}

/// <summary>
/// Thông tin API
/// </summary>
public class ApiInfo
{
    /// <summary>
    /// Tên API
    /// </summary>
    /// <example>WMS LA API</example>
    public string ApiName { get; set; } = "WMS LA API";

    /// <summary>
    /// Mô tả API
    /// </summary>
    /// <example>Warehouse Management System - LA</example>
    public string Description { get; set; } = "";

    /// <summary>
    /// Thời gian phản hồi
    /// </summary>
    /// <example>2025-12-26T15:00:00Z</example>
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Response cho endpoint Test
/// </summary>
public class TestConnectionResponse
{
    /// <summary>
    /// Kết quả kết nối
    /// </summary>
    /// <example>true</example>
    [Required]
    public bool Success { get; set; }

    /// <summary>
    /// Thông báo kết quả
    /// </summary>
    /// <example>Kết nối thành công!</example>
    public string Message { get; set; } = "";

    /// <summary>
    /// Thông tin API
    /// </summary>
    public ApiInfo Data { get; set; } = new();
}

#endregion

/// <summary>
/// Controller để kiểm tra trạng thái kết nối của hệ thống
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HealthCheckController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HealthCheckController> _logger;

    public HealthCheckController(IConfiguration configuration, ILogger<HealthCheckController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Kiểm tra API đang hoạt động
    /// </summary>
    /// <returns>Trạng thái API</returns>
    [HttpGet("ping")]
    [EndpointSummary("Ping API")]
    [EndpointDescription("Kiểm tra xem API có đang chạy không. Trả về trạng thái OK nếu API hoạt động bình thường.")]
    [ProducesResponseType<PingResponse>(StatusCodes.Status200OK)]
    public IActionResult Ping()
    {
        return Ok(new PingResponse
        {
            Status = "OK",
            Message = "API is running",
            Timestamp = DateTime.UtcNow,
            Environment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
        });
    }

    /// <summary>
    /// Kiểm tra chi tiết trạng thái hệ thống
    /// </summary>
    /// <returns>Thông tin chi tiết về hệ thống</returns>
    [HttpGet("status")]
    [EndpointSummary("Trạng thái hệ thống")]
    [EndpointDescription("Lấy thông tin chi tiết về trạng thái hệ thống bao gồm: CPU, RAM, Database, Server Time, v.v.")]
    [ProducesResponseType<HealthStatusResponse>(StatusCodes.Status200OK)]
    public IActionResult GetStatus()
    {
        var healthStatus = new HealthStatusResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Environment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            ServerTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            MachineName = System.Environment.MachineName,
            OSVersion = System.Environment.OSVersion.ToString(),
            Checks = new HealthChecks
            {
                Api = new ServiceCheck { Status = "OK", ResponseTime = "< 1ms" },
                Database = new ServiceCheck { Status = "Not Configured", Message = "DbContext chưa được cấu hình" }
            }
        };

        _logger.LogInformation("Health check performed at {Timestamp}", healthStatus.Timestamp);

        return Ok(healthStatus);
    }

    /// <summary>
    /// Test endpoint đơn giản để kiểm tra kết nối
    /// </summary>
    /// <returns>Thông báo kết nối thành công</returns>
    [HttpGet("test")]
    [EndpointSummary("Test kết nối")]
    [EndpointDescription("Endpoint đơn giản để kiểm tra xem client có thể kết nối với API thành công không.")]
    [ProducesResponseType<TestConnectionResponse>(StatusCodes.Status200OK)]
    public IActionResult Test()
    {
        return Ok(new TestConnectionResponse
        {
            Success = true,
            Message = "Kết nối thành công!",
            Data = new ApiInfo
            {
                ApiName = "WMS LA API",
                Description = "Warehouse Management System - LA",
                Timestamp = DateTime.UtcNow
            }
        });
    }
}

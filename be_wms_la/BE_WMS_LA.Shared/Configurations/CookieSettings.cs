namespace BE_WMS_LA.Shared.Configurations;

/// <summary>
/// Cấu hình cho Cookie Authentication
/// </summary>
public static class CookieSettings
{
    /// <summary>
    /// Tên cookie chứa Refresh Token
    /// </summary>
    public const string RefreshTokenCookieName = "X-Refresh-Token";

    /// <summary>
    /// Thời gian sống của Refresh Token (ngày)
    /// </summary>
    public const int RefreshTokenExpirationDays = 7;

    /// <summary>
    /// Path cho cookie
    /// </summary>
    public const string CookiePath = "/api";
}

using BE_WMS_LA.Core.Configurations;
using System.IdentityModel.Tokens.Jwt;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using StackExchange.Redis;
using System.Text;

// 1. Load biến môi trường
Env.Load(); // tự động đọc .env trong thư mục chạy

var builder = WebApplication.CreateBuilder(args);

// --- CẤU HÌNH POSTGRESQL ---
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
    options.UseNpgsql(conn);
});

// --- CẤU HÌNH REDIS (Singleton) ---
var redisConnectionString = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    // Đăng ký IConnectionMultiplexer là Singleton
    builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    {
        var configuration = ConfigurationOptions.Parse(redisConnectionString, true);
        return ConnectionMultiplexer.Connect(configuration);
    });
}

// --- ĐĂNG KÝ REPOSITORIES ---
builder.Services.AddScoped<BE_WMS_LA.Core.Repositories.UserRepository>();

// --- ĐĂNG KÝ SERVICES ---
builder.Services.AddScoped<BE_WMS_LA.Core.Services.AuthService>();
builder.Services.AddScoped<BE_WMS_LA.Core.Services.UserService>();
builder.Services.AddScoped<BE_WMS_LA.Core.Services.PermissionService>();
builder.Services.AddScoped<BE_WMS_LA.Core.Services.SupplierService>();

// --- CẤU HÌNH JWT SETTINGS ---
// Thêm section JwtSettings vào IConfiguration để AuthService có thể đọc
builder.Configuration["JwtSettings:SecretKey"] = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? "Key_Tam_Thoi_Rat_Dai_Cho_Dev_Moi_Truong_Test_123456789";
builder.Configuration["JwtSettings:Issuer"] = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "WmsApi";
builder.Configuration["JwtSettings:Audience"] = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "WmsClient";
builder.Configuration["JwtSettings:AccessTokenExpirationMinutes"] = Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_EXPIRATION") ?? "5";

// --- CẤU HÌNH SERVICES ---

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
if (string.IsNullOrEmpty(jwtKey))
{
    Console.WriteLine("CẢNH BÁO: Dùng Key tạm thời do thiếu .env");
    jwtKey = "Key_Tam_Thoi_Rat_Dai_Cho_Dev_Moi_Truong_Test_123456789";
}

var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "WmsApi";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "WmsClient";

builder.Services.AddCors(options =>
{
    // Policy cho development - cho phép credentials với origins cụ thể
    options.AddPolicy("AllowCredentials", p =>
        p.SetIsOriginAllowed(origin =>
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                return false;
            return uri.Port == 5173;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()); // Quan trọng: cho phép cookies

    // Policy cho các request không cần credentials
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero // Không cho phép thời gian lệch
    };

    // --- DEBUG JWT EVENTS ---
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"JWT Authentication Failed: {context.Exception.Message}");
            Console.WriteLine($"Exception Type: {context.Exception.GetType().Name}");
            if (context.Exception.InnerException != null)
            {
                Console.WriteLine($"   Inner Exception: {context.Exception.InnerException.Message}");
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"JWT Token Validated for: {context.Principal?.Identity?.Name}");
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
            Console.WriteLine($"   Claims: {string.Join(", ", claims ?? Array.Empty<string>())}");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault();
            Console.WriteLine($"JWT Message Received - Authorization Header: {(string.IsNullOrEmpty(token) ? "MISSING" : token.Substring(0, Math.Min(50, token.Length)) + "...")}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"JWT Challenge - Error: {context.Error}, Description: {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();

// --- CẤU HÌNH OPENAPI (THEO CHUẨN MỚI 3.1.1) ---
builder.Services.AddOpenApi(options =>
{
    // Document Transformer - cấu hình thông tin API và security schemes
    _ = options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        // 1. Thông tin API
        document.Info = new OpenApiInfo
        {
            Title = "WMS LA API",
            Version = "1.0.0",
            Description = "WMS LA API - Warehouse Management System",
            Summary = "WMS LA API theo chuẩn Microsoft.OpenApi 3.1.1 - .NET 10",
            Contact = new OpenApiContact
            {
                Name = "WMS LA Team",
                Email = "sundayy.dev@gmail.com",
            },
            License = new OpenApiLicense
            {
                Name = "WMS LA License",
                Url = new Uri("https://wmsla.com"),
            },
            TermsOfService = new Uri("https://wmsla.com")
        };

        // 2. Setup Servers
        document.Servers = new List<OpenApiServer>
        {
            new OpenApiServer { Url = "http://localhost:5023" }
        };

        // 3. Security (JWT Bearer)
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

        if (!document.Components.SecuritySchemes.ContainsKey("BearerAuth"))
        {
            document.Components.SecuritySchemes.Add("BearerAuth", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Nhập JWT token (không cần prefix 'Bearer '). Ví dụ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            });
        }

        // 4. Setup API Paths
        document.Paths ??= new OpenApiPaths();

        return Task.CompletedTask;
    });

    // Operation Transformer - thêm security requirement cho các endpoint có [Authorize]
    _ = options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        // Kiểm tra xem endpoint có yêu cầu authorization không
        var authorizeAttributes = context.Description.ActionDescriptor.EndpointMetadata
            .OfType<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>();

        var allowAnonymousAttributes = context.Description.ActionDescriptor.EndpointMetadata
            .OfType<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>();

        // Nếu có [Authorize] và không có [AllowAnonymous]
        if (authorizeAttributes.Any() && !allowAnonymousAttributes.Any())
        {
            operation.Security ??= new List<OpenApiSecurityRequirement>();

            // Tạo security requirement với reference đến BearerAuth scheme
            var securityRequirement = new OpenApiSecurityRequirement();
            var securitySchemeRef = new OpenApiSecuritySchemeReference("BearerAuth");
            securityRequirement.Add(securitySchemeRef, new List<string>());

            operation.Security.Add(securityRequirement);
        }

        return Task.CompletedTask;
    });
});

var app = builder.Build();

// --- PIPELINE ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("WMS LA API Docs")
        .WithTheme(ScalarTheme.Kepler)
        .WithSearchHotKey("k")
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
        .WithBundleUrl("https://cdn.jsdelivr.net/npm/@scalar/api-reference")
        // Cấu hình JWT Bearer Authentication cho Scalar
        .AddPreferredSecuritySchemes("BearerAuth");
    });
}

//app.UseHttpsRedirection();
app.UseCors("AllowCredentials"); // Sử dụng policy hỗ trợ credentials (cookies)
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
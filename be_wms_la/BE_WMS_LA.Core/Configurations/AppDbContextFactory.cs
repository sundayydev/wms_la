using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BE_WMS_LA.Core.Configurations;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // 1. Xác định đường dẫn tới API project
        var basePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "..",
            "BE_WMS_LA.API"
        );

        // Fallback nếu chạy từ solution root
        if (!Directory.Exists(basePath))
        {
            basePath = Directory.GetCurrentDirectory();
            var apiPath = Path.Combine(basePath, "BE_WMS_LA.API");
            if (Directory.Exists(apiPath))
                basePath = apiPath;
        }

        // 2. Load .env
        var envPath = Path.Combine(basePath, ".env");
        if (!File.Exists(envPath))
        {
            throw new InvalidOperationException($".env not found at: {envPath}");
        }

        DotNetEnv.Env.Load(envPath);

        // 3. Lấy connection string
        var connectionString =
            Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Environment variable 'DB_CONNECTION_STRING' is not set."
            );
        }

        // 4. Build DbContextOptions
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseNpgsql(
            connectionString,
            b =>
            {
                // Migration nằm trong Core (đúng kiến trúc)
                b.MigrationsAssembly("BE_WMS_LA.Core");
            });

        return new AppDbContext(optionsBuilder.Options);
    }
}

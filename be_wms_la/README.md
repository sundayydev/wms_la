# BE_WMS_LA Project

Backend API for Warehouse Management System.

## Project Structure

```
be_wms_la
├── BE_WMS_LA.API           # API Layer
│   ├── Controllers         # API Controllers
│   └── Program.cs          # Entry point
│
├── BE_WMS_LA.Core          # Core Business Logic & Data Access
│   ├── Configurations      # DB Context & Configuration
│   ├── Migrations          # EF Core Migrations
│   ├── Repositories        # Data Access Repositories
│   └── Services            # Business Services
│
├── BE_WMS_LA.Domain        # Domain Entities
│   ├── Constants           # Domain Constants
│   └── Models              # Database Models/Entities
│
├── BE_WMS_LA.Shared        # Shared Resources
│   ├── Common              # Common Utilities
│   ├── Configurations      # Shared Configs
│   └── DTOs                # Data Transfer Objects
│
└── BE_WMS_LA.Test          # Testing Project
```

## Database Migration Commands

# Thêm migration mới
```dotnet ef migrations add <TenMigration> --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```

# Apply migration vào database
```dotnet ef database update --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```

# Xóa migration cuối
```dotnet ef migrations remove --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```

# Thêm migration mới
```dotnet ef migrations add <TenMigration> --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```

# Apply migration vào database
```dotnet ef database update --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```

# Xóa migration cuối
```dotnet ef migrations remove --project BE_WMS_LA.Core --startup-project BE_WMS_LA.API```
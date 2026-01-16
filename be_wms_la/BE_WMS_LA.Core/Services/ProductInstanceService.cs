using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.ProductInstance;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý ProductInstance - xử lý business logic
/// </summary>
public class ProductInstanceService
{
    private readonly InventoryRepository _repository;

    public ProductInstanceService(InventoryRepository repository)
    {
        _repository = repository;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách ProductInstance có phân trang và lọc
    /// </summary>
    public async Task<ApiResponse<List<ProductInstanceListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? componentId = null,
        Guid? warehouseId = null,
        string? status = null)
    {
        var instances = await _repository.GetAllAsync(search, componentId, warehouseId, status);
        var totalItems = instances.Count;

        var result = instances
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToListDto)
            .ToList();

        return ApiResponse<List<ProductInstanceListDto>>.SuccessResponse(result, $"Lấy danh sách thành công ({totalItems} kết quả)");
    }

    /// <summary>
    /// Lấy chi tiết Product Instance
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> GetByIdAsync(Guid id)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        var dto = MapToDetailDto(instance);
        return ApiResponse<ProductInstanceDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Lấy theo Serial Number
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> GetBySerialAsync(string serialNumber)
    {
        var instance = await _repository.GetBySerialAsync(serialNumber);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy sản phẩm với Serial này");
        }

        var dto = MapToDetailDto(instance);
        return ApiResponse<ProductInstanceDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Cập nhật ProductInstance
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> UpdateAsync(Guid id, UpdateProductInstanceDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        // Update fields
        if (dto.WarehouseID.HasValue) instance.WarehouseID = dto.WarehouseID;
        if (dto.LocationCode != null) instance.LocationCode = dto.LocationCode;
        if (dto.Zone != null) instance.Zone = dto.Zone;
        if (dto.Status != null) instance.Status = dto.Status;
        if (dto.ActualImportPrice.HasValue) instance.ActualImportPrice = dto.ActualImportPrice;
        if (dto.ActualSellPrice.HasValue) instance.ActualSellPrice = dto.ActualSellPrice;
        if (dto.Notes != null) instance.Notes = dto.Notes;

        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Cập nhật trạng thái
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> UpdateStatusAsync(Guid id, UpdateProductInstanceStatusDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        instance.Status = dto.Status;
        if (!string.IsNullOrEmpty(dto.Notes))
        {
            instance.Notes = dto.Notes;
        }

        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Xóa ProductInstance
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        if (instance.Status == "SOLD")
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa sản phẩm đã bán");
        }

        await _repository.SoftDeleteAsync(id);
        return ApiResponse<bool>.SuccessResponse(true, "Xóa sản phẩm thành công");
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê ProductInstance
    /// </summary>
    public async Task<ApiResponse<ProductInstanceStatisticsDto>> GetStatisticsAsync()
    {
        var stats = new ProductInstanceStatisticsDto
        {
            TotalInstances = await _repository.CountAsync(),
            InStock = await _repository.CountByStatusAsync("IN_STOCK"),
            Sold = await _repository.CountByStatusAsync("SOLD"),
            UnderWarranty = await _repository.CountByStatusAsync("WARRANTY"),
            InRepair = await _repository.CountByStatusAsync("REPAIR"),
            Broken = await _repository.CountByStatusAsync("BROKEN"),
            TotalInventoryValue = await _repository.GetTotalImportValueAsync(),
            TotalSoldValue = await _repository.GetTotalSoldValueAsync(),
            TotalProfit = await _repository.GetTotalSoldValueAsync() - await _repository.GetTotalImportValueAsync()
        };

        return ApiResponse<ProductInstanceStatisticsDto>.SuccessResponse(stats);
    }

    #endregion

    #region Private Helpers

    private static ProductInstanceListDto MapToListDto(ProductInstance instance)
    {
        return new ProductInstanceListDto
        {
            InstanceID = instance.InstanceID,
            SerialNumber = instance.SerialNumber,
            ComponentID = instance.ComponentID,
            ComponentSKU = instance.Component.SKU,
            ComponentName = instance.Component.ComponentName,
            ImageURL = instance.Component.ImageURL,
            VariantID = instance.VariantID,
            PartNumber = instance.Variant?.PartNumber,
            VariantName = instance.Variant?.VariantName,
            WarehouseID = instance.WarehouseID,
            WarehouseName = instance.Warehouse?.WarehouseName,
            LocationCode = instance.LocationCode,
            Zone = instance.Zone,
            Status = instance.Status,
            CurrentOwnerType = instance.CurrentOwnerType,
            IMEI1 = instance.IMEI1,
            IMEI2 = instance.IMEI2,
            MACAddress = instance.MACAddress,
            ActualImportPrice = instance.ActualImportPrice,
            ActualSellPrice = instance.ActualSellPrice,
            ImportDate = instance.ImportDate,
            SoldDate = instance.SoldDate,
            WarrantyStartDate = instance.WarrantyStartDate,
            WarrantyEndDate = instance.WarrantyEndDate,
            WarrantyMonths = instance.WarrantyMonths,
            TotalRepairCount = instance.TotalRepairCount,
            LastRepairDate = instance.LastRepairDate,
            CreatedAt = instance.CreatedAt
        };
    }

    private static ProductInstanceDetailDto MapToDetailDto(ProductInstance instance)
    {
        var isUnderWarranty = instance.WarrantyEndDate.HasValue && instance.WarrantyEndDate.Value > DateTime.UtcNow;
        var warrantyDaysRemaining = isUnderWarranty
            ? (int?)(instance.WarrantyEndDate!.Value - DateTime.UtcNow).Days
            : null;

        return new ProductInstanceDetailDto
        {
            InstanceID = instance.InstanceID,
            SerialNumber = instance.SerialNumber,
            ModelNumber = instance.ModelNumber,
            InboundBoxNumber = instance.InboundBoxNumber,
            ComponentID = instance.ComponentID,
            ComponentSKU = instance.Component.SKU,
            ComponentName = instance.Component.ComponentName,
            ComponentDescription = instance.Component.FullDescription,
            ImageURL = instance.Component.ImageURL,
            IsSerialized = instance.Component.IsSerialized,
            VariantID = instance.VariantID,
            PartNumber = instance.Variant?.PartNumber,
            VariantName = instance.Variant?.VariantName,
            VariantDescription = instance.Variant?.VariantDescription,
            WarehouseID = instance.WarehouseID,
            WarehouseName = instance.Warehouse?.WarehouseName,
            LocationCode = instance.LocationCode,
            Zone = instance.Zone,
            Status = instance.Status,
            CurrentOwnerType = instance.CurrentOwnerType,
            CurrentOwnerID = instance.CurrentOwnerID,
            IMEI1 = instance.IMEI1,
            IMEI2 = instance.IMEI2,
            MACAddress = instance.MACAddress,
            WarrantyStartDate = instance.WarrantyStartDate,
            WarrantyEndDate = instance.WarrantyEndDate,
            WarrantyMonths = instance.WarrantyMonths,
            IsUnderWarranty = isUnderWarranty,
            WarrantyDaysRemaining = warrantyDaysRemaining,
            TotalRepairCount = instance.TotalRepairCount,
            LastRepairDate = instance.LastRepairDate,
            ActualImportPrice = instance.ActualImportPrice,
            ActualSellPrice = instance.ActualSellPrice,
            ProfitAmount = instance.ActualSellPrice.HasValue && instance.ActualImportPrice.HasValue
                ? instance.ActualSellPrice.Value - instance.ActualImportPrice.Value
                : null,
            ImportDate = instance.ImportDate,
            SoldDate = instance.SoldDate,
            SoldToCustomerID = instance.SoldToCustomerID,
            Notes = instance.Notes,
            CreatedAt = instance.CreatedAt,
            UpdatedAt = instance.UpdatedAt
        };
    }

    #endregion

    #region History

    /// <summary>
    /// Lấy lịch sử vòng đời của ProductInstance
    /// Tổng hợp từ: InventoryTransactions, PurchaseOrders, SalesOrders, Repairs, StockTransfers
    /// </summary>
    public async Task<ApiResponse<ProductInstanceHistoryResponseDto>> GetInstanceHistoryAsync(Guid instanceId)
    {
        // 1. Lấy thông tin ProductInstance
        var instance = await _repository.GetByIdAsync(instanceId);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceHistoryResponseDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        var events = new List<ProductInstanceLifecycleEventDto>();

        // 2. Lấy lịch sử từ InventoryTransactions
        var transactions = await _repository.GetTransactionsByInstanceIdAsync(instanceId);
        foreach (var trans in transactions)
        {
            var eventType = trans.TransactionType switch
            {
                "IMPORT" => ProductInstanceEventType.IMPORTED,
                "EXPORT" => ProductInstanceEventType.EXPORTED,
                "TRANSFER" => trans.Quantity > 0 ? ProductInstanceEventType.TRANSFER_IN : ProductInstanceEventType.TRANSFER_OUT,
                _ => "TRANSACTION"
            };

            var iconType = trans.TransactionType switch
            {
                "IMPORT" => "IMPORT",
                "EXPORT" => "EXPORT",
                "TRANSFER" => "TRANSFER",
                _ => "DEFAULT"
            };

            var colorType = trans.TransactionType switch
            {
                "IMPORT" => "success",
                "EXPORT" => "warning",
                "TRANSFER" => "info",
                _ => "default"
            };

            events.Add(new ProductInstanceLifecycleEventDto
            {
                EventID = trans.TransactionID,
                EventType = eventType,
                EventDate = trans.TransactionDate,
                Title = GetTransactionTitle(trans.TransactionType),
                Description = trans.Notes ?? $"{trans.TransactionType} - {trans.TransactionCode}",
                NewWarehouseID = trans.WarehouseID,
                NewWarehouseName = trans.Warehouse?.WarehouseName,
                PerformedByUserID = trans.CreatedByUserID,
                PerformedByUserName = trans.CreatedByUser?.FullName,
                ReferenceCode = trans.TransactionCode,
                ReferenceType = trans.TransactionType,
                ReferenceID = trans.ReferenceID,
                IconType = iconType,
                ColorType = colorType
            });
        }

        // 3. Lấy lịch sử từ bảng Repairs (nếu có)
        var repairs = await _repository.GetRepairsByInstanceIdAsync(instanceId);
        foreach (var repair in repairs)
        {
            // Repair Started
            events.Add(new ProductInstanceLifecycleEventDto
            {
                EventID = repair.RepairID,
                EventType = repair.WarrantyType == "IN_WARRANTY" ? ProductInstanceEventType.WARRANTY_CLAIMED : ProductInstanceEventType.REPAIR_STARTED,
                EventDate = repair.RepairDate,
                Title = repair.WarrantyType == "IN_WARRANTY" ? "Tiếp nhận bảo hành" : "Bắt đầu sửa chữa",
                Description = $"{repair.ProblemDescription} - {repair.RepairCode}",
                PerformedByUserID = repair.TechnicianUserID,
                PerformedByUserName = repair.Technician?.FullName,
                ReferenceCode = repair.RepairCode,
                ReferenceType = "REPAIR",
                ReferenceID = repair.RepairID,
                IconType = "REPAIR",
                ColorType = "warning",
                Metadata = $"{{\"cost\":{repair.TotalCost},\"status\":\"{repair.Status}\"}}"
            });

            // Repair Completed
            if (repair.ActualCompletionDate.HasValue)
            {
                events.Add(new ProductInstanceLifecycleEventDto
                {
                    EventID = Guid.NewGuid(),
                    EventType = repair.WarrantyType == "IN_WARRANTY" ? ProductInstanceEventType.WARRANTY_COMPLETED : ProductInstanceEventType.REPAIR_COMPLETED,
                    EventDate = repair.ActualCompletionDate.Value.ToDateTime(TimeOnly.MinValue),
                    Title = repair.WarrantyType == "IN_WARRANTY" ? "Hoàn thành bảo hành" : "Hoàn thành sửa chữa",
                    Description = $"Đã hoàn thành - {repair.RepairCode}",
                    PerformedByUserID = repair.TechnicianUserID,
                    PerformedByUserName = repair.Technician?.FullName,
                    ReferenceCode = repair.RepairCode,
                    ReferenceType = "REPAIR",
                    ReferenceID = repair.RepairID,
                    IconType = "REPAIR",
                    ColorType = "success"
                });
            }
        }

        // 4. Event CREATED
        events.Add(new ProductInstanceLifecycleEventDto
        {
            EventID = instance.InstanceID,
            EventType = ProductInstanceEventType.CREATED,
            EventDate = instance.CreatedAt,
            Title = "Tạo mới sản phẩm",
            Description = $"Sản phẩm {instance.SerialNumber} được tạo trong hệ thống",
            IconType = "CREATE",
            ColorType = "default"
        });

        // 5. Event SOLD (nếu đã bán)
        if (instance.SoldDate.HasValue)
        {
            events.Add(new ProductInstanceLifecycleEventDto
            {
                EventID = Guid.NewGuid(),
                EventType = ProductInstanceEventType.SOLD,
                EventDate = instance.SoldDate.Value,
                Title = "Bán hàng",
                Description = instance.ActualSellPrice.HasValue
                    ? $"Đã bán với giá {instance.ActualSellPrice:N0} VNĐ"
                    : "Đã bán cho khách hàng",
                NewStatus = "SOLD",
                PerformedByUserID = null, // Có thể lấy từ SalesOrder nếu có
                ReferenceType = "SALES_ORDER",
                ReferenceID = instance.SoldToCustomerID,
                IconType = "SOLD",
                ColorType = "success",
                Metadata = instance.ActualSellPrice.HasValue
                    ? $"{{\"price\":{instance.ActualSellPrice}}}"
                    : null
            });
        }

        // 6. Sắp xếp theo thời gian giảm dần (mới nhất trước)
        events = events.OrderByDescending(e => e.EventDate).ToList();

        // 7. Tạo response
        var response = new ProductInstanceHistoryResponseDto
        {
            InstanceID = instance.InstanceID,
            SerialNumber = instance.SerialNumber,
            ComponentName = instance.Component.ComponentName,
            CurrentStatus = instance.Status,
            Events = events,
            TotalEvents = events.Count,
            CreatedAt = instance.CreatedAt
        };

        return ApiResponse<ProductInstanceHistoryResponseDto>.SuccessResponse(
            response,
            $"Lấy lịch sử thành công ({events.Count} sự kiện)"
        );
    }

    private string GetTransactionTitle(string transactionType)
    {
        return transactionType switch
        {
            "IMPORT" => "Nhập kho",
            "EXPORT" => "Xuất kho",
            "TRANSFER" => "Chuyển kho",
            "ADJUSTMENT" => "Điều chỉnh",
            _ => transactionType
        };
    }

    #endregion
}

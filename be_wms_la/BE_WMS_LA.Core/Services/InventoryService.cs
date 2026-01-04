using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Inventory;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý tồn kho theo Serial/IMEI - xử lý business logic
/// </summary>
public class InventoryService
{
    private readonly InventoryRepository _repository;

    public InventoryService(InventoryRepository repository)
    {
        _repository = repository;
    }

    #region ProductInstance CRUD

    /// <summary>
    /// Lấy danh sách tồn kho có phân trang và lọc
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
    /// Lấy chi tiết ProductInstance
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> GetByIdAsync(Guid id)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        var dto = await MapToDetailDtoAsync(instance);
        return ApiResponse<ProductInstanceDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tìm theo Serial Number
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> GetBySerialAsync(string serial)
    {
        var instance = await _repository.GetBySerialAsync(serial);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        var dto = await MapToDetailDtoAsync(instance);
        return ApiResponse<ProductInstanceDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Nhập hàng mới (tạo ProductInstance)
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> CreateAsync(CreateProductInstanceDto dto)
    {
        // Kiểm tra component
        var component = await _repository.GetComponentAsync(dto.ComponentID);
        if (component == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Sản phẩm không tồn tại");
        }

        // Kiểm tra warehouse
        if (!await _repository.WarehouseExistsAsync(dto.WarehouseID))
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Kho không tồn tại");
        }

        // Kiểm tra variant nếu có
        if (dto.VariantID.HasValue)
        {
            if (!await _repository.VariantExistsAsync(dto.VariantID.Value))
            {
                return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Biến thể không tồn tại");
            }
        }

        // Kiểm tra serial trùng
        if (await _repository.ExistsBySerialAsync(dto.SerialNumber))
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Số Serial đã tồn tại trong hệ thống");
        }

        // Kiểm tra IMEI trùng
        if (!string.IsNullOrEmpty(dto.IMEI1))
        {
            if (await _repository.ExistsByImeiAsync(dto.IMEI1))
            {
                return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("IMEI đã tồn tại trong hệ thống");
            }
        }

        var importDate = dto.ImportDate ?? DateTime.UtcNow;
        var warrantyMonths = dto.WarrantyMonths > 0 ? dto.WarrantyMonths : component.DefaultWarrantyMonths;

        var instance = new ProductInstance
        {
            InstanceID = Guid.NewGuid(),
            ComponentID = dto.ComponentID,
            VariantID = dto.VariantID,
            WarehouseID = dto.WarehouseID,
            SerialNumber = dto.SerialNumber,
            ModelNumber = dto.ModelNumber,
            InboundBoxNumber = dto.InboundBoxNumber,
            IMEI1 = dto.IMEI1,
            IMEI2 = dto.IMEI2,
            MACAddress = dto.MACAddress,
            Status = "IN_STOCK",
            LocationCode = dto.LocationCode,
            Zone = dto.Zone,
            CurrentOwnerType = "COMPANY",
            WarrantyStartDate = importDate,
            WarrantyEndDate = importDate.AddMonths(warrantyMonths),
            WarrantyMonths = warrantyMonths,
            ActualImportPrice = dto.ActualImportPrice ?? component.BasePrice,
            ImportDate = importDate,
            Notes = dto.Notes
        };

        await _repository.AddAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Nhập hàng nhiều serial cùng lúc
    /// </summary>
    public async Task<ApiResponse<List<ProductInstanceListDto>>> BulkCreateAsync(BulkCreateProductInstanceDto dto)
    {
        // Kiểm tra component
        var component = await _repository.GetComponentAsync(dto.ComponentID);
        if (component == null)
        {
            return ApiResponse<List<ProductInstanceListDto>>.ErrorResponse("Sản phẩm không tồn tại");
        }

        // Kiểm tra warehouse
        var warehouse = await _repository.GetWarehouseAsync(dto.WarehouseID);
        if (warehouse == null)
        {
            return ApiResponse<List<ProductInstanceListDto>>.ErrorResponse("Kho không tồn tại");
        }

        // Kiểm tra serial trùng
        var existingSerials = await _repository.GetExistingSerialsAsync(dto.SerialNumbers);
        if (existingSerials.Any())
        {
            return ApiResponse<List<ProductInstanceListDto>>.ErrorResponse(
                $"Các serial đã tồn tại: {string.Join(", ", existingSerials)}");
        }

        var importDate = DateTime.UtcNow;
        var warrantyMonths = dto.WarrantyMonths > 0 ? dto.WarrantyMonths : component.DefaultWarrantyMonths;
        var createdInstances = new List<ProductInstance>();

        foreach (var serial in dto.SerialNumbers)
        {
            var instance = new ProductInstance
            {
                InstanceID = Guid.NewGuid(),
                ComponentID = dto.ComponentID,
                VariantID = dto.VariantID,
                WarehouseID = dto.WarehouseID,
                SerialNumber = serial.Trim(),
                InboundBoxNumber = dto.InboundBoxNumber,
                Status = "IN_STOCK",
                LocationCode = dto.LocationCode,
                CurrentOwnerType = "COMPANY",
                WarrantyStartDate = importDate,
                WarrantyEndDate = importDate.AddMonths(warrantyMonths),
                WarrantyMonths = warrantyMonths,
                ActualImportPrice = dto.ActualImportPrice ?? component.BasePrice,
                ImportDate = importDate,
                Notes = dto.Notes
            };
            createdInstances.Add(instance);
        }

        await _repository.AddRangeAsync(createdInstances);

        var result = createdInstances.Select(pi => new ProductInstanceListDto
        {
            InstanceID = pi.InstanceID,
            ComponentID = pi.ComponentID,
            ComponentSKU = component.SKU,
            ComponentName = component.ComponentName,
            ImageURL = component.ImageURL,
            VariantID = pi.VariantID,
            SerialNumber = pi.SerialNumber,
            WarehouseID = pi.WarehouseID,
            WarehouseName = warehouse.WarehouseName,
            LocationCode = pi.LocationCode,
            Status = pi.Status,
            CurrentOwnerType = pi.CurrentOwnerType,
            WarrantyEndDate = pi.WarrantyEndDate,
            ActualImportPrice = pi.ActualImportPrice,
            ImportDate = pi.ImportDate
        }).ToList();

        return ApiResponse<List<ProductInstanceListDto>>.SuccessResponse(result, $"Đã nhập {result.Count} thiết bị");
    }

    /// <summary>
    /// Cập nhật ProductInstance
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> UpdateAsync(Guid id, UpdateProductInstanceDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        // Cập nhật các trường
        if (dto.WarehouseID.HasValue) instance.WarehouseID = dto.WarehouseID;
        if (dto.LocationCode != null) instance.LocationCode = dto.LocationCode;
        if (dto.Zone != null) instance.Zone = dto.Zone;
        if (dto.IMEI1 != null) instance.IMEI1 = dto.IMEI1;
        if (dto.IMEI2 != null) instance.IMEI2 = dto.IMEI2;
        if (dto.MACAddress != null) instance.MACAddress = dto.MACAddress;
        if (dto.Notes != null) instance.Notes = dto.Notes;

        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Cập nhật trạng thái
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> UpdateStatusAsync(Guid id, UpdateInstanceStatusDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        // Validate status
        var validStatuses = new[] { "IN_STOCK", "SOLD", "WARRANTY", "REPAIR", "BROKEN", "TRANSFERRING", "DEMO", "SCRAPPED", "LOST" };
        if (!validStatuses.Contains(dto.Status))
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse($"Trạng thái không hợp lệ. Các trạng thái hợp lệ: {string.Join(", ", validStatuses)}");
        }

        instance.Status = dto.Status;
        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Bán hàng (chuyển sở hữu cho khách)
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> SellAsync(Guid id, SellInstanceDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        if (instance.Status != "IN_STOCK")
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Chỉ có thể bán thiết bị đang trong kho");
        }

        // Kiểm tra customer
        var customer = await _repository.GetCustomerAsync(dto.CustomerID);
        if (customer == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Khách hàng không tồn tại");
        }

        instance.Status = "SOLD";
        instance.CurrentOwnerType = "CUSTOMER";
        instance.CurrentOwnerID = dto.CustomerID;
        instance.SoldToCustomerID = dto.CustomerID;
        instance.SoldDate = dto.SoldDate ?? DateTime.UtcNow;
        instance.ActualSellPrice = dto.ActualSellPrice;
        instance.WarehouseID = null; // Đã xuất khỏi kho

        // Reset warranty start date when sold
        instance.WarrantyStartDate = instance.SoldDate;
        instance.WarrantyEndDate = instance.SoldDate.Value.AddMonths(instance.WarrantyMonths);

        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Chuyển kho
    /// </summary>
    public async Task<ApiResponse<ProductInstanceDetailDto>> TransferAsync(Guid id, TransferInstanceDto dto)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Không tìm thấy thiết bị");
        }

        // Kiểm tra kho đích
        var targetWarehouse = await _repository.GetWarehouseAsync(dto.ToWarehouseID);
        if (targetWarehouse == null)
        {
            return ApiResponse<ProductInstanceDetailDto>.ErrorResponse("Kho đích không tồn tại");
        }

        instance.WarehouseID = dto.ToWarehouseID;
        instance.LocationCode = dto.NewLocationCode;
        await _repository.UpdateAsync(instance);
        return await GetByIdAsync(instance.InstanceID);
    }

    /// <summary>
    /// Xóa ProductInstance (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var instance = await _repository.GetByIdAsync(id);
        if (instance == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy thiết bị");
        }

        if (instance.Status == "SOLD")
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa thiết bị đã bán");
        }

        await _repository.SoftDeleteAsync(id);
        return ApiResponse<bool>.SuccessResponse(true, "Xóa thiết bị thành công");
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê tồn kho
    /// </summary>
    public async Task<ApiResponse<InventoryStatisticsDto>> GetStatisticsAsync()
    {
        var stats = new InventoryStatisticsDto
        {
            TotalInstances = await _repository.CountAsync(),
            InStock = await _repository.CountByStatusAsync("IN_STOCK"),
            Sold = await _repository.CountByStatusAsync("SOLD"),
            InWarranty = await _repository.CountByStatusAsync("WARRANTY"),
            InRepair = await _repository.CountByStatusAsync("REPAIR"),
            Transferring = await _repository.CountByStatusAsync("TRANSFERRING"),
            Demo = await _repository.CountByStatusAsync("DEMO"),
            Scrapped = await _repository.CountByStatusAsync("SCRAPPED"),
            Lost = await _repository.CountByStatusAsync("LOST"),
            TotalImportValue = await _repository.GetTotalImportValueAsync(),
            TotalSoldValue = await _repository.GetTotalSoldValueAsync()
        };

        return ApiResponse<InventoryStatisticsDto>.SuccessResponse(stats);
    }

    /// <summary>
    /// Thống kê theo kho
    /// </summary>
    public async Task<ApiResponse<List<WarehouseStockSummaryDto>>> GetStockByWarehouseAsync()
    {
        var data = await _repository.GetStockByWarehouseAsync();

        var result = data.Select(x => new WarehouseStockSummaryDto
        {
            WarehouseID = x.WarehouseId,
            WarehouseName = x.WarehouseName,
            TotalInstances = x.TotalCount,
            InStock = x.InStockCount,
            TotalValue = x.TotalValue
        }).ToList();

        return ApiResponse<List<WarehouseStockSummaryDto>>.SuccessResponse(result);
    }

    /// <summary>
    /// Kiểm tra serial đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckSerialExistsAsync(string serial, Guid? excludeId = null)
    {
        var exists = await _repository.ExistsBySerialAsync(serial, excludeId);
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    #endregion

    #region Private Methods

    private static ProductInstanceListDto MapToListDto(ProductInstance pi)
    {
        return new ProductInstanceListDto
        {
            InstanceID = pi.InstanceID,
            ComponentID = pi.ComponentID,
            ComponentSKU = pi.Component.SKU,
            ComponentName = pi.Component.ComponentName,
            ImageURL = pi.Component.ImageURL,
            VariantID = pi.VariantID,
            PartNumber = pi.Variant?.PartNumber,
            SerialNumber = pi.SerialNumber,
            IMEI1 = pi.IMEI1,
            WarehouseID = pi.WarehouseID,
            WarehouseName = pi.Warehouse?.WarehouseName,
            LocationCode = pi.LocationCode,
            Status = pi.Status,
            CurrentOwnerType = pi.CurrentOwnerType,
            WarrantyEndDate = pi.WarrantyEndDate,
            ActualImportPrice = pi.ActualImportPrice,
            ImportDate = pi.ImportDate
        };
    }

    private async Task<ProductInstanceDetailDto> MapToDetailDtoAsync(ProductInstance instance)
    {
        string? ownerName = null;
        string? soldToCustomerName = null;

        if (instance.CurrentOwnerID.HasValue && instance.CurrentOwnerType == "CUSTOMER")
        {
            var customer = await _repository.GetCustomerAsync(instance.CurrentOwnerID.Value);
            ownerName = customer?.CustomerName;
        }

        if (instance.SoldToCustomerID.HasValue)
        {
            var soldCustomer = await _repository.GetCustomerAsync(instance.SoldToCustomerID.Value);
            soldToCustomerName = soldCustomer?.CustomerName;
        }

        return new ProductInstanceDetailDto
        {
            InstanceID = instance.InstanceID,
            ComponentID = instance.ComponentID,
            ComponentSKU = instance.Component.SKU,
            ComponentName = instance.Component.ComponentName,
            ImageURL = instance.Component.ImageURL,
            Brand = instance.Component.Brand,
            Model = instance.Component.Model,
            VariantID = instance.VariantID,
            PartNumber = instance.Variant?.PartNumber,
            VariantName = instance.Variant?.VariantName,
            WarehouseID = instance.WarehouseID,
            WarehouseName = instance.Warehouse?.WarehouseName,
            SerialNumber = instance.SerialNumber,
            ModelNumber = instance.ModelNumber,
            InboundBoxNumber = instance.InboundBoxNumber,
            IMEI1 = instance.IMEI1,
            IMEI2 = instance.IMEI2,
            MACAddress = instance.MACAddress,
            Status = instance.Status,
            LocationCode = instance.LocationCode,
            Zone = instance.Zone,
            CurrentOwnerType = instance.CurrentOwnerType,
            CurrentOwnerID = instance.CurrentOwnerID,
            OwnerName = ownerName,
            WarrantyStartDate = instance.WarrantyStartDate,
            WarrantyEndDate = instance.WarrantyEndDate,
            WarrantyMonths = instance.WarrantyMonths,
            IsUnderWarranty = instance.WarrantyEndDate.HasValue && instance.WarrantyEndDate > DateTime.UtcNow,
            TotalRepairCount = instance.TotalRepairCount,
            LastRepairDate = instance.LastRepairDate,
            ActualImportPrice = instance.ActualImportPrice,
            ActualSellPrice = instance.ActualSellPrice,
            SoldDate = instance.SoldDate,
            SoldToCustomerID = instance.SoldToCustomerID,
            SoldToCustomerName = soldToCustomerName,
            ImportDate = instance.ImportDate,
            Notes = instance.Notes,
            CreatedAt = instance.CreatedAt,
            UpdatedAt = instance.UpdatedAt
        };
    }

    #endregion
}

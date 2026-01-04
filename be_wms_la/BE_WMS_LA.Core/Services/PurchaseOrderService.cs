using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.PurchaseOrder;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý đơn mua hàng - xử lý business logic
/// </summary>
public class PurchaseOrderService
{
    private readonly PurchaseOrderRepository _repository;

    public PurchaseOrderService(PurchaseOrderRepository repository)
    {
        _repository = repository;
    }

    #region Purchase Order CRUD

    /// <summary>
    /// Lấy danh sách đơn mua hàng có phân trang và lọc
    /// </summary>
    public async Task<ApiResponse<List<PurchaseOrderListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? supplierId = null,
        Guid? warehouseId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var orders = await _repository.GetAllAsync(search, supplierId, warehouseId, status, fromDate, toDate);
        var totalItems = orders.Count;

        var result = orders
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToListDto)
            .ToList();

        return ApiResponse<List<PurchaseOrderListDto>>.SuccessResponse(result, $"Lấy danh sách thành công ({totalItems} kết quả)");
    }

    /// <summary>
    /// Lấy chi tiết đơn mua hàng
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderDetailDto>> GetByIdAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order == null)
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        var dto = MapToDetailDto(order);
        return ApiResponse<PurchaseOrderDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Lấy đơn theo mã
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderDetailDto>> GetByCodeAsync(string code)
    {
        var order = await _repository.GetByCodeAsync(code);
        if (order == null)
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        var dto = MapToDetailDto(order);
        return ApiResponse<PurchaseOrderDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo đơn mua hàng mới
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderDetailDto>> CreateAsync(CreatePurchaseOrderDto dto, Guid? createdByUserId = null)
    {
        // Kiểm tra supplier
        if (!await _repository.SupplierExistsAsync(dto.SupplierID))
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Nhà cung cấp không tồn tại");
        }

        // Kiểm tra warehouse
        if (!await _repository.WarehouseExistsAsync(dto.WarehouseID))
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Kho không tồn tại");
        }

        // Kiểm tra components
        var componentIds = dto.Items.Select(i => i.ComponentID).Distinct().ToList();
        var existingComponents = await _repository.GetExistingComponentIdsAsync(componentIds);
        var invalidComponents = componentIds.Except(existingComponents).ToList();
        if (invalidComponents.Any())
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse($"Một số sản phẩm không tồn tại");
        }

        // Tự sinh mã nếu không nhập
        var orderCode = dto.OrderCode;
        if (string.IsNullOrEmpty(orderCode))
        {
            orderCode = await GenerateOrderCodeAsync();
        }
        else
        {
            if (await _repository.ExistsByCodeAsync(orderCode))
            {
                return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Mã đơn hàng đã tồn tại");
            }
        }

        // Tính tổng tiền
        decimal totalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
        decimal finalAmount = totalAmount - dto.DiscountAmount;

        var order = new PurchaseOrder
        {
            PurchaseOrderID = Guid.NewGuid(),
            OrderCode = orderCode,
            SupplierID = dto.SupplierID,
            WarehouseID = dto.WarehouseID,
            OrderDate = dto.OrderDate ?? DateTime.UtcNow,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
            Status = "PENDING",
            TotalAmount = totalAmount,
            DiscountAmount = dto.DiscountAmount,
            FinalAmount = finalAmount,
            CreatedByUserID = createdByUserId,
            Notes = dto.Notes
        };

        // Tạo chi tiết đơn
        foreach (var item in dto.Items)
        {
            var detail = new PurchaseOrderDetail
            {
                PurchaseOrderDetailID = Guid.NewGuid(),
                PurchaseOrderID = order.PurchaseOrderID,
                ComponentID = item.ComponentID,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice,
                ReceivedQuantity = 0,
                Notes = item.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            order.Details.Add(detail);
        }

        await _repository.AddAsync(order);
        return await GetByIdAsync(order.PurchaseOrderID);
    }

    /// <summary>
    /// Cập nhật đơn mua hàng (chỉ khi PENDING)
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderDetailDto>> UpdateAsync(Guid id, UpdatePurchaseOrderDto dto)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order == null)
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        if (order.Status != "PENDING")
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Chỉ có thể sửa đơn hàng ở trạng thái Chờ xác nhận");
        }

        // Cập nhật thông tin cơ bản
        if (dto.ExpectedDeliveryDate.HasValue) order.ExpectedDeliveryDate = dto.ExpectedDeliveryDate;
        if (dto.DiscountAmount.HasValue) order.DiscountAmount = dto.DiscountAmount.Value;
        if (dto.Notes != null) order.Notes = dto.Notes;

        // Cập nhật danh sách sản phẩm nếu có
        if (dto.Items != null && dto.Items.Any())
        {
            // Xóa chi tiết cũ
            foreach (var detail in order.Details)
            {
                detail.DeletedAt = DateTime.UtcNow;
            }

            // Tạo chi tiết mới
            foreach (var item in dto.Items)
            {
                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderDetailID = Guid.NewGuid(),
                    PurchaseOrderID = order.PurchaseOrderID,
                    ComponentID = item.ComponentID,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,
                    ReceivedQuantity = 0,
                    Notes = item.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                order.Details.Add(detail);
            }

            // Tính lại tổng tiền
            order.TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
            order.FinalAmount = order.TotalAmount - order.DiscountAmount;
        }

        await _repository.UpdateAsync(order);
        return await GetByIdAsync(order.PurchaseOrderID);
    }

    /// <summary>
    /// Cập nhật trạng thái đơn
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderDetailDto>> UpdateStatusAsync(Guid id, UpdatePurchaseOrderStatusDto dto)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order == null)
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        // Validate state transition
        var validTransitions = new Dictionary<string, List<string>>
        {
            { "PENDING", new List<string> { "CONFIRMED", "CANCELLED" } },
            { "CONFIRMED", new List<string> { "DELIVERED", "CANCELLED" } },
            { "DELIVERED", new List<string>() },
            { "CANCELLED", new List<string>() }
        };

        if (!validTransitions.ContainsKey(order.Status) ||
            !validTransitions[order.Status].Contains(dto.Status))
        {
            return ApiResponse<PurchaseOrderDetailDto>.ErrorResponse(
                $"Không thể chuyển từ trạng thái '{order.Status}' sang '{dto.Status}'");
        }

        order.Status = dto.Status;
        if (dto.ActualDeliveryDate.HasValue)
        {
            order.ActualDeliveryDate = dto.ActualDeliveryDate;
        }

        await _repository.UpdateAsync(order);
        return await GetByIdAsync(order.PurchaseOrderID);
    }

    /// <summary>
    /// Xóa đơn mua hàng (chỉ khi PENDING hoặc CANCELLED)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        if (order.Status != "PENDING" && order.Status != "CANCELLED")
        {
            return ApiResponse<bool>.ErrorResponse("Chỉ có thể xóa đơn hàng ở trạng thái Chờ xác nhận hoặc Đã hủy");
        }

        await _repository.SoftDeleteAsync(id);
        return ApiResponse<bool>.SuccessResponse(true, "Xóa đơn mua hàng thành công");
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê đơn mua hàng
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderStatisticsDto>> GetStatisticsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfYear = new DateTime(now.Year, 1, 1);

        var stats = new PurchaseOrderStatisticsDto
        {
            TotalOrders = await _repository.CountAsync(),
            PendingOrders = await _repository.CountByStatusAsync("PENDING"),
            ConfirmedOrders = await _repository.CountByStatusAsync("CONFIRMED"),
            DeliveredOrders = await _repository.CountByStatusAsync("DELIVERED"),
            CancelledOrders = await _repository.CountByStatusAsync("CANCELLED"),
            TotalAmountThisMonth = await _repository.GetTotalAmountAsync(startOfMonth),
            TotalAmountThisYear = await _repository.GetTotalAmountAsync(startOfYear),
            OrdersThisMonth = await _repository.CountNewThisMonthAsync()
        };

        return ApiResponse<PurchaseOrderStatisticsDto>.SuccessResponse(stats);
    }

    #endregion

    #region Private Methods

    private async Task<string> GenerateOrderCodeAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"PO-{year}";

        var lastCode = await _repository.GetLastCodeByPrefixAsync(prefix);

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(lastCode))
        {
            var parts = lastCode.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}-{nextNumber:D4}";
    }

    private static PurchaseOrderListDto MapToListDto(PurchaseOrder order)
    {
        return new PurchaseOrderListDto
        {
            PurchaseOrderID = order.PurchaseOrderID,
            OrderCode = order.OrderCode,
            SupplierID = order.SupplierID,
            SupplierName = order.Supplier.SupplierName,
            WarehouseID = order.WarehouseID,
            WarehouseName = order.Warehouse.WarehouseName,
            OrderDate = order.OrderDate,
            ExpectedDeliveryDate = order.ExpectedDeliveryDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            FinalAmount = order.FinalAmount,
            ItemCount = order.Details.Count(d => d.DeletedAt == null),
            ReceivedItemCount = order.Details.Count(d => d.DeletedAt == null && d.ReceivedQuantity >= d.Quantity),
            CreatedByName = order.CreatedByUser?.FullName,
            CreatedAt = order.CreatedAt
        };
    }

    private static PurchaseOrderDetailDto MapToDetailDto(PurchaseOrder order)
    {
        return new PurchaseOrderDetailDto
        {
            PurchaseOrderID = order.PurchaseOrderID,
            OrderCode = order.OrderCode,
            SupplierID = order.SupplierID,
            SupplierName = order.Supplier.SupplierName,
            SupplierCode = order.Supplier.SupplierCode,
            SupplierPhone = order.Supplier.PhoneNumber,
            SupplierEmail = order.Supplier.Email,
            WarehouseID = order.WarehouseID,
            WarehouseName = order.Warehouse.WarehouseName,
            OrderDate = order.OrderDate,
            ExpectedDeliveryDate = order.ExpectedDeliveryDate,
            ActualDeliveryDate = order.ActualDeliveryDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            DiscountAmount = order.DiscountAmount,
            FinalAmount = order.FinalAmount,
            CreatedByUserID = order.CreatedByUserID,
            CreatedByName = order.CreatedByUser?.FullName,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Details
                .Where(d => d.DeletedAt == null)
                .OrderBy(d => d.CreatedAt)
                .Select(d => new PurchaseOrderDetailItemDto
                {
                    PurchaseOrderDetailID = d.PurchaseOrderDetailID,
                    ComponentID = d.ComponentID,
                    ComponentSKU = d.Component.SKU,
                    ComponentName = d.Component.ComponentName,
                    ImageURL = d.Component.ImageURL,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    TotalPrice = d.TotalPrice,
                    ReceivedQuantity = d.ReceivedQuantity,
                    Notes = d.Notes
                })
                .ToList()
        };
    }

    #endregion
}

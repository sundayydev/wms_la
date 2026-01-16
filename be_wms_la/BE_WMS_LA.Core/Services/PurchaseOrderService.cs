using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.PurchaseOrder;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý đơn mua hàng - xử lý business logic
/// </summary>
public partial class PurchaseOrderService
{
    private readonly PurchaseOrderRepository _repository;
    private readonly InventoryRepository _inventoryRepository;
    private readonly InventoryTransactionRepository _transactionRepository;
    private readonly PurchaseOrderHistoryRepository _historyRepository;

    public PurchaseOrderService(
        PurchaseOrderRepository repository,
        InventoryRepository inventoryRepository,
        InventoryTransactionRepository transactionRepository,
        PurchaseOrderHistoryRepository historyRepository)
    {
        _repository = repository;
        _inventoryRepository = inventoryRepository;
        _transactionRepository = transactionRepository;
        _historyRepository = historyRepository;
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

        // ✅ Ghi lịch sử: Tạo đơn
        await _historyRepository.AddAsync(new PurchaseOrderHistory
        {
            HistoryID = Guid.NewGuid(),
            PurchaseOrderID = order.PurchaseOrderID,
            Action = Domain.Constants.PurchaseOrderAction.CREATED,
            OldStatus = null,
            NewStatus = "PENDING",
            PerformedByUserID = createdByUserId,
            PerformedAt = DateTime.UtcNow,
            Description = $"Tạo đơn đặt hàng mới - {order.Details.Count} sản phẩm, tổng tiền {order.FinalAmount:N0} VNĐ"
        });

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

        var oldStatus = order.Status;
        order.Status = dto.Status;
        if (dto.ActualDeliveryDate.HasValue)
        {
            order.ActualDeliveryDate = dto.ActualDeliveryDate;
        }

        await _repository.UpdateAsync(order);

        // ✅ Ghi lịch sử: Thay đổi trạng thái
        var action = dto.Status switch
        {
            "CONFIRMED" => Domain.Constants.PurchaseOrderAction.CONFIRMED,
            "CANCELLED" => Domain.Constants.PurchaseOrderAction.CANCELLED,
            "DELIVERED" => Domain.Constants.PurchaseOrderAction.COMPLETED,
            _ => Domain.Constants.PurchaseOrderAction.UPDATED
        };

        var description = dto.Status switch
        {
            "CONFIRMED" => "Đã duyệt và xác nhận đơn hàng",
            "CANCELLED" => !string.IsNullOrEmpty(dto.Notes) ? $"Hủy đơn: {dto.Notes}" : "Đã hủy đơn hàng",
            "DELIVERED" => "Đánh dấu đã giao hàng hoàn tất",
            _ => $"Cập nhật trạng thái từ {oldStatus} sang {dto.Status}"
        };

        await _historyRepository.AddAsync(new PurchaseOrderHistory
        {
            HistoryID = Guid.NewGuid(),
            PurchaseOrderID = order.PurchaseOrderID,
            Action = action,
            OldStatus = oldStatus,
            NewStatus = dto.Status,
            PerformedByUserID = null, // TODO: Get from HttpContext
            PerformedAt = DateTime.UtcNow,
            Description = description
        });

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
        var startOfMonth = DateTime.SpecifyKind(new DateTime(now.Year, now.Month, 1), DateTimeKind.Utc);
        var startOfYear = DateTime.SpecifyKind(new DateTime(now.Year, 1, 1), DateTimeKind.Utc);

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

    #region Receiving

    /// <summary>
    /// Nhận hàng từ Purchase Order
    /// </summary>
    public async Task<ApiResponse<ReceiveResultDto>> ReceiveItemsAsync(
        Guid purchaseOrderId,
        ReceivePurchaseOrderDto dto,
        Guid? userId = null)
    {
        // 1. Get PO with full details
        var order = await _repository.GetByIdAsync(purchaseOrderId);
        if (order == null)
        {
            return ApiResponse<ReceiveResultDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        // 2. Validate status
        if (order.Status != "CONFIRMED" && order.Status != "PARTIAL")
        {
            return ApiResponse<ReceiveResultDto>.ErrorResponse(
                $"Chỉ có thể nhận hàng cho đơn đã xác nhận. Trạng thái hiện tại: {order.Status}");
        }

        // 3. Validate items không rỗng
        if (dto.Items == null || !dto.Items.Any())
        {
            return ApiResponse<ReceiveResultDto>.ErrorResponse("Không có sản phẩm để nhận");
        }

        var receivedDate = dto.ReceivedDate ?? DateTime.UtcNow;
        var receivedSerials = new List<string>();
        var productInstances = new List<ProductInstance>();
        var transactions = new List<InventoryTransaction>();

        // 4. Process each received item
        foreach (var item in dto.Items)
        {
            // Find corresponding PO detail
            var poDetail = order.Details.FirstOrDefault(d =>
                d.PurchaseOrderDetailID == item.PurchaseOrderDetailID &&
                d.DeletedAt == null);

            if (poDetail == null)
            {
                return ApiResponse<ReceiveResultDto>.ErrorResponse(
                    $"Không tìm thấy sản phẩm trong đơn hàng: {item.PurchaseOrderDetailID}");
            }

            // Validate quantity
            var remainingQty = poDetail.Quantity - poDetail.ReceivedQuantity;
            if (item.Quantity > remainingQty)
            {
                return ApiResponse<ReceiveResultDto>.ErrorResponse(
                    $"Số lượng nhận vượt quá số lượng còn lại cho {poDetail.Component.ComponentName}. " +
                    $"Còn lại: {remainingQty}, yêu cầu: {item.Quantity}");
            }

            // 4.1 Validate consistency based on Component.IsSerialized
            var isSerialized = poDetail.Component.IsSerialized;
            var hasSerial = !string.IsNullOrEmpty(item.SerialNumber);

            if (isSerialized && !hasSerial)
            {
                return ApiResponse<ReceiveResultDto>.ErrorResponse(
                    $"Sản phẩm '{poDetail.Component.ComponentName}' được quản lý theo Serial. " +
                    $"Vui lòng nhập Serial Number.");
            }

            if (!isSerialized && hasSerial)
            {
                return ApiResponse<ReceiveResultDto>.ErrorResponse(
                    $"Sản phẩm '{poDetail.Component.ComponentName}' được quản lý theo số lượng, " +
                    $"không cần nhập Serial Number.");
            }

            // 4.2 For serialized items: Quantity must be 1
            if (isSerialized && item.Quantity != 1)
            {
                return ApiResponse<ReceiveResultDto>.ErrorResponse(
                    $"Sản phẩm Serial '{poDetail.Component.ComponentName}' chỉ được nhập từng cái một (Quantity = 1). " +
                    $"Hiện tại: {item.Quantity}");
            }

            // For serialized items
            if (isSerialized)
            {
                // Validate serial không trùng (hasSerial is guaranteed true at this point)
                if (await _inventoryRepository.ExistsBySerialAsync(item.SerialNumber!))
                {
                    return ApiResponse<ReceiveResultDto>.ErrorResponse(
                        $"Serial Number đã tồn tại: {item.SerialNumber}");
                }

                // Validate IMEI1
                if (!string.IsNullOrEmpty(item.IMEI1))
                {
                    if (await _inventoryRepository.ExistsByImeiAsync(item.IMEI1))
                    {
                        return ApiResponse<ReceiveResultDto>.ErrorResponse(
                            $"IMEI1 đã tồn tại: {item.IMEI1}");
                    }
                }

                // Validate IMEI2
                if (!string.IsNullOrEmpty(item.IMEI2))
                {
                    if (await _inventoryRepository.ExistsByImeiAsync(item.IMEI2))
                    {
                        return ApiResponse<ReceiveResultDto>.ErrorResponse(
                            $"IMEI2 đã tồn tại: {item.IMEI2}");
                    }
                }

                // Create ProductInstance
                var instance = new ProductInstance
                {
                    InstanceID = Guid.NewGuid(),
                    ComponentID = poDetail.ComponentID,
                    VariantID = item.VariantID,
                    WarehouseID = order.WarehouseID,
                    SerialNumber = item.SerialNumber!, // Already validated hasSerial is true
                    ModelNumber = item.ModelNumber,
                    InboundBoxNumber = item.InboundBoxNumber,
                    IMEI1 = item.IMEI1?.Trim(),
                    IMEI2 = item.IMEI2?.Trim(),
                    MACAddress = item.MACAddress?.Trim(),
                    Status = "IN_STOCK",
                    LocationCode = item.LocationCode,
                    Zone = item.Zone ?? "MAIN",
                    CurrentOwnerType = "COMPANY",
                    ActualImportPrice = item.ActualImportPrice ?? poDetail.UnitPrice,
                    ImportDate = receivedDate,
                    WarrantyMonths = item.WarrantyMonths ?? 12,
                    WarrantyStartDate = receivedDate,
                    WarrantyEndDate = receivedDate.AddMonths(item.WarrantyMonths ?? 12),
                    Notes = item.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                productInstances.Add(instance);
                receivedSerials.Add(item.SerialNumber!); // Already validated hasSerial is true

                // Create transaction for this instance
                transactions.Add(new InventoryTransaction
                {
                    TransactionID = Guid.NewGuid(),
                    TransactionType = "IMPORT",
                    ReferenceID = order.PurchaseOrderID,
                    WarehouseID = order.WarehouseID,
                    ComponentID = poDetail.ComponentID,
                    InstanceID = instance.InstanceID,
                    Quantity = 1,
                    TransactionDate = receivedDate,
                    CreatedByUserID = userId,
                    Notes = $"Nhập từ PO {order.OrderCode} - Serial: {item.SerialNumber}"
                });
            }
            else
            {
                // For non-serialized items (consumables, cables, etc.)
                // 1. Update WarehouseStock
                await _inventoryRepository.UpsertWarehouseStockAsync(
                    order.WarehouseID,
                    poDetail.ComponentID,
                    item.VariantID,
                    item.Quantity,
                    item.LocationCode);

                // 2. Create transaction without instance
                transactions.Add(new InventoryTransaction
                {
                    TransactionID = Guid.NewGuid(),
                    TransactionType = "IMPORT",
                    ReferenceID = order.PurchaseOrderID,
                    WarehouseID = order.WarehouseID,
                    ComponentID = poDetail.ComponentID,
                    InstanceID = null,
                    Quantity = item.Quantity,
                    TransactionDate = receivedDate,
                    CreatedByUserID = userId,
                    Notes = $"Nhập {item.Quantity} từ PO {order.OrderCode}"
                });
            }

            // Update received quantity
            poDetail.ReceivedQuantity += item.Quantity;
            poDetail.UpdatedAt = DateTime.UtcNow;
        }

        // 5. Save ProductInstances
        if (productInstances.Any())
        {
            await _inventoryRepository.AddRangeAsync(productInstances);
        }

        // 6. Save Transactions
        await _transactionRepository.AddRangeAsync(transactions);

        // 7. Update PO status
        var allItemsDelivered = order.Details
            .Where(d => d.DeletedAt == null)
            .All(d => d.ReceivedQuantity >= d.Quantity);

        var oldStatus = order.Status;
        order.Status = allItemsDelivered ? "DELIVERED" : "PARTIAL";

        if (allItemsDelivered)
        {
            order.ActualDeliveryDate = DateOnly.FromDateTime(receivedDate);
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(order);

        // ✅ Ghi lịch sử: Nhận hàng
        var action = allItemsDelivered
            ? Domain.Constants.PurchaseOrderAction.FULLY_RECEIVED
            : Domain.Constants.PurchaseOrderAction.PARTIAL_RECEIVED;

        var totalItems = dto.Items.Sum(i => i.Quantity);
        var description = allItemsDelivered
            ? $"Hoàn thành nhận hàng - {totalItems} sản phẩm"
            : $"Nhận một phần hàng - {totalItems} sản phẩm";

        await _historyRepository.AddAsync(new PurchaseOrderHistory
        {
            HistoryID = Guid.NewGuid(),
            PurchaseOrderID = order.PurchaseOrderID,
            Action = action,
            OldStatus = oldStatus,
            NewStatus = order.Status,
            PerformedByUserID = userId,
            PerformedAt = DateTime.UtcNow,
            Description = description,
            Metadata = $"{{\"receivedItemsCount\": {totalItems}, \"serializedItems\": {receivedSerials.Count}}}"
        });

        // 8. Return result
        var result = new ReceiveResultDto
        {
            PurchaseOrderID = order.PurchaseOrderID,
            OrderCode = order.OrderCode,
            ReceivedItemsCount = dto.Items.Sum(i => i.Quantity),
            NewStatus = order.Status,
            WarehouseName = order.Warehouse.WarehouseName,
            UpdatedAt = order.UpdatedAt,
            ReceivedSerials = receivedSerials
        };

        return ApiResponse<ReceiveResultDto>.SuccessResponse(
            result,
            $"Đã nhận {result.ReceivedItemsCount} sản phẩm thành công vào kho {result.WarehouseName}");
    }

    /// <summary>
    /// Lấy danh sách chi tiết các sản phẩm đã nhận cho một PO
    /// </summary>
    public async Task<ApiResponse<ReceivedItemsResponseDto>> GetReceivedItemsAsync(Guid purchaseOrderId)
    {
        var order = await _repository.GetByIdAsync(purchaseOrderId);
        if (order == null)
        {
            return ApiResponse<ReceivedItemsResponseDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        // Get all transactions for this PO
        var transactions = await _transactionRepository.GetByReferenceAsync(purchaseOrderId);

        // Get all InstanceIDs from transactions that have instances
        var instanceIds = transactions
            .Where(t => t.InstanceID != null)
            .Select(t => t.InstanceID!.Value)
            .Distinct()
            .ToList();

        // Get all ProductInstances with their full data
        var instances = new Dictionary<Guid, ProductInstance>();
        if (instanceIds.Any())
        {
            var instanceList = await _inventoryRepository.GetByIdsAsync(instanceIds);
            instances = instanceList.ToDictionary(i => i.InstanceID);
        }

        var response = new ReceivedItemsResponseDto
        {
            PurchaseOrderID = order.PurchaseOrderID,
            OrderCode = order.OrderCode,
            WarehouseName = order.Warehouse.WarehouseName,
        };

        // Debug info for troubleshooting - will be removed later
        var debugMsg = $"Transactions found: {transactions.Count}, InstanceIDs: {instanceIds.Count}, Instances loaded: {instances.Count}";

        var activeDetails = order.Details.Where(d => d.DeletedAt == null).ToList();
        var items = new List<ReceivedItemDetailDto>();

        foreach (var detail in activeDetails)
        {
            if (detail.ReceivedQuantity == 0) continue;

            var itemDto = new ReceivedItemDetailDto
            {
                PurchaseOrderDetailID = detail.PurchaseOrderDetailID,
                ComponentID = detail.ComponentID,
                ComponentSKU = detail.Component.SKU,
                ComponentName = detail.Component.ComponentName,
                ImageURL = detail.Component.ImageURL,
                IsSerialized = detail.Component.IsSerialized,
                OrderedQuantity = detail.Quantity,
                ReceivedQuantity = detail.ReceivedQuantity,
                UnitPrice = detail.UnitPrice,
            };

            // For serialized items, get ProductInstance details
            if (detail.Component.IsSerialized)
            {
                // Get InstanceIDs for this component from transactions
                var componentInstanceIds = transactions
                    .Where(t => t.ComponentID == detail.ComponentID && t.InstanceID != null)
                    .Select(t => t.InstanceID!.Value)
                    .Distinct()
                    .ToList();

                foreach (var instanceId in componentInstanceIds)
                {
                    if (instances.TryGetValue(instanceId, out var instance))
                    {
                        itemDto.Instances.Add(new ReceivedInstanceDto
                        {
                            InstanceID = instance.InstanceID,
                            SerialNumber = instance.SerialNumber,
                            IMEI1 = instance.IMEI1,
                            IMEI2 = instance.IMEI2,
                            MACAddress = instance.MACAddress,
                            Status = instance.Status,
                            LocationCode = instance.LocationCode,
                            Zone = instance.Zone,
                            ImportDate = instance.ImportDate,
                            Notes = instance.Notes,
                        });
                    }
                }

                response.TotalSerializedItems += itemDto.Instances.Count;
            }
            else
            {
                response.TotalNonSerializedItems += detail.ReceivedQuantity;
            }

            response.TotalReceivedQuantity += detail.ReceivedQuantity;
            items.Add(itemDto);
        }

        response.Items = items;
        return ApiResponse<ReceivedItemsResponseDto>.SuccessResponse(response, debugMsg);
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
        var activeDetails = order.Details.Where(d => d.DeletedAt == null).ToList();

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
            ItemCount = activeDetails.Count,
            ReceivedItemCount = activeDetails.Count(d => d.ReceivedQuantity >= d.Quantity),
            TotalQuantity = activeDetails.Sum(d => d.Quantity),
            ReceivedQuantity = activeDetails.Sum(d => d.ReceivedQuantity),
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
                    Notes = d.Notes,
                    IsSerialized = d.Component.IsSerialized
                })
                .ToList()
        };
    }

    #endregion

    #region History Management

    /// <summary>
    /// Lấy lịch sử hoạt động của đơn mua hàng
    /// </summary>
    public async Task<ApiResponse<List<PurchaseOrderHistoryDto>>> GetHistoryAsync(Guid purchaseOrderId)
    {
        var order = await _repository.GetByIdAsync(purchaseOrderId);
        if (order == null)
        {
            return ApiResponse<List<PurchaseOrderHistoryDto>>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        var histories = await _historyRepository.GetByPurchaseOrderIdAsync(purchaseOrderId);

        var historyDtos = histories.Select(h => new PurchaseOrderHistoryDto
        {
            HistoryID = h.HistoryID,
            PurchaseOrderID = h.PurchaseOrderID,
            Action = h.Action,
            OldStatus = h.OldStatus,
            NewStatus = h.NewStatus,
            PerformedByUserID = h.PerformedByUserID,
            PerformedByUserName = h.PerformedByUser?.FullName,
            PerformedByEmail = h.PerformedByUser?.Email,
            PerformedAt = h.PerformedAt,
            Description = h.Description,
            Metadata = h.Metadata,
            IpAddress = h.IpAddress
        }).ToList();

        return ApiResponse<List<PurchaseOrderHistoryDto>>.SuccessResponse(
            historyDtos,
            $"Lấy lịch sử thành công ({historyDtos.Count} bản ghi)");
    }

    /// <summary>
    /// Tạo record lịch sử
    /// </summary>
    public async Task<ApiResponse<PurchaseOrderHistoryDto>> CreateHistoryAsync(
        CreatePurchaseOrderHistoryDto dto,
        Guid? userId = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        // Validate PurchaseOrder exists
        var order = await _repository.GetByIdAsync(dto.PurchaseOrderID);
        if (order == null)
        {
            return ApiResponse<PurchaseOrderHistoryDto>.ErrorResponse("Không tìm thấy đơn mua hàng");
        }

        var history = new PurchaseOrderHistory
        {
            HistoryID = Guid.NewGuid(),
            PurchaseOrderID = dto.PurchaseOrderID,
            Action = dto.Action,
            OldStatus = dto.OldStatus,
            NewStatus = dto.NewStatus,
            PerformedByUserID = userId,
            PerformedAt = DateTime.UtcNow,
            Description = dto.Description,
            Metadata = dto.Metadata,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _historyRepository.AddAsync(history);

        // Return the created history with user info
        var resultHistory = await _historyRepository.GetByIdAsync(history.HistoryID);
        if (resultHistory == null)
        {
            return ApiResponse<PurchaseOrderHistoryDto>.ErrorResponse("Không thể tạo lịch sử");
        }

        var historyDto = new PurchaseOrderHistoryDto
        {
            HistoryID = resultHistory.HistoryID,
            PurchaseOrderID = resultHistory.PurchaseOrderID,
            Action = resultHistory.Action,
            OldStatus = resultHistory.OldStatus,
            NewStatus = resultHistory.NewStatus,
            PerformedByUserID = resultHistory.PerformedByUserID,
            PerformedByUserName = resultHistory.PerformedByUser?.FullName,
            PerformedByEmail = resultHistory.PerformedByUser?.Email,
            PerformedAt = resultHistory.PerformedAt,
            Description = resultHistory.Description,
            Metadata = resultHistory.Metadata,
            IpAddress = resultHistory.IpAddress
        };

        return ApiResponse<PurchaseOrderHistoryDto>.SuccessResponse(
            historyDto,
            "Tạo lịch sử thành công");
    }

    #endregion
}

using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Warehouse;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service xử lý nghiệp vụ quản lý kho
/// </summary>
public class WarehouseService
{
    private readonly WarehouseRepository _warehouseRepository;
    private readonly UserRepository _userRepository;

    public WarehouseService(
        WarehouseRepository warehouseRepository,
        UserRepository userRepository)
    {
        _warehouseRepository = warehouseRepository;
        _userRepository = userRepository;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả kho
    /// </summary>
    public async Task<ApiResponse<List<WarehouseListDto>>> GetAllWarehousesAsync(bool includeInactive = false)
    {
        try
        {
            var warehouses = await _warehouseRepository.GetAllAsync(includeInactive);

            var warehouseDtos = new List<WarehouseListDto>();

            foreach (var warehouse in warehouses)
            {
                var totalUsers = await _warehouseRepository.CountUsersAsync(warehouse.WarehouseID);
                var totalProducts = await _warehouseRepository.CountTotalProductsAsync(warehouse.WarehouseID);

                warehouseDtos.Add(new WarehouseListDto
                {
                    WarehouseID = warehouse.WarehouseID,
                    WarehouseName = warehouse.WarehouseName,
                    Address = warehouse.Address,
                    PhoneNumber = warehouse.PhoneNumber,
                    ManagerUserID = warehouse.ManagerUserID,
                    ManagerName = warehouse.Manager?.FullName,
                    IsActive = warehouse.IsActive,
                    TotalUsers = totalUsers,
                    TotalProducts = totalProducts,
                    CreatedAt = warehouse.CreatedAt,
                    UpdatedAt = warehouse.UpdatedAt
                });
            }

            return ApiResponse<List<WarehouseListDto>>.SuccessResponse(
                warehouseDtos,
                $"Lấy danh sách {warehouseDtos.Count} kho thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<WarehouseListDto>>.ErrorResponse(
                "Lỗi khi lấy danh sách kho: " + ex.Message);
        }
    }

    /// <summary>
    /// Lấy chi tiết kho theo ID
    /// </summary>
    public async Task<ApiResponse<WarehouseDetailDto>> GetWarehouseByIdAsync(Guid id)
    {
        try
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(id);
            if (warehouse == null)
            {
                return ApiResponse<WarehouseDetailDto>.ErrorResponse("Không tìm thấy kho");
            }

            // Lấy thống kê tồn kho
            var stockSummary = new WarehouseStockSummaryDto
            {
                TotalSKUs = await _warehouseRepository.CountDistinctSKUsAsync(id),
                TotalProducts = await _warehouseRepository.CountTotalProductsAsync(id),
                TotalQuantity = await _warehouseRepository.GetTotalQuantityAsync(id),
                TotalAvailable = await _warehouseRepository.GetTotalAvailableAsync(id),
                TotalReserved = await _warehouseRepository.GetTotalReservedAsync(id)
            };

            // Lấy danh sách nhân viên
            var users = await _warehouseRepository.GetUsersAsync(id);
            var userDtos = users.Select(u => new WarehouseUserDto
            {
                UserID = u.UserID,
                Username = u.Username,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive
            }).ToList();

            var warehouseDto = new WarehouseDetailDto
            {
                WarehouseID = warehouse.WarehouseID,
                WarehouseName = warehouse.WarehouseName,
                Address = warehouse.Address,
                PhoneNumber = warehouse.PhoneNumber,
                ManagerUserID = warehouse.ManagerUserID,
                ManagerName = warehouse.Manager?.FullName,
                ManagerUsername = warehouse.Manager?.Username,
                IsActive = warehouse.IsActive,
                Users = userDtos,
                StockSummary = stockSummary,
                CreatedAt = warehouse.CreatedAt,
                UpdatedAt = warehouse.UpdatedAt
            };

            return ApiResponse<WarehouseDetailDto>.SuccessResponse(
                warehouseDto,
                "Lấy thông tin kho thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                "Lỗi khi lấy thông tin kho: " + ex.Message);
        }
    }

    /// <summary>
    /// Tạo kho mới
    /// </summary>
    public async Task<ApiResponse<WarehouseDetailDto>> CreateWarehouseAsync(CreateWarehouseDto dto)
    {
        try
        {
            // Kiểm tra tên kho đã tồn tại chưa
            if (await _warehouseRepository.ExistsByNameAsync(dto.WarehouseName))
            {
                return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                    $"Tên kho '{dto.WarehouseName}' đã tồn tại");
            }

            // Kiểm tra manager có tồn tại không
            if (dto.ManagerUserID.HasValue)
            {
                var manager = await _userRepository.GetByIdAsync(dto.ManagerUserID.Value);
                if (manager == null)
                {
                    return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                        "Người quản lý không tồn tại");
                }
            }

            var warehouse = new Warehouse
            {
                WarehouseID = Guid.NewGuid(),
                WarehouseName = dto.WarehouseName,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                ManagerUserID = dto.ManagerUserID,
                IsActive = true
            };

            var createdWarehouse = await _warehouseRepository.AddAsync(warehouse);

            // Trả về chi tiết kho vừa tạo
            return await GetWarehouseByIdAsync(createdWarehouse.WarehouseID);
        }
        catch (Exception ex)
        {
            return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                "Lỗi khi tạo kho: " + ex.Message);
        }
    }

    /// <summary>
    /// Cập nhật thông tin kho
    /// </summary>
    public async Task<ApiResponse<WarehouseDetailDto>> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto dto)
    {
        try
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(id);
            if (warehouse == null)
            {
                return ApiResponse<WarehouseDetailDto>.ErrorResponse("Không tìm thấy kho");
            }

            // Kiểm tra tên kho đã tồn tại chưa (trừ kho hiện tại)
            if (await _warehouseRepository.ExistsByNameAsync(dto.WarehouseName, id))
            {
                return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                    $"Tên kho '{dto.WarehouseName}' đã tồn tại");
            }

            // Kiểm tra manager có tồn tại không
            if (dto.ManagerUserID.HasValue)
            {
                var manager = await _userRepository.GetByIdAsync(dto.ManagerUserID.Value);
                if (manager == null)
                {
                    return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                        "Người quản lý không tồn tại");
                }
            }

            warehouse.WarehouseName = dto.WarehouseName;
            warehouse.Address = dto.Address;
            warehouse.PhoneNumber = dto.PhoneNumber;
            warehouse.ManagerUserID = dto.ManagerUserID;
            warehouse.IsActive = dto.IsActive;

            await _warehouseRepository.UpdateAsync(warehouse);

            return await GetWarehouseByIdAsync(id);
        }
        catch (Exception ex)
        {
            return ApiResponse<WarehouseDetailDto>.ErrorResponse(
                "Lỗi khi cập nhật kho: " + ex.Message);
        }
    }

    /// <summary>
    /// Xóa mềm kho
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteWarehouseAsync(Guid id)
    {
        try
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(id);
            if (warehouse == null)
            {
                return ApiResponse<bool>.ErrorResponse("Không tìm thấy kho");
            }

            // Kiểm tra có nhân viên trong kho không
            var userCount = await _warehouseRepository.CountUsersAsync(id);
            if (userCount > 0)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"Không thể xóa kho vì còn {userCount} nhân viên. Vui lòng chuyển nhân viên sang kho khác trước.");
            }

            // Kiểm tra có tồn kho không
            var stockCount = await _warehouseRepository.CountTotalProductsAsync(id);
            if (stockCount > 0)
            {
                return ApiResponse<bool>.ErrorResponse(
                    $"Không thể xóa kho vì còn {stockCount} sản phẩm tồn kho. Vui lòng chuyển kho trước.");
            }

            var success = await _warehouseRepository.SoftDeleteAsync(id);

            if (success)
            {
                return ApiResponse<bool>.SuccessResponse(true, "Xóa kho thành công");
            }

            return ApiResponse<bool>.ErrorResponse("Xóa kho thất bại");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse(
                "Lỗi khi xóa kho: " + ex.Message);
        }
    }

    /// <summary>
    /// Khôi phục kho đã xóa
    /// </summary>
    public async Task<ApiResponse<bool>> RestoreWarehouseAsync(Guid id)
    {
        try
        {
            var success = await _warehouseRepository.RestoreAsync(id);

            if (success)
            {
                return ApiResponse<bool>.SuccessResponse(true, "Khôi phục kho thành công");
            }

            return ApiResponse<bool>.ErrorResponse("Không tìm thấy kho hoặc khôi phục thất bại");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse(
                "Lỗi khi khôi phục kho: " + ex.Message);
        }
    }

    #endregion

    #region Stock Operations

    /// <summary>
    /// Lấy tồn kho theo kho
    /// </summary>
    public async Task<ApiResponse<List<WarehouseStockDto>>> GetWarehouseStockAsync(GetWarehouseStockRequest request)
    {
        try
        {
            // Kiểm tra kho có tồn tại không
            var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseID);
            if (warehouse == null)
            {
                return ApiResponse<List<WarehouseStockDto>>.ErrorResponse("Không tìm thấy kho");
            }

            var stocks = await _warehouseRepository.SearchStockAsync(
                request.WarehouseID,
                request.SearchTerm,
                request.LowStock,
                request.MinQuantity);

            var stockDtos = stocks.Select(s => new WarehouseStockDto
            {
                StockID = s.StockID,
                WarehouseID = s.WarehouseID,
                WarehouseName = s.Warehouse.WarehouseName,
                ComponentID = s.ComponentID,
                SKU = s.Component.SKU,
                ComponentName = s.Component.ComponentName,
                VariantID = s.VariantID,
                PartNumber = s.Variant?.PartNumber,
                VariantName = s.Variant?.VariantName,
                QuantityOnHand = s.QuantityOnHand,
                QuantityReserved = s.QuantityReserved,
                QuantityAvailable = s.QuantityAvailable,
                DefaultLocationCode = s.DefaultLocationCode,
                LastStockUpdate = s.LastStockUpdate,
                LastCountDate = s.LastCountDate
            }).ToList();

            return ApiResponse<List<WarehouseStockDto>>.SuccessResponse(
                stockDtos,
                $"Lấy tồn kho thành công. Tìm thấy {stockDtos.Count} sản phẩm");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<WarehouseStockDto>>.ErrorResponse(
                "Lỗi khi lấy tồn kho: " + ex.Message);
        }
    }

    #endregion
}

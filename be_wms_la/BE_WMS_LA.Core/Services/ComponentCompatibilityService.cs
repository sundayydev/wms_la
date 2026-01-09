using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.ComponentCompatibility;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý ComponentCompatibility
/// </summary>
public class ComponentCompatibilityService
{
    private readonly ComponentCompatibilityRepository _compatibilityRepository;
    private readonly ProductRepository _productRepository;

    public ComponentCompatibilityService(
        ComponentCompatibilityRepository compatibilityRepository,
        ProductRepository productRepository)
    {
        _compatibilityRepository = compatibilityRepository;
        _productRepository = productRepository;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy tất cả compatibility relationships
    /// </summary>
    public async Task<List<ComponentCompatibilityDto>> GetAllAsync()
    {
        var compatibilities = await _compatibilityRepository.GetAllAsync();
        return compatibilities.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Lấy danh sách các thiết bị tương thích với một Component (Source -> Targets)
    /// Ví dụ: Pin này sử dụng được cho máy PDA nào?
    /// </summary>
    public async Task<List<ComponentCompatibilityDto>> GetCompatibleTargetsAsync(Guid sourceComponentId)
    {
        // Kiểm tra Source Component tồn tại
        var sourceComponent = await _productRepository.GetByIdAsync(sourceComponentId);
        if (sourceComponent == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Component có ID: {sourceComponentId}");
        }

        var compatibilities = await _compatibilityRepository.GetCompatibleTargetsAsync(sourceComponentId);
        return compatibilities.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Lấy danh sách các phụ kiện tương thích với một thiết bị (Target <- Sources)
    /// Ví dụ: Máy PDA này sử dụng được pin/phụ kiện nào?
    /// </summary>
    public async Task<List<ComponentCompatibilityDto>> GetCompatibleAccessoriesAsync(Guid targetComponentId)
    {
        // Kiểm tra Target Component tồn tại
        var targetComponent = await _productRepository.GetByIdAsync(targetComponentId);
        if (targetComponent == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Component có ID: {targetComponentId}");
        }

        var compatibilities = await _compatibilityRepository.GetCompatibleAccessoriesAsync(targetComponentId);
        return compatibilities.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Lấy một compatibility record cụ thể
    /// </summary>
    public async Task<ComponentCompatibilityDto?> GetByIdsAsync(Guid sourceId, Guid targetId)
    {
        var compatibility = await _compatibilityRepository.GetByIdsAsync(sourceId, targetId);
        return compatibility == null ? null : MapToDto(compatibility);
    }

    /// <summary>
    /// Tạo một compatibility mới
    /// </summary>
    public async Task<ComponentCompatibilityDto> CreateAsync(CreateComponentCompatibilityDto dto)
    {
        // Validate: Source và Target không được giống nhau
        if (dto.SourceComponentID == dto.TargetComponentID)
        {
            throw new InvalidOperationException("Source Component và Target Component không được giống nhau");
        }

        // Kiểm tra Source Component tồn tại
        var sourceComponent = await _productRepository.GetByIdAsync(dto.SourceComponentID);
        if (sourceComponent == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Source Component có ID: {dto.SourceComponentID}");
        }

        // Kiểm tra Target Component tồn tại
        var targetComponent = await _productRepository.GetByIdAsync(dto.TargetComponentID);
        if (targetComponent == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Target Component có ID: {dto.TargetComponentID}");
        }

        // Kiểm tra xem compatibility đã tồn tại chưa
        var exists = await _compatibilityRepository.ExistsAsync(dto.SourceComponentID, dto.TargetComponentID);
        if (exists)
        {
            throw new InvalidOperationException(
                $"Compatibility giữa {sourceComponent.ComponentName} và {targetComponent.ComponentName} đã tồn tại");
        }

        // Tạo entity
        var compatibility = new ComponentCompatibility
        {
            SourceComponentID = dto.SourceComponentID,
            TargetComponentID = dto.TargetComponentID,
            Note = dto.Note
        };

        // Lưu vào DB
        var createdCompatibility = await _compatibilityRepository.AddAsync(compatibility);

        // Load navigation properties để trả về DTO đầy đủ
        var result = await _compatibilityRepository.GetByIdsAsync(createdCompatibility.SourceComponentID, createdCompatibility.TargetComponentID);
        return MapToDto(result!);
    }

    /// <summary>
    /// Tạo nhiều compatibilities cùng lúc (batch)
    /// </summary>
    public async Task<List<ComponentCompatibilityDto>> CreateBatchAsync(CompatibilityBatchCreateDto dto)
    {
        // Kiểm tra Source Component tồn tại
        var sourceComponent = await _productRepository.GetByIdAsync(dto.SourceComponentID);
        if (sourceComponent == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Source Component có ID: {dto.SourceComponentID}");
        }

        // Validate: TargetComponentIDs không chứa SourceComponentID
        if (dto.TargetComponentIDs.Contains(dto.SourceComponentID))
        {
            throw new InvalidOperationException("Danh sách Target Components không được chứa Source Component");
        }

        // Kiểm tra tất cả Target Components tồn tại
        var targetComponents = new List<Component>();
        foreach (var targetId in dto.TargetComponentIDs)
        {
            var targetComponent = await _productRepository.GetByIdAsync(targetId);
            if (targetComponent == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Target Component có ID: {targetId}");
            }
            targetComponents.Add(targetComponent);
        }

        // Lọc ra các compatibilities chưa tồn tại
        var newCompatibilities = new List<ComponentCompatibility>();
        foreach (var targetId in dto.TargetComponentIDs)
        {
            var exists = await _compatibilityRepository.ExistsAsync(dto.SourceComponentID, targetId);
            if (!exists)
            {
                newCompatibilities.Add(new ComponentCompatibility
                {
                    SourceComponentID = dto.SourceComponentID,
                    TargetComponentID = targetId,
                    Note = dto.Note
                });
            }
        }

        // Nếu tất cả đều đã tồn tại
        if (newCompatibilities.Count == 0)
        {
            throw new InvalidOperationException("Tất cả các Compatibility đã tồn tại");
        }

        // Lưu batch
        await _compatibilityRepository.AddRangeAsync(newCompatibilities);

        // Lấy lại danh sách vừa tạo để trả về với navigation properties
        var result = await _compatibilityRepository.GetCompatibleTargetsAsync(dto.SourceComponentID);
        return result.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Cập nhật compatibility (chỉ có Note)
    /// </summary>
    public async Task<ComponentCompatibilityDto> UpdateAsync(Guid sourceId, Guid targetId, UpdateComponentCompatibilityDto dto)
    {
        var compatibility = await _compatibilityRepository.GetByIdsAsync(sourceId, targetId);
        if (compatibility == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy Compatibility giữa SourceID: {sourceId} và TargetID: {targetId}");
        }

        // Cập nhật Note
        compatibility.Note = dto.Note;

        // Lưu
        var updatedCompatibility = await _compatibilityRepository.UpdateAsync(compatibility);

        // Load lại để trả về đầy đủ navigation properties
        var result = await _compatibilityRepository.GetByIdsAsync(updatedCompatibility.SourceComponentID, updatedCompatibility.TargetComponentID);
        return MapToDto(result!);
    }

    /// <summary>
    /// Xóa một compatibility
    /// </summary>
    public async Task<bool> DeleteAsync(Guid sourceId, Guid targetId)
    {
        return await _compatibilityRepository.DeleteAsync(sourceId, targetId);
    }

    /// <summary>
    /// Xóa tất cả compatibilities của một Source Component
    /// </summary>
    public async Task<int> DeleteBySourceAsync(Guid sourceComponentId)
    {
        return await _compatibilityRepository.DeleteBySourceAsync(sourceComponentId);
    }

    /// <summary>
    /// Xóa tất cả compatibilities của một Target Component
    /// </summary>
    public async Task<int> DeleteByTargetAsync(Guid targetComponentId)
    {
        return await _compatibilityRepository.DeleteByTargetAsync(targetComponentId);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm số lượng Target Devices của một Source Component
    /// </summary>
    public async Task<int> CountTargetsAsync(Guid sourceComponentId)
    {
        return await _compatibilityRepository.CountTargetsAsync(sourceComponentId);
    }

    /// <summary>
    /// Đếm số lượng Source Accessories của một Target Device
    /// </summary>
    public async Task<int> CountAccessoriesAsync(Guid targetComponentId)
    {
        return await _compatibilityRepository.CountAccessoriesAsync(targetComponentId);
    }

    #endregion

    #region Mapping

    /// <summary>
    /// Map từ Entity sang DTO
    /// </summary>
    private static ComponentCompatibilityDto MapToDto(ComponentCompatibility compatibility)
    {
        return new ComponentCompatibilityDto
        {
            SourceComponentID = compatibility.SourceComponentID,
            SourceComponentName = compatibility.SourceComponent.ComponentName,
            SourceComponentSKU = compatibility.SourceComponent.SKU,
            TargetComponentID = compatibility.TargetComponentID,
            TargetComponentName = compatibility.TargetComponent.ComponentName,
            TargetComponentSKU = compatibility.TargetComponent.SKU,
            Note = compatibility.Note
        };
    }

    #endregion
}

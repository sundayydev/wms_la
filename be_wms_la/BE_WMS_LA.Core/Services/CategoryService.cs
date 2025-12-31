using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Category;
using BE_WMS_LA.Shared.DTOs.Common;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý danh mục sản phẩm
/// </summary>
public class CategoryService
{
    private readonly CategoryRepository _categoryRepository;

    public CategoryService(CategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả danh mục
    /// </summary>
    /// <param name="includeDeleted">Bao gồm danh mục đã xóa</param>
    public async Task<ApiResponse<List<CategoryListDto>>> GetAllAsync(bool includeDeleted = false)
    {
        var categories = await _categoryRepository.GetAllAsync(includeDeleted);

        var dtos = categories.Select(c => new CategoryListDto
        {
            CategoryID = c.CategoryID,
            CategoryName = c.CategoryName,
            ComponentCount = c.Components?.Count(comp => comp.DeletedAt == null) ?? 0,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return ApiResponse<List<CategoryListDto>>.SuccessResponse(
            dtos,
            $"Lấy danh sách thành công ({dtos.Count} danh mục)");
    }

    /// <summary>
    /// Lấy chi tiết danh mục theo ID
    /// </summary>
    public async Task<ApiResponse<CategoryDetailDto>> GetByIdAsync(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category == null)
        {
            return ApiResponse<CategoryDetailDto>.ErrorResponse("Không tìm thấy danh mục");
        }

        var dto = MapToDetailDto(category);
        return ApiResponse<CategoryDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo danh mục mới
    /// </summary>
    public async Task<ApiResponse<CategoryDetailDto>> CreateAsync(CreateCategoryDto dto)
    {
        // Kiểm tra tên danh mục đã tồn tại
        var exists = await _categoryRepository.ExistsByNameAsync(dto.CategoryName);
        if (exists)
        {
            return ApiResponse<CategoryDetailDto>.ErrorResponse("Tên danh mục đã tồn tại");
        }

        // Tạo danh mục mới
        var category = new Category
        {
            CategoryID = Guid.NewGuid(),
            CategoryName = dto.CategoryName
        };

        await _categoryRepository.AddAsync(category);

        return await GetByIdAsync(category.CategoryID);
    }

    /// <summary>
    /// Cập nhật danh mục
    /// </summary>
    public async Task<ApiResponse<CategoryDetailDto>> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category == null)
        {
            return ApiResponse<CategoryDetailDto>.ErrorResponse("Không tìm thấy danh mục");
        }

        // Kiểm tra tên danh mục trùng lặp (nếu có thay đổi)
        if (dto.CategoryName != category.CategoryName)
        {
            var exists = await _categoryRepository.ExistsByNameAsync(dto.CategoryName, id);
            if (exists)
            {
                return ApiResponse<CategoryDetailDto>.ErrorResponse("Tên danh mục đã tồn tại");
            }
        }

        // Cập nhật các trường
        category.CategoryName = dto.CategoryName;

        await _categoryRepository.UpdateAsync(category);

        return await GetByIdAsync(category.CategoryID);
    }

    /// <summary>
    /// Xóa danh mục (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);

        if (category == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy danh mục");
        }

        // Kiểm tra xem có sản phẩm liên quan không
        var hasComponents = await _categoryRepository.HasComponentsAsync(id);

        if (hasComponents)
        {
            return ApiResponse<bool>.ErrorResponse(
                "Không thể xóa danh mục đang có sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.");
        }

        var success = await _categoryRepository.SoftDeleteAsync(id);

        if (success)
        {
            return ApiResponse<bool>.SuccessResponse(true, "Xóa danh mục thành công");
        }

        return ApiResponse<bool>.ErrorResponse("Xóa danh mục thất bại");
    }

    /// <summary>
    /// Khôi phục danh mục đã xóa
    /// </summary>
    public async Task<ApiResponse<bool>> RestoreAsync(Guid id)
    {
        var success = await _categoryRepository.RestoreAsync(id);

        if (success)
        {
            return ApiResponse<bool>.SuccessResponse(true, "Khôi phục danh mục thành công");
        }

        return ApiResponse<bool>.ErrorResponse("Không tìm thấy danh mục đã xóa");
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê danh mục
    /// </summary>
    public async Task<ApiResponse<object>> GetStatisticsAsync()
    {
        var total = await _categoryRepository.CountAsync();
        var withComponents = await _categoryRepository.CountWithComponentsAsync();
        var emptyCategories = await _categoryRepository.CountEmptyAsync();
        var topCategories = await _categoryRepository.GetTopCategoriesByComponentCountAsync(5);

        var stats = new
        {
            Total = total,
            WithComponents = withComponents,
            EmptyCategories = emptyCategories,
            TopCategories = topCategories.Select(c => new
            {
                c.CategoryName,
                ComponentCount = c.Components?.Count(comp => comp.DeletedAt == null) ?? 0
            }).ToList()
        };

        return ApiResponse<object>.SuccessResponse(stats);
    }

    #endregion

    #region Validation

    /// <summary>
    /// Kiểm tra tên danh mục đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckNameExistsAsync(string name, Guid? excludeId = null)
    {
        var exists = await _categoryRepository.ExistsByNameAsync(name, excludeId);
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    #endregion

    #region Private Methods

    private static CategoryDetailDto MapToDetailDto(Category category)
    {
        return new CategoryDetailDto
        {
            CategoryID = category.CategoryID,
            CategoryName = category.CategoryName,
            ComponentCount = category.Components?.Count(c => c.DeletedAt == null) ?? 0,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt,
            DeletedAt = category.DeletedAt
        };
    }

    #endregion
}

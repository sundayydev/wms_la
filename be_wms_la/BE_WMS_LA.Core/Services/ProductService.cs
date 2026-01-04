using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Product;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý sản phẩm (Components)
/// </summary>
public class ProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    #region Product CRUD

    /// <summary>
    /// Lấy danh sách sản phẩm có phân trang và lọc
    /// </summary>
    public async Task<ApiResponse<List<ProductListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid? categoryId = null,
        bool? isSerialized = null)
    {
        var query = _context.Components
            .Include(c => c.Category)
            .Include(c => c.Variants)
            .Include(c => c.ProductInstances)
            .Where(c => c.DeletedAt == null)
            .AsQueryable();

        // Tìm kiếm theo từ khóa
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.SKU.ToLower().Contains(search) ||
                c.ComponentName.ToLower().Contains(search));
        }

        // Lọc theo danh mục
        if (categoryId.HasValue)
        {
            query = query.Where(c => c.CategoryID == categoryId.Value);
        }

        // Lọc theo loại quản lý
        if (isSerialized.HasValue)
        {
            query = query.Where(c => c.IsSerialized == isSerialized.Value);
        }

        var totalItems = await query.CountAsync();

        var products = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ProductListDto
            {
                ComponentID = c.ComponentID,
                SKU = c.SKU,
                ComponentName = c.ComponentName,
                CategoryName = c.Category != null ? c.Category.CategoryName : null,
                ImageURL = c.ImageURL,
                Unit = c.Unit,
                BasePrice = c.BasePrice,
                SellPrice = c.SellPrice,
                IsSerialized = c.IsSerialized,
                VariantCount = c.Variants.Count(v => v.DeletedAt == null),
                TotalStock = c.ProductInstances.Count(i => i.DeletedAt == null && i.Status == "IN_STOCK"),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<ProductListDto>>.SuccessResponse(products, $"Lấy danh sách thành công ({totalItems} kết quả)");
    }

    /// <summary>
    /// Lấy danh sách sản phẩm cho dropdown
    /// </summary>
    public async Task<ApiResponse<List<ProductListDto>>> GetAllForSelectAsync()
    {
        var products = await _context.Components
            .Include(c => c.Category)
            .Where(c => c.DeletedAt == null)
            .OrderBy(c => c.ComponentName)
            .Select(c => new ProductListDto
            {
                ComponentID = c.ComponentID,
                SKU = c.SKU,
                ComponentName = c.ComponentName,
                CategoryName = c.Category != null ? c.Category.CategoryName : null,
                ImageURL = c.ImageURL,
                Unit = c.Unit,
                BasePrice = c.BasePrice,
                SellPrice = c.SellPrice,
                IsSerialized = c.IsSerialized,
                VariantCount = 0,
                TotalStock = 0,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<ProductListDto>>.SuccessResponse(products);
    }

    /// <summary>
    /// Lấy chi tiết sản phẩm
    /// </summary>
    public async Task<ApiResponse<ProductDetailDto>> GetByIdAsync(Guid id)
    {
        var component = await _context.Components
            .Include(c => c.Category)
            .Include(c => c.Supplier)
            .Include(c => c.Variants.Where(v => v.DeletedAt == null))
            .Include(c => c.ProductInstances.Where(i => i.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.ComponentID == id && c.DeletedAt == null);

        if (component == null)
        {
            return ApiResponse<ProductDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        var dto = MapToDetailDto(component);
        return ApiResponse<ProductDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Lấy sản phẩm theo SKU
    /// </summary>
    public async Task<ApiResponse<ProductDetailDto>> GetBySKUAsync(string sku)
    {
        var component = await _context.Components
            .Include(c => c.Category)
            .Include(c => c.Supplier)
            .Include(c => c.Variants.Where(v => v.DeletedAt == null))
            .Include(c => c.ProductInstances.Where(i => i.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.SKU == sku && c.DeletedAt == null);

        if (component == null)
        {
            return ApiResponse<ProductDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        var dto = MapToDetailDto(component);
        return ApiResponse<ProductDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo sản phẩm mới
    /// </summary>
    public async Task<ApiResponse<ProductDetailDto>> CreateAsync(CreateProductDto dto)
    {
        // Kiểm tra SKU đã tồn tại
        var existingSKU = await _context.Components
            .FirstOrDefaultAsync(c => c.SKU == dto.SKU && c.DeletedAt == null);

        if (existingSKU != null)
        {
            return ApiResponse<ProductDetailDto>.ErrorResponse("Mã SKU đã tồn tại");
        }

        // Kiểm tra CategoryID hợp lệ (nếu có)
        if (dto.CategoryID.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryID == dto.CategoryID.Value && c.DeletedAt == null);
            if (!categoryExists)
            {
                return ApiResponse<ProductDetailDto>.ErrorResponse("Danh mục không tồn tại");
            }
        }

        // Kiểm tra SupplierID hợp lệ (nếu có)
        if (dto.SupplierID.HasValue)
        {
            var supplierExists = await _context.Suppliers
                .AnyAsync(s => s.SupplierID == dto.SupplierID.Value && s.DeletedAt == null);
            if (!supplierExists)
            {
                return ApiResponse<ProductDetailDto>.ErrorResponse("Nhà cung cấp không tồn tại");
            }
        }

        var component = new Component
        {
            ComponentID = Guid.NewGuid(),
            SKU = dto.SKU,
            ComponentName = dto.ComponentName,
            ComponentNameVN = dto.ComponentNameVN,
            CategoryID = dto.CategoryID,
            SupplierID = dto.SupplierID,
            ProductType = dto.ProductType,
            Brand = dto.Brand,
            Model = dto.Model,
            ManufacturerSKU = dto.ManufacturerSKU,
            Barcode = dto.Barcode,
            Unit = dto.Unit,
            ImageURL = dto.ImageURL,
            ImageGallery = dto.ImageGallery,
            BasePrice = dto.BasePrice,
            SellPrice = dto.SellPrice,
            WholesalePrice = dto.WholesalePrice,
            IsSerialized = dto.IsSerialized,
            MinStockLevel = dto.MinStockLevel,
            MaxStockLevel = dto.MaxStockLevel,
            DefaultWarrantyMonths = dto.DefaultWarrantyMonths,
            Weight = dto.Weight,
            Length = dto.Length,
            Width = dto.Width,
            Height = dto.Height,
            Specifications = dto.Specifications,
            Tags = dto.Tags,
            Documents = dto.Documents,
            Competitors = dto.Competitors,
            CompatibleWith = dto.CompatibleWith,
            Status = dto.Status,
            ShortDescription = dto.ShortDescription,
            FullDescription = dto.FullDescription,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Components.AddAsync(component);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(component.ComponentID);
    }

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    public async Task<ApiResponse<ProductDetailDto>> UpdateAsync(Guid id, UpdateProductDto dto)
    {
        var component = await _context.Components
            .FirstOrDefaultAsync(c => c.ComponentID == id && c.DeletedAt == null);

        if (component == null)
        {
            return ApiResponse<ProductDetailDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        // Kiểm tra CategoryID hợp lệ (nếu cập nhật)
        if (dto.CategoryID.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryID == dto.CategoryID.Value && c.DeletedAt == null);
            if (!categoryExists)
            {
                return ApiResponse<ProductDetailDto>.ErrorResponse("Danh mục không tồn tại");
            }
        }

        // Kiểm tra SupplierID hợp lệ (nếu cập nhật)
        if (dto.SupplierID.HasValue)
        {
            var supplierExists = await _context.Suppliers
                .AnyAsync(s => s.SupplierID == dto.SupplierID.Value && s.DeletedAt == null);
            if (!supplierExists)
            {
                return ApiResponse<ProductDetailDto>.ErrorResponse("Nhà cung cấp không tồn tại");
            }
        }

        // Cập nhật các trường
        if (!string.IsNullOrEmpty(dto.ComponentName)) component.ComponentName = dto.ComponentName;
        if (dto.ComponentNameVN != null) component.ComponentNameVN = dto.ComponentNameVN;
        if (dto.CategoryID.HasValue) component.CategoryID = dto.CategoryID;
        if (dto.SupplierID.HasValue) component.SupplierID = dto.SupplierID;
        if (dto.ProductType != null) component.ProductType = dto.ProductType;
        if (dto.Brand != null) component.Brand = dto.Brand;
        if (dto.Model != null) component.Model = dto.Model;
        if (dto.ManufacturerSKU != null) component.ManufacturerSKU = dto.ManufacturerSKU;
        if (dto.Barcode != null) component.Barcode = dto.Barcode;
        if (dto.Unit != null) component.Unit = dto.Unit;
        if (dto.ImageURL != null) component.ImageURL = dto.ImageURL;
        if (dto.ImageGallery != null) component.ImageGallery = dto.ImageGallery;
        if (dto.BasePrice.HasValue) component.BasePrice = dto.BasePrice;
        if (dto.SellPrice.HasValue) component.SellPrice = dto.SellPrice;
        if (dto.WholesalePrice.HasValue) component.WholesalePrice = dto.WholesalePrice;
        if (dto.IsSerialized.HasValue) component.IsSerialized = dto.IsSerialized.Value;
        if (dto.MinStockLevel.HasValue) component.MinStockLevel = dto.MinStockLevel.Value;
        if (dto.MaxStockLevel.HasValue) component.MaxStockLevel = dto.MaxStockLevel;
        if (dto.DefaultWarrantyMonths.HasValue) component.DefaultWarrantyMonths = dto.DefaultWarrantyMonths.Value;
        if (dto.Weight.HasValue) component.Weight = dto.Weight;
        if (dto.Length.HasValue) component.Length = dto.Length;
        if (dto.Width.HasValue) component.Width = dto.Width;
        if (dto.Height.HasValue) component.Height = dto.Height;
        if (dto.Specifications != null) component.Specifications = dto.Specifications;
        if (dto.Tags != null) component.Tags = dto.Tags;
        if (dto.Documents != null) component.Documents = dto.Documents;
        if (dto.Competitors != null) component.Competitors = dto.Competitors;
        if (dto.CompatibleWith != null) component.CompatibleWith = dto.CompatibleWith;
        if (dto.Status != null) component.Status = dto.Status;
        if (dto.ShortDescription != null) component.ShortDescription = dto.ShortDescription;
        if (dto.FullDescription != null) component.FullDescription = dto.FullDescription;

        component.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(component.ComponentID);
    }

    /// <summary>
    /// Xóa sản phẩm (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var component = await _context.Components
            .Include(c => c.ProductInstances)
            .FirstOrDefaultAsync(c => c.ComponentID == id && c.DeletedAt == null);

        if (component == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        // Kiểm tra có instance đang sử dụng không
        var hasActiveInstances = component.ProductInstances
            .Any(i => i.DeletedAt == null && i.Status != "SCRAPPED");

        if (hasActiveInstances)
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa sản phẩm đang có hàng tồn kho");
        }

        component.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Xóa sản phẩm thành công");
    }

    #endregion

    #region Variant CRUD

    /// <summary>
    /// Tạo biến thể mới
    /// </summary>
    public async Task<ApiResponse<ProductVariantDto>> CreateVariantAsync(CreateVariantDto dto)
    {
        // Kiểm tra Component tồn tại
        var component = await _context.Components
            .FirstOrDefaultAsync(c => c.ComponentID == dto.ComponentID && c.DeletedAt == null);

        if (component == null)
        {
            return ApiResponse<ProductVariantDto>.ErrorResponse("Không tìm thấy sản phẩm");
        }

        // Kiểm tra Part Number đã tồn tại
        var existingPN = await _context.ComponentVariants
            .FirstOrDefaultAsync(v => v.PartNumber == dto.PartNumber && v.DeletedAt == null);

        if (existingPN != null)
        {
            return ApiResponse<ProductVariantDto>.ErrorResponse("Mã Part Number đã tồn tại");
        }

        var variant = new ComponentVariant
        {
            VariantID = Guid.NewGuid(),
            ComponentID = dto.ComponentID,
            PartNumber = dto.PartNumber,
            VariantName = dto.VariantName,
            VariantDescription = dto.VariantDescription,
            VariantSpecs = dto.VariantSpecs,
            BasePrice = dto.BasePrice,
            SellPrice = dto.SellPrice,
            WholesalePrice = dto.WholesalePrice,
            Barcode = dto.Barcode,
            MinStockLevel = dto.MinStockLevel,
            MaxStockLevel = dto.MaxStockLevel,
            IsActive = dto.IsActive,
            IsDefault = dto.IsDefault,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Nếu là default, bỏ flag default của các biến thể khác
        if (dto.IsDefault)
        {
            var otherVariants = await _context.ComponentVariants
                .Where(v => v.ComponentID == dto.ComponentID && v.IsDefault && v.DeletedAt == null)
                .ToListAsync();

            foreach (var v in otherVariants)
            {
                v.IsDefault = false;
            }
        }

        await _context.ComponentVariants.AddAsync(variant);
        await _context.SaveChangesAsync();

        return ApiResponse<ProductVariantDto>.SuccessResponse(MapVariantToDto(variant), "Tạo biến thể thành công");
    }

    /// <summary>
    /// Cập nhật biến thể
    /// </summary>
    public async Task<ApiResponse<ProductVariantDto>> UpdateVariantAsync(Guid variantId, UpdateVariantDto dto)
    {
        var variant = await _context.ComponentVariants
            .FirstOrDefaultAsync(v => v.VariantID == variantId && v.DeletedAt == null);

        if (variant == null)
        {
            return ApiResponse<ProductVariantDto>.ErrorResponse("Không tìm thấy biến thể");
        }

        // Cập nhật các trường
        if (dto.VariantName != null) variant.VariantName = dto.VariantName;
        if (dto.VariantDescription != null) variant.VariantDescription = dto.VariantDescription;
        if (dto.VariantSpecs != null) variant.VariantSpecs = dto.VariantSpecs;
        if (dto.BasePrice.HasValue) variant.BasePrice = dto.BasePrice;
        if (dto.SellPrice.HasValue) variant.SellPrice = dto.SellPrice;
        if (dto.WholesalePrice.HasValue) variant.WholesalePrice = dto.WholesalePrice;
        if (dto.Barcode != null) variant.Barcode = dto.Barcode;
        if (dto.MinStockLevel.HasValue) variant.MinStockLevel = dto.MinStockLevel.Value;
        if (dto.MaxStockLevel.HasValue) variant.MaxStockLevel = dto.MaxStockLevel;
        if (dto.IsActive.HasValue) variant.IsActive = dto.IsActive.Value;

        // Xử lý IsDefault
        if (dto.IsDefault.HasValue && dto.IsDefault.Value && !variant.IsDefault)
        {
            var otherVariants = await _context.ComponentVariants
                .Where(v => v.ComponentID == variant.ComponentID && v.IsDefault && v.DeletedAt == null)
                .ToListAsync();

            foreach (var v in otherVariants)
            {
                v.IsDefault = false;
            }
            variant.IsDefault = true;
        }
        else if (dto.IsDefault.HasValue)
        {
            variant.IsDefault = dto.IsDefault.Value;
        }

        variant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<ProductVariantDto>.SuccessResponse(MapVariantToDto(variant), "Cập nhật biến thể thành công");
    }

    /// <summary>
    /// Xóa biến thể (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteVariantAsync(Guid variantId)
    {
        var variant = await _context.ComponentVariants
            .Include(v => v.ProductInstances)
            .FirstOrDefaultAsync(v => v.VariantID == variantId && v.DeletedAt == null);

        if (variant == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy biến thể");
        }

        // Kiểm tra có instance đang sử dụng không
        var hasActiveInstances = variant.ProductInstances
            .Any(i => i.DeletedAt == null && i.Status != "SCRAPPED");

        if (hasActiveInstances)
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa biến thể đang có hàng tồn kho");
        }

        variant.DeletedAt = DateTime.UtcNow;
        variant.IsActive = false;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Xóa biến thể thành công");
    }

    #endregion

    #region Statistics & Validation

    /// <summary>
    /// Thống kê sản phẩm
    /// </summary>
    public async Task<ApiResponse<object>> GetStatisticsAsync()
    {
        var stats = new
        {
            TotalProducts = await _context.Components.CountAsync(c => c.DeletedAt == null),
            TotalVariants = await _context.ComponentVariants.CountAsync(v => v.DeletedAt == null),
            TotalInstances = await _context.ProductInstances.CountAsync(i => i.DeletedAt == null),
            InStock = await _context.ProductInstances.CountAsync(i => i.DeletedAt == null && i.Status == "IN_STOCK"),
            Sold = await _context.ProductInstances.CountAsync(i => i.DeletedAt == null && i.Status == "SOLD"),
            ByCategory = await _context.Components
                .Where(c => c.DeletedAt == null && c.CategoryID != null)
                .Include(c => c.Category)
                .GroupBy(c => c.Category!.CategoryName)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .ToListAsync()
        };

        return ApiResponse<object>.SuccessResponse(stats);
    }

    /// <summary>
    /// Kiểm tra SKU đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckSKUExistsAsync(string sku, Guid? excludeId = null)
    {
        var query = _context.Components
            .Where(c => c.SKU == sku && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.ComponentID != excludeId.Value);
        }

        var exists = await query.AnyAsync();
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    /// <summary>
    /// Kiểm tra Part Number đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckPartNumberExistsAsync(string partNumber, Guid? excludeId = null)
    {
        var query = _context.ComponentVariants
            .Where(v => v.PartNumber == partNumber && v.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(v => v.VariantID != excludeId.Value);
        }

        var exists = await query.AnyAsync();
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    #endregion

    #region Categories

    /// <summary>
    /// Lấy danh sách danh mục
    /// </summary>
    public async Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync()
    {
        var categories = await _context.Categories
            .Where(c => c.DeletedAt == null)
            .OrderBy(c => c.CategoryName)
            .Select(c => new CategoryDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                ProductCount = c.Components.Count(p => p.DeletedAt == null)
            })
            .ToListAsync();

        return ApiResponse<List<CategoryDto>>.SuccessResponse(categories);
    }

    #endregion

    #region Private Methods

    private ProductDetailDto MapToDetailDto(Component component)
    {
        return new ProductDetailDto
        {
            ComponentID = component.ComponentID,
            SKU = component.SKU,
            ComponentName = component.ComponentName,
            ComponentNameVN = component.ComponentNameVN,
            CategoryID = component.CategoryID,
            CategoryName = component.Category?.CategoryName,
            SupplierID = component.SupplierID,
            SupplierName = component.Supplier?.SupplierName,
            ProductType = component.ProductType,
            Brand = component.Brand,
            Model = component.Model,
            ManufacturerSKU = component.ManufacturerSKU,
            Barcode = component.Barcode,
            Unit = component.Unit,
            ImageURL = component.ImageURL,
            ImageGallery = component.ImageGallery,
            BasePrice = component.BasePrice,
            SellPrice = component.SellPrice,
            WholesalePrice = component.WholesalePrice,
            IsSerialized = component.IsSerialized,
            MinStockLevel = component.MinStockLevel,
            MaxStockLevel = component.MaxStockLevel,
            DefaultWarrantyMonths = component.DefaultWarrantyMonths,
            Weight = component.Weight,
            Length = component.Length,
            Width = component.Width,
            Height = component.Height,
            Specifications = component.Specifications,
            Tags = component.Tags,
            Documents = component.Documents,
            Competitors = component.Competitors,
            CompatibleWith = component.CompatibleWith,
            Status = component.Status,
            ShortDescription = component.ShortDescription,
            FullDescription = component.FullDescription,
            CreatedAt = component.CreatedAt,
            UpdatedAt = component.UpdatedAt,
            VariantCount = component.Variants.Count,
            TotalStock = component.ProductInstances.Count(i => i.Status == "IN_STOCK"),
            Variants = component.Variants
                .OrderBy(v => v.SortOrder)
                .Select(v => MapVariantToDto(v))
                .ToList()
        };
    }

    private ProductVariantDto MapVariantToDto(ComponentVariant variant)
    {
        return new ProductVariantDto
        {
            VariantID = variant.VariantID,
            PartNumber = variant.PartNumber,
            VariantName = variant.VariantName,
            VariantDescription = variant.VariantDescription,
            VariantSpecs = variant.VariantSpecs,
            BasePrice = variant.BasePrice,
            SellPrice = variant.SellPrice,
            WholesalePrice = variant.WholesalePrice,
            Barcode = variant.Barcode,
            MinStockLevel = variant.MinStockLevel,
            MaxStockLevel = variant.MaxStockLevel,
            IsActive = variant.IsActive,
            IsDefault = variant.IsDefault,
            SortOrder = variant.SortOrder,
            StockCount = variant.ProductInstances?.Count(i => i.DeletedAt == null && i.Status == "IN_STOCK") ?? 0
        };
    }

    #endregion
}

/// <summary>
/// DTO danh mục sản phẩm
/// </summary>
public class CategoryDto
{
    public Guid CategoryID { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

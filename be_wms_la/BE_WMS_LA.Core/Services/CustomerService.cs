using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Customer;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý khách hàng - xử lý business logic
/// </summary>
public class CustomerService
{
    private readonly CustomerRepository _repository;

    public CustomerService(CustomerRepository repository)
    {
        _repository = repository;
    }

    #region Customer CRUD

    /// <summary>
    /// Lấy danh sách khách hàng có phân trang và lọc
    /// </summary>
    public async Task<ApiResponse<List<CustomerListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        string? type = null,
        string? customerGroup = null,
        bool? isActive = null)
    {
        var customers = await _repository.GetAllAsync(search, type, customerGroup, isActive);
        var totalItems = customers.Count;

        var result = customers
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToListDto)
            .ToList();

        return ApiResponse<List<CustomerListDto>>.SuccessResponse(result, $"Lấy danh sách thành công ({totalItems} kết quả)");
    }

    /// <summary>
    /// Lấy danh sách khách hàng cho dropdown
    /// </summary>
    public async Task<ApiResponse<List<CustomerListDto>>> GetAllForSelectAsync()
    {
        var customers = await _repository.GetAllActiveAsync();
        var result = customers.Select(MapToListDto).ToList();
        return ApiResponse<List<CustomerListDto>>.SuccessResponse(result);
    }

    /// <summary>
    /// Lấy chi tiết khách hàng
    /// </summary>
    public async Task<ApiResponse<CustomerDetailDto>> GetByIdAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer == null)
        {
            return ApiResponse<CustomerDetailDto>.ErrorResponse("Không tìm thấy khách hàng");
        }

        var dto = MapToDetailDto(customer);
        return ApiResponse<CustomerDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Lấy khách hàng theo mã
    /// </summary>
    public async Task<ApiResponse<CustomerDetailDto>> GetByCodeAsync(string code)
    {
        var customer = await _repository.GetByCodeAsync(code);
        if (customer == null)
        {
            return ApiResponse<CustomerDetailDto>.ErrorResponse("Không tìm thấy khách hàng");
        }

        var dto = MapToDetailDto(customer);
        return ApiResponse<CustomerDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo khách hàng mới
    /// </summary>
    public async Task<ApiResponse<CustomerDetailDto>> CreateAsync(CreateCustomerDto dto)
    {
        // Tự sinh mã nếu không nhập
        var customerCode = dto.CustomerCode;
        if (string.IsNullOrEmpty(customerCode))
        {
            customerCode = await GenerateCustomerCodeAsync(dto.Type);
        }
        else
        {
            // Kiểm tra mã đã tồn tại
            if (await _repository.ExistsByCodeAsync(customerCode))
            {
                return ApiResponse<CustomerDetailDto>.ErrorResponse("Mã khách hàng đã tồn tại");
            }
        }

        // Kiểm tra email trùng
        if (!string.IsNullOrEmpty(dto.Email))
        {
            if (await _repository.ExistsByEmailAsync(dto.Email))
            {
                return ApiResponse<CustomerDetailDto>.ErrorResponse("Email đã tồn tại trong hệ thống");
            }
        }

        // Kiểm tra SĐT trùng
        if (!string.IsNullOrEmpty(dto.PhoneNumber))
        {
            if (await _repository.ExistsByPhoneAsync(dto.PhoneNumber))
            {
                return ApiResponse<CustomerDetailDto>.ErrorResponse("Số điện thoại đã tồn tại trong hệ thống");
            }
        }

        var customer = new Customer
        {
            CustomerID = Guid.NewGuid(),
            CustomerCode = customerCode,
            CustomerName = dto.CustomerName,
            Type = dto.Type,
            CustomerGroup = dto.CustomerGroup,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Address = dto.Address,
            City = dto.City,
            District = dto.District,
            Ward = dto.Ward,
            TaxCode = dto.TaxCode,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Notes = dto.Notes,
            IsActive = true
        };

        await _repository.AddAsync(customer);
        return await GetByIdAsync(customer.CustomerID);
    }

    /// <summary>
    /// Cập nhật khách hàng
    /// </summary>
    public async Task<ApiResponse<CustomerDetailDto>> UpdateAsync(Guid id, UpdateCustomerDto dto)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer == null)
        {
            return ApiResponse<CustomerDetailDto>.ErrorResponse("Không tìm thấy khách hàng");
        }

        // Kiểm tra email trùng
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != customer.Email)
        {
            if (await _repository.ExistsByEmailAsync(dto.Email, id))
            {
                return ApiResponse<CustomerDetailDto>.ErrorResponse("Email đã tồn tại trong hệ thống");
            }
        }

        // Kiểm tra SĐT trùng
        if (!string.IsNullOrEmpty(dto.PhoneNumber) && dto.PhoneNumber != customer.PhoneNumber)
        {
            if (await _repository.ExistsByPhoneAsync(dto.PhoneNumber, id))
            {
                return ApiResponse<CustomerDetailDto>.ErrorResponse("Số điện thoại đã tồn tại trong hệ thống");
            }
        }

        // Cập nhật các trường
        if (!string.IsNullOrEmpty(dto.CustomerName)) customer.CustomerName = dto.CustomerName;
        if (dto.Type != null) customer.Type = dto.Type;
        if (dto.CustomerGroup != null) customer.CustomerGroup = dto.CustomerGroup;
        if (dto.PhoneNumber != null) customer.PhoneNumber = dto.PhoneNumber;
        if (dto.Email != null) customer.Email = dto.Email;
        if (dto.Address != null) customer.Address = dto.Address;
        if (dto.City != null) customer.City = dto.City;
        if (dto.District != null) customer.District = dto.District;
        if (dto.Ward != null) customer.Ward = dto.Ward;
        if (dto.TaxCode != null) customer.TaxCode = dto.TaxCode;
        if (dto.DateOfBirth.HasValue) customer.DateOfBirth = dto.DateOfBirth;
        if (dto.Gender != null) customer.Gender = dto.Gender;
        if (dto.Notes != null) customer.Notes = dto.Notes;

        await _repository.UpdateAsync(customer);
        return await GetByIdAsync(customer.CustomerID);
    }

    /// <summary>
    /// Xóa khách hàng (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy khách hàng");
        }

        // Kiểm tra có đơn hàng không
        if (await _repository.HasOrdersAsync(id))
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa khách hàng đang có đơn hàng. Vui lòng vô hiệu hóa thay vì xóa.");
        }

        await _repository.SoftDeleteAsync(id);
        return ApiResponse<bool>.SuccessResponse(true, "Xóa khách hàng thành công");
    }

    /// <summary>
    /// Bật/tắt trạng thái hoạt động
    /// </summary>
    public async Task<ApiResponse<CustomerDetailDto>> ToggleStatusAsync(Guid id, bool isActive)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer == null)
        {
            return ApiResponse<CustomerDetailDto>.ErrorResponse("Không tìm thấy khách hàng");
        }

        customer.IsActive = isActive;
        await _repository.UpdateAsync(customer);
        return await GetByIdAsync(customer.CustomerID);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê khách hàng
    /// </summary>
    public async Task<ApiResponse<CustomerStatisticsDto>> GetStatisticsAsync()
    {
        var stats = new CustomerStatisticsDto
        {
            TotalCustomers = await _repository.CountAsync(),
            ActiveCustomers = await _repository.CountActiveAsync(),
            IndividualCustomers = await _repository.CountByTypeAsync("INDIVIDUAL"),
            CompanyCustomers = await _repository.CountByTypeAsync("COMPANY"),
            RetailCustomers = await _repository.CountByGroupAsync("RETAIL"),
            WholesaleCustomers = await _repository.CountByGroupAsync("WHOLESALE"),
            VIPCustomers = await _repository.CountByGroupAsync("VIP"),
            NewCustomersThisMonth = await _repository.CountNewThisMonthAsync()
        };

        return ApiResponse<CustomerStatisticsDto>.SuccessResponse(stats);
    }

    /// <summary>
    /// Kiểm tra mã khách hàng đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckCodeExistsAsync(string code, Guid? excludeId = null)
    {
        var exists = await _repository.ExistsByCodeAsync(code, excludeId);
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    #endregion

    #region Private Methods

    private async Task<string> GenerateCustomerCodeAsync(string type)
    {
        var prefix = type == "COMPANY" ? "CTY" : "KH";
        var year = DateTime.UtcNow.Year.ToString().Substring(2);
        var fullPrefix = $"{prefix}-{year}";

        var lastCode = await _repository.GetLastCodeByPrefixAsync(fullPrefix);

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(lastCode))
        {
            var parts = lastCode.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{fullPrefix}-{nextNumber:D4}";
    }

    private static CustomerListDto MapToListDto(Customer customer)
    {
        return new CustomerListDto
        {
            CustomerID = customer.CustomerID,
            CustomerCode = customer.CustomerCode,
            CustomerName = customer.CustomerName,
            Type = customer.Type,
            CustomerGroup = customer.CustomerGroup,
            PhoneNumber = customer.PhoneNumber,
            Email = customer.Email,
            City = customer.City,
            IsActive = customer.IsActive,
            OrderCount = customer.SalesOrders.Count(o => o.DeletedAt == null),
            TotalSpent = customer.SalesOrders
                .Where(o => o.DeletedAt == null && o.Status != "CANCELLED")
                .Sum(o => o.FinalAmount),
            CreatedAt = customer.CreatedAt
        };
    }

    private static CustomerDetailDto MapToDetailDto(Customer customer)
    {
        return new CustomerDetailDto
        {
            CustomerID = customer.CustomerID,
            CustomerCode = customer.CustomerCode,
            CustomerName = customer.CustomerName,
            Type = customer.Type,
            CustomerGroup = customer.CustomerGroup,
            PhoneNumber = customer.PhoneNumber,
            Email = customer.Email,
            Address = customer.Address,
            City = customer.City,
            District = customer.District,
            Ward = customer.Ward,
            TaxCode = customer.TaxCode,
            DateOfBirth = customer.DateOfBirth,
            Gender = customer.Gender,
            Notes = customer.Notes,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt,
            OrderCount = customer.SalesOrders.Count,
            TotalSpent = customer.SalesOrders
                .Where(o => o.Status != "CANCELLED")
                .Sum(o => o.FinalAmount),
            Contacts = customer.Contacts
                .OrderByDescending(c => c.IsDefaultReceiver)
                .Select(c => new CustomerContactDto
                {
                    ContactID = c.ContactID,
                    ContactName = c.ContactName,
                    Position = c.Position,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    IsPrimary = c.IsDefaultReceiver
                })
                .ToList()
        };
    }

    #endregion
}

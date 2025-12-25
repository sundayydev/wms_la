// Định nghĩa kiểu dữ liệu dựa trên bảng User của bạn
export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string; // UUID
  username: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | 'WAREHOUSE';
  isActive: boolean;
}

// Giả lập gọi API (Sau này thay bằng axios.post)
export const loginAPI = async (values: LoginRequest): Promise<{ token: string; user: UserInfo }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập dữ liệu trong DB
      if (values.username === 'admin' && values.password === '123456') {
        const mockUser: UserInfo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          username: 'admin',
          role: 'ADMIN',
          isActive: true, // Khớp với cột IsActive
        };

        if (!mockUser.isActive) {
          reject(new Error('Tài khoản của bạn đã bị khóa (IsActive = False).'));
          return;
        }

        resolve({
          token: 'fake-jwt-token-123456',
          user: mockUser,
        });
      } else {
        reject(new Error('Sai tên đăng nhập hoặc mật khẩu!'));
      }
    }, 1000); // Delay 1 giây cho giống thật
  });
};
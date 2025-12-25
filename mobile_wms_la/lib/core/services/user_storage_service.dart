import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/saved_user.dart';

/// Service quản lý lưu trữ danh sách user đã đăng nhập
class UserStorageService {
  static const String _savedUsersKey = 'saved_users';
  static const String _activeUserKey = 'active_user_id';
  static const int _maxSavedUsers = 5;

  static UserStorageService? _instance;
  SharedPreferences? _prefs;

  UserStorageService._();

  /// Singleton instance
  static UserStorageService get instance {
    _instance ??= UserStorageService._();
    return _instance!;
  }

  /// Khởi tạo SharedPreferences
  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  /// Lấy danh sách tất cả user đã lưu
  Future<List<SavedUser>> getSavedUsers() async {
    await init();
    final String? jsonStr = _prefs!.getString(_savedUsersKey);
    if (jsonStr == null || jsonStr.isEmpty) {
      return [];
    }

    try {
      final List<dynamic> jsonList = json.decode(jsonStr) as List<dynamic>;
      final activeUserId = await getActiveUserId();

      return jsonList
          .map((e) => SavedUser.fromJson(e as Map<String, dynamic>))
          .map((user) => user.copyWith(isActive: user.id == activeUserId))
          .toList()
        ..sort((a, b) => b.lastLoginAt.compareTo(a.lastLoginAt));
    } catch (e) {
      return [];
    }
  }

  /// Lấy ID của user đang active
  Future<String?> getActiveUserId() async {
    await init();
    return _prefs!.getString(_activeUserKey);
  }

  /// Đặt user active theo ID
  Future<void> setActiveUser(String userId) async {
    await init();
    await _prefs!.setString(_activeUserKey, userId);
  }

  /// Lưu hoặc cập nhật user vào danh sách
  Future<void> saveUser(SavedUser user) async {
    await init();
    final users = await getSavedUsers();

    // Xóa user cũ nếu đã tồn tại (để cập nhật)
    users.removeWhere((u) => u.id == user.id);

    // Thêm user mới vào đầu danh sách
    users.insert(0, user.copyWith(lastLoginAt: DateTime.now()));

    // Giới hạn số lượng user lưu trữ
    while (users.length > _maxSavedUsers) {
      users.removeLast();
    }

    // Lưu vào storage
    final jsonStr = json.encode(users.map((u) => u.toJson()).toList());
    await _prefs!.setString(_savedUsersKey, jsonStr);

    // Đặt user này làm active
    await setActiveUser(user.id);
  }

  /// Xóa user khỏi danh sách đã lưu
  Future<void> removeUser(String userId) async {
    await init();
    final users = await getSavedUsers();
    users.removeWhere((u) => u.id == userId);

    final jsonStr = json.encode(users.map((u) => u.toJson()).toList());
    await _prefs!.setString(_savedUsersKey, jsonStr);

    // Nếu xóa user đang active, reset active user
    final activeId = await getActiveUserId();
    if (activeId == userId) {
      if (users.isNotEmpty) {
        await setActiveUser(users.first.id);
      } else {
        await _prefs!.remove(_activeUserKey);
      }
    }
  }

  /// Xóa tất cả user đã lưu
  Future<void> clearAllUsers() async {
    await init();
    await _prefs!.remove(_savedUsersKey);
    await _prefs!.remove(_activeUserKey);
  }

  /// Lấy user đang active
  Future<SavedUser?> getActiveUser() async {
    final activeId = await getActiveUserId();
    if (activeId == null) return null;

    final users = await getSavedUsers();
    try {
      return users.firstWhere((u) => u.id == activeId);
    } catch (_) {
      return null;
    }
  }

  /// Kiểm tra xem có user nào đã lưu không
  Future<bool> hasSavedUsers() async {
    final users = await getSavedUsers();
    return users.isNotEmpty;
  }
}

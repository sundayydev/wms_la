/// Model đại diện cho user đã lưu trong bộ nhớ cục bộ
class SavedUser {
  final String id;
  final String username;
  final String displayName;
  final String? avatarUrl;
  final String? role;
  final DateTime lastLoginAt;
  final bool isActive;

  const SavedUser({
    required this.id,
    required this.username,
    required this.displayName,
    this.avatarUrl,
    this.role,
    required this.lastLoginAt,
    this.isActive = false,
  });

  /// Tạo SavedUser từ JSON Map
  factory SavedUser.fromJson(Map<String, dynamic> json) {
    return SavedUser(
      id: json['id'] as String,
      username: json['username'] as String,
      displayName: json['displayName'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      role: json['role'] as String?,
      lastLoginAt: DateTime.parse(json['lastLoginAt'] as String),
      isActive: json['isActive'] as bool? ?? false,
    );
  }

  /// Chuyển đổi SavedUser thành JSON Map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'role': role,
      'lastLoginAt': lastLoginAt.toIso8601String(),
      'isActive': isActive,
    };
  }

  /// Tạo bản sao với các thuộc tính được thay đổi
  SavedUser copyWith({
    String? id,
    String? username,
    String? displayName,
    String? avatarUrl,
    String? role,
    DateTime? lastLoginAt,
    bool? isActive,
  }) {
    return SavedUser(
      id: id ?? this.id,
      username: username ?? this.username,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      isActive: isActive ?? this.isActive,
    );
  }

  /// Lấy chữ cái đầu của tên để hiển thị avatar mặc định
  String get initials {
    final parts = displayName.split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SavedUser && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'SavedUser(id: $id, username: $username, displayName: $displayName)';
  }
}

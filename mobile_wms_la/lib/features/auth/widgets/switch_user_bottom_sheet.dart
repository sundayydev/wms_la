import 'package:flutter/material.dart';
import '../../../core/services/user_storage_service.dart';
import '../../../data/models/saved_user.dart';

/// Bottom sheet hiển thị danh sách user để chuyển đổi
class SwitchUserBottomSheet extends StatefulWidget {
  /// Callback khi user được chọn
  final void Function(SavedUser user)? onUserSelected;

  /// Callback khi thêm tài khoản mới
  final VoidCallback? onAddNewAccount;

  const SwitchUserBottomSheet({
    super.key,
    this.onUserSelected,
    this.onAddNewAccount,
  });

  /// Hiển thị bottom sheet
  static Future<SavedUser?> show(
    BuildContext context, {
    void Function(SavedUser user)? onUserSelected,
    VoidCallback? onAddNewAccount,
  }) {
    return showModalBottomSheet<SavedUser>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SwitchUserBottomSheet(
        onUserSelected: onUserSelected,
        onAddNewAccount: onAddNewAccount,
      ),
    );
  }

  @override
  State<SwitchUserBottomSheet> createState() => _SwitchUserBottomSheetState();
}

class _SwitchUserBottomSheetState extends State<SwitchUserBottomSheet> {
  final UserStorageService _userStorage = UserStorageService.instance;
  List<SavedUser> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    final users = await _userStorage.getSavedUsers();
    if (mounted) {
      setState(() {
        _users = users;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleUserTap(SavedUser user) async {
    await _userStorage.setActiveUser(user.id);
    widget.onUserSelected?.call(user);
    if (mounted) {
      Navigator.of(context).pop(user);
    }
  }

  Future<void> _handleRemoveUser(SavedUser user) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa tài khoản'),
        content: Text(
          'Bạn có chắc muốn xóa tài khoản "${user.displayName}" khỏi danh sách?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await _userStorage.removeUser(user.id);
      await _loadUsers();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1EB954).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.switch_account_rounded,
                    color: Color(0xFF1EB954),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Chuyển đổi tài khoản',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A1A2E),
                        ),
                      ),
                      Text(
                        '${_users.length} tài khoản đã lưu',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // User list
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(),
            )
          else if (_users.isEmpty)
            Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(
                    Icons.person_off_outlined,
                    size: 64,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có tài khoản nào được lưu',
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                  ),
                ],
              ),
            )
          else
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.4,
              ),
              child: ListView.separated(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: _users.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, indent: 72),
                itemBuilder: (context, index) {
                  final user = _users[index];
                  return _UserListTile(
                    user: user,
                    onTap: () => _handleUserTap(user),
                    onRemove: () => _handleRemoveUser(user),
                  );
                },
              ),
            ),

          const Divider(height: 1),

          // Add new account button
          InkWell(
            onTap: () {
              Navigator.pop(context);
              widget.onAddNewAccount?.call();
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.grey.shade300,
                        width: 2,
                        strokeAlign: BorderSide.strokeAlignCenter,
                      ),
                    ),
                    child: Icon(
                      Icons.add_rounded,
                      color: Colors.grey.shade600,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Text(
                    'Thêm tài khoản khác',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF1A1A2E),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom safe area
          SizedBox(height: MediaQuery.of(context).padding.bottom + 8),
        ],
      ),
    );
  }
}

/// Widget hiển thị một user trong danh sách
class _UserListTile extends StatelessWidget {
  final SavedUser user;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  const _UserListTile({
    required this.user,
    required this.onTap,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            // Avatar
            _buildAvatar(),
            const SizedBox(width: 16),

            // User info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        user.displayName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A2E),
                        ),
                      ),
                      if (user.isActive) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1EB954).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'Đang dùng',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1EB954),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '@${user.username}',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                  if (user.role != null) ...[
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Icon(
                          Icons.work_outline_rounded,
                          size: 14,
                          color: Colors.grey.shade500,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          user.role!,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Remove button
            IconButton(
              onPressed: onRemove,
              icon: Icon(
                Icons.close_rounded,
                color: Colors.grey.shade400,
                size: 20,
              ),
              tooltip: 'Xóa tài khoản',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    if (user.avatarUrl != null && user.avatarUrl!.isNotEmpty) {
      return Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: user.isActive
              ? Border.all(color: const Color(0xFF1EB954), width: 2)
              : null,
          image: DecorationImage(
            image: NetworkImage(user.avatarUrl!),
            fit: BoxFit.cover,
          ),
        ),
      );
    }

    // Default avatar với initials
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: _getAvatarColors(user.username),
        ),
        border: user.isActive
            ? Border.all(color: const Color(0xFF1EB954), width: 2)
            : null,
      ),
      child: Center(
        child: Text(
          user.initials,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  /// Tạo màu gradient dựa trên username
  List<Color> _getAvatarColors(String username) {
    final colorPairs = [
      [const Color(0xFF667EEA), const Color(0xFF764BA2)],
      [const Color(0xFFF093FB), const Color(0xFFF5576C)],
      [const Color(0xFF4FACFE), const Color(0xFF00F2FE)],
      [const Color(0xFF43E97B), const Color(0xFF38F9D7)],
      [const Color(0xFFFA709A), const Color(0xFFFEE140)],
      [const Color(0xFF30CFD0), const Color(0xFF330867)],
      [const Color(0xFFA8EDEA), const Color(0xFFFED6E3)],
      [const Color(0xFFFF9A9E), const Color(0xFFFECFEF)],
    ];

    final index = username.hashCode.abs() % colorPairs.length;
    return colorPairs[index];
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/date_formatters.dart';
import '../../core/widgets/app_app_bar.dart';
import '../../core/widgets/app_card.dart';
import '../../shared/models/notification_model.dart';
import '../../shared/providers/academic_providers.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  String _selectedFilter = 'All';
  List<NotificationModel>? _localNotifs;

  void _markAllAsRead(List<NotificationModel> currentList) {
    setState(() {
      _localNotifs = currentList.map((n) => n.copyWith(isRead: true)).toList();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All notifications marked as read.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final asyncNotifs = ref.watch(notificationsProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final currentNotifs = _localNotifs ?? asyncNotifs.asData?.value ?? [];
    final filtered = currentNotifs.where((n) {
      if (_selectedFilter == 'All') return true;
      if (_selectedFilter == 'Classes') return n.category == NotificationCategory.classAlert;
      if (_selectedFilter == 'Homework') return n.category == NotificationCategory.assignmentAlert;
      if (_selectedFilter == 'Tests') return n.category == NotificationCategory.examAlert;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Academic Notifications',
        subtitle: 'Class announcements, exams & alerts',
        actions: [
          TextButton(
            onPressed: () => _markAllAsRead(currentNotifs),
            child: const Text('Mark Read'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Classes', 'Homework', 'Tests'].map((f) {
                  final isSelected = _selectedFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(f),
                      selected: isSelected,
                      onSelected: (val) => setState(() => _selectedFilter = f),
                      selectedColor: AppColors.primary500.withOpacity(0.2),
                      checkmarkColor: AppColors.primary500,
                      labelStyle: TextStyle(
                        color: isSelected
                            ? AppColors.primary500
                            : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1),

          // Notifications List
          Expanded(
            child: asyncNotifs.isLoading && _localNotifs == null
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () async {
                      setState(() => _localNotifs = null);
                      ref.invalidate(notificationsProvider);
                    },
                    child: filtered.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(LucideIcons.bellOff, size: 48, color: Colors.grey),
                                    const SizedBox(height: 12),
                                    Text('No notifications found', style: AppTypography.titleSmall()),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            padding: AppSpacing.p16,
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final n = filtered[index];
                              return _buildNotificationCard(context, n, isDark);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, NotificationModel n, bool isDark) {
    IconData icon = LucideIcons.bell;
    Color color = AppColors.primary500;

    switch (n.category) {
      case NotificationCategory.classAlert:
        icon = LucideIcons.radio;
        color = AppColors.accentRose;
        break;
      case NotificationCategory.assignmentAlert:
        icon = LucideIcons.fileClock;
        color = AppColors.warning;
        break;
      case NotificationCategory.examAlert:
        icon = LucideIcons.trophy;
        color = AppColors.accentAmber;
        break;
      case NotificationCategory.general:
        icon = LucideIcons.info;
        color = AppColors.accentCyan;
        break;
    }

    return AppCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: () {
        if (n.deepLinkRoute != null) {
          context.push(n.deepLinkRoute!);
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        n.title,
                        style: AppTypography.titleSmall(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!n.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.accentCyan,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  n.body,
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  AppFormatters.formatShortDate(n.timestamp),
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

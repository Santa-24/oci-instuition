import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/date_formatters.dart';
import '../../../core/widgets/app_app_bar.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../shared/providers/academic_providers.dart';
import '../../auth/providers/auth_provider.dart';

class FacultyDashboardScreen extends ConsumerWidget {
  const FacultyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = ref.watch(authStateProvider).asData?.value;

    if (user == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final liveClassesAsync = ref.watch(liveClassesProvider);
    final liveClassList = liveClassesAsync.asData?.value ?? [];
    final batchesAsync = ref.watch(batchesProvider);
    final batches = batchesAsync.asData?.value ?? [];
    final assignmentsAsync = ref.watch(assignmentsProvider);
    final assignments = assignmentsAsync.asData?.value ?? [];
    final notifsAsync = ref.watch(notificationsProvider);
    final unreadCount = notifsAsync.asData?.value.where((n) => !n.isRead).length ?? 0;

    final activeClass = liveClassList.where((c) => c.isLive).firstOrNull ??
                        liveClassList.where((c) => c.status == 'scheduled').firstOrNull ??
                        liveClassList.firstOrNull;

    final empId = user.employeeId ??
        'FAC-${user.id.substring(0, user.id.length >= 6 ? 6 : user.id.length).toUpperCase()}';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Faculty Portal',
        subtitle: 'OCI Institute • Academic Administration',
        showNotificationAction: true,
        unreadNotifications: unreadCount,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(liveClassesProvider);
          ref.invalidate(batchesProvider);
          ref.invalidate(assignmentsProvider);
          ref.invalidate(notificationsProvider);
        },
        child: ListView(
          padding: AppSpacing.p16,
          children: [
            // Faculty Greeting Card
            AppCard(
              backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              child: Row(
                children: [
                  AppAvatar(name: user.fullName, size: 52),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.fullName,
                          style: AppTypography.titleLarge(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${user.designation ?? "Faculty Member"} • Emp ID: $empId',
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const AppChip(
                    label: 'Faculty',
                    variant: AppChipVariant.primary,
                    isSmall: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Live Class Stream Card or Schedule Prompt
            if (activeClass != null) ...[
              Container(
                decoration: BoxDecoration(
                  borderRadius: AppSpacing.radius20,
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF1E1B4B),
                      Color(0xFF312E81),
                      Color(0xFF1E3A8A),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: AppColors.primary400.withOpacity(0.3), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary500.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                padding: AppSpacing.p20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: activeClass.isLive
                                ? AppColors.accentRose.withOpacity(0.2)
                                : AppColors.accentCyan.withOpacity(0.2),
                            borderRadius: AppSpacing.radiusFull,
                            border: Border.all(
                              color: activeClass.isLive
                                  ? AppColors.accentRose.withOpacity(0.6)
                                  : AppColors.accentCyan.withOpacity(0.6),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: activeClass.isLive ? AppColors.accentRose : AppColors.accentCyan,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                activeClass.isLive ? 'STREAMING NOW' : 'READY TO HOST',
                                style: AppTypography.labelSmall(color: Colors.white).copyWith(fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          'Batch: ${activeClass.batchName}',
                          style: AppTypography.labelSmall(color: Colors.white70),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      activeClass.title,
                      style: AppTypography.titleLarge(color: Colors.white).copyWith(fontSize: 18),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Scheduled: ${AppFormatters.formatTimeOnly(activeClass.scheduledStart)} - ${AppFormatters.formatTimeOnly(activeClass.scheduledEnd)}',
                      style: AppTypography.bodySmall(color: Colors.white70),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: AppButton(
                            label: activeClass.isLive ? 'Join Ongoing Classroom' : 'Host Live Lecture Now',
                            icon: const Icon(LucideIcons.video, size: 18),
                            variant: AppButtonVariant.primary,
                            onPressed: () {
                              context.push(
                                '${RoutePaths.liveClassroom}?classId=${activeClass.id}&title=${Uri.encodeComponent(activeClass.title)}&teacher=${Uri.encodeComponent(user.fullName)}&isHost=true',
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ] else ...[
              AppCard(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary500.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.calendarPlus, color: AppColors.primary500, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'No Classes Live Right Now',
                            style: AppTypography.titleSmall(
                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Schedule a new live class for your batches.',
                            style: AppTypography.bodySmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppButton(
                      label: 'Classes',
                      size: AppButtonSize.small,
                      variant: AppButtonVariant.primary,
                      onPressed: () => context.push(RoutePaths.facultyClasses),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),

            // Teaching KPIs
            Text(
              'TEACHING METRICS',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    context,
                    title: 'Active Batches',
                    value: '${batches.length}',
                    subtitle: 'Allocated Batches',
                    color: AppColors.primary500,
                    onTap: () => context.push(RoutePaths.facultyClasses),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    context,
                    title: 'Live Lectures',
                    value: '${liveClassList.length}',
                    subtitle: 'Scheduled/Active',
                    color: AppColors.accentCyan,
                    onTap: () => context.push(RoutePaths.facultyClasses),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    context,
                    title: 'Assignments',
                    value: '${assignments.length}',
                    subtitle: 'Active Tasks',
                    color: AppColors.accentAmber,
                    onTap: () => context.push(RoutePaths.facultyTests),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Today's Teaching Schedule
            Text(
              'SCHEDULED LECTURES TIMETABLE',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
            const SizedBox(height: 12),
            if (liveClassList.isEmpty)
              const AppEmptyState(
                icon: LucideIcons.calendarCheck,
                title: 'No Scheduled Lectures',
                message: 'You have no scheduled lectures for today. You can create one from the Classes tab.',
              )
            else
              ...liveClassList.take(3).map((cls) {
                return AppCard(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppChip(label: cls.subject, variant: AppChipVariant.primary, isSmall: true),
                          Text(
                            AppFormatters.formatTimeOnly(cls.scheduledStart),
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        cls.title,
                        style: AppTypography.titleSmall(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Batch: ${cls.batchName}',
                        style: AppTypography.bodySmall(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required String subtitle,
    required Color color,
    VoidCallback? onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AppCard(
      onTap: onTap,
      padding: AppSpacing.p12,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: AppTypography.headlineMedium(color: color),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ).copyWith(fontWeight: FontWeight.w600),
          ),
          Text(
            subtitle,
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ).copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }
}

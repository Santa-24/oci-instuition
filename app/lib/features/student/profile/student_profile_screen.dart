import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_app_bar.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../shared/providers/academic_providers.dart';
import '../../auth/providers/auth_provider.dart';

class StudentProfileScreen extends ConsumerWidget {
  const StudentProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = ref.watch(authStateProvider).asData?.value;
    final attendanceAsync = ref.watch(studentAttendanceProvider);

    if (user == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final rollText = user.rollNo != null && user.rollNo!.isNotEmpty ? user.rollNo! : 'OCI-STU-${user.id.substring(0, user.id.length >= 6 ? 6 : user.id.length).toUpperCase()}';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: const AppAppBar(
        title: 'Student Profile',
        subtitle: 'Academic credentials & verified account details',
      ),
      body: ListView(
        padding: AppSpacing.p16,
        children: [
          // Profile Header Card
          Container(
            padding: AppSpacing.p20,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: AppSpacing.radius16,
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              children: [
                AppAvatar(name: user.fullName, size: 72),
                const SizedBox(height: 14),
                Text(
                  user.fullName,
                  style: AppTypography.titleLarge(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const AppChip(label: 'Enrolled Aspirant', variant: AppChipVariant.primary, isSmall: true),
                    const SizedBox(width: 8),
                    AppChip(
                      label: 'Roll: $rollText',
                      variant: AppChipVariant.neutral,
                      isSmall: true,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Institutional Details
          Text(
            'ENROLLMENT & ACADEMIC STATUS',
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: AppSpacing.p16,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: AppSpacing.radius16,
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              children: [
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.layers,
                  label: 'Allocated Batch',
                  value: user.batchName ?? 'Unallocated / Open Enrollment',
                ),
                Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.calendarCheck,
                  label: 'Attendance Rate',
                  value: attendanceAsync.when(
                    data: (summary) => summary.hasRecords
                        ? '${summary.percentage.toStringAsFixed(1)}% (${summary.presentCount} of ${summary.totalClasses} classes attended)'
                        : 'No attendance records recorded yet',
                    loading: () => 'Calculating...',
                    error: (_, __) => 'Not available',
                  ),
                ),
                Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.phone,
                  label: 'Registered Phone',
                  value: user.phone != null && user.phone!.isNotEmpty ? user.phone! : 'Not provided',
                ),
                Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.shieldCheck,
                  label: 'Account Role',
                  value: 'STUDENT (Authoritative & Verified)',
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Account Settings
          Text(
            'SETTINGS & SUPPORT',
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: AppSpacing.radius16,
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: Icon(LucideIcons.bell, size: 20, color: isDark ? AppColors.primary400 : AppColors.primary600),
                  title: Text(
                    'Push Notifications',
                    style: AppTypography.titleSmall(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Class reminders & schedule alerts',
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  trailing: const Icon(LucideIcons.chevronRight, size: 18),
                  onTap: () => context.push(RoutePaths.notifications),
                ),
                Divider(height: 1, color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                ListTile(
                  leading: Icon(LucideIcons.lifeBuoy, size: 20, color: isDark ? AppColors.accentCyan : AppColors.accentCyan),
                  title: Text(
                    'Academic Helpdesk',
                    style: AppTypography.titleSmall(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Contact campus coordinator & mentors',
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  trailing: const Icon(LucideIcons.chevronRight, size: 18),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Academic Coordinator Desk: Available Mon-Sat 9AM-6PM at campus.'),
                        duration: Duration(seconds: 3),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Logout Action (Strict cache wipe)
          AppButton(
            label: 'Sign Out Account',
            icon: const Icon(LucideIcons.logOut, size: 18),
            variant: AppButtonVariant.outline,
            isFullWidth: true,
            onPressed: () async {
              await ref.read(authStateProvider.notifier).signOut();
              if (context.mounted) {
                context.go(RoutePaths.login);
              }
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required bool isDark,
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 18,
            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTypography.titleSmall(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
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

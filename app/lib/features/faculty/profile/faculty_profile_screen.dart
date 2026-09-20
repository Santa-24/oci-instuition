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
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_chip.dart';
import '../../auth/providers/auth_provider.dart';

class FacultyProfileScreen extends ConsumerWidget {
  const FacultyProfileScreen({super.key});

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

    final empId = user.employeeId ?? 
        'FAC-${user.id.substring(0, user.id.length >= 6 ? 6 : user.id.length).toUpperCase()}';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: const AppAppBar(
        title: 'Faculty Profile',
        subtitle: 'Faculty credentials & academic administration',
      ),
      body: ListView(
        padding: AppSpacing.p16,
        children: [
          // Faculty Profile Header
          AppCard(
            backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
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
                const SizedBox(height: 10),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AppChip(
                      label: user.designation ?? 'Faculty Member',
                      variant: AppChipVariant.primary,
                      isSmall: true,
                    ),
                    const SizedBox(width: 8),
                    AppChip(
                      label: 'Emp ID: $empId',
                      variant: AppChipVariant.neutral,
                      isSmall: true,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Academic Administration Navigation
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'My Batches',
                  value: 'Classes',
                  icon: LucideIcons.layers,
                  color: AppColors.primary500,
                  onTap: () => context.push(RoutePaths.facultyClasses),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Study Materials',
                  value: 'Content',
                  icon: LucideIcons.bookOpen,
                  color: AppColors.accentCyan,
                  onTap: () => context.push(RoutePaths.facultyContent),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricTile(
                  context,
                  title: 'Examinations',
                  value: 'Tests',
                  icon: LucideIcons.fileText,
                  color: AppColors.accentAmber,
                  onTap: () => context.push(RoutePaths.facultyTests),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Credentials & Specialization
          Text(
            'ACADEMIC PROFILE',
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              children: [
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.award,
                  label: 'Subject Domain',
                  value: user.subject ?? 'Faculty Specialist',
                ),
                const Divider(),
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.phone,
                  label: 'Registered Phone',
                  value: (user.phone != null && user.phone!.isNotEmpty) ? user.phone! : 'Not Provided',
                ),
                const Divider(),
                _buildInfoRow(
                  isDark: isDark,
                  icon: LucideIcons.shieldCheck,
                  label: 'System Access Role',
                  value: 'Authorized Faculty Account',
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Settings & Preferences
          Text(
            'ACCOUNT & PREFERENCES',
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(LucideIcons.bell, size: 20, color: AppColors.accentAmber),
                  title: Text('Push Notifications', style: AppTypography.titleSmall()),
                  subtitle: Text('Reminders for scheduled lectures and submissions', style: AppTypography.labelSmall()),
                  trailing: const Icon(LucideIcons.chevronRight, size: 18),
                  onTap: () => context.push(RoutePaths.notifications),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          AppButton(
            label: 'Sign Out Faculty Account',
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

  Widget _buildMetricTile(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AppCard(
      onTap: onTap,
      padding: AppSpacing.p12,
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTypography.titleMedium(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            ).copyWith(fontSize: 10),
          ),
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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
          const SizedBox(width: 14),
          Column(
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
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ).copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

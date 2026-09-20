import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/config/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../providers/auth_provider.dart';

class AdminRestrictedScreen extends ConsumerWidget {
  const AdminRestrictedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: AppSpacing.p24,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Warning Shield Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.accentAmber.withOpacity(0.12),
                    border: Border.all(
                      color: AppColors.accentAmber.withOpacity(0.3),
                      width: 1.5,
                    ),
                  ),
                  child: const Icon(
                    LucideIcons.shieldAlert,
                    size: 38,
                    color: AppColors.accentAmber,
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  'Administration is Web Only',
                  style: AppTypography.displaySmall(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),

                Text(
                  'Administrative tools, course configurations, user management, and institute operations belong exclusively to the Master Web Platform.',
                  style: AppTypography.bodyMedium(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),

                AppCard(
                  padding: AppSpacing.p20,
                  backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.globe, size: 20, color: AppColors.primary400),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Web Admin Portal',
                                  style: AppTypography.titleMedium(
                                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                  ),
                                ),
                                Text(
                                  AppConstants.webAdminUrl,
                                  style: AppTypography.labelSmall(
                                    color: AppColors.primary400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Please sign in via your desktop web browser to manage institute operations.',
                        style: AppTypography.bodySmall(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Return to Login / Logout
                AppButton(
                  label: 'Sign Out & Return to Login',
                  onPressed: () {
                    ref.read(authStateProvider.notifier).signOut();
                  },
                  icon: const Icon(LucideIcons.logOut, size: 18),
                  variant: AppButtonVariant.primary,
                  isFullWidth: true,
                ),
                const SizedBox(height: 12),

                Text(
                  'The mobile client is reserved exclusively for Students and Faculty.',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

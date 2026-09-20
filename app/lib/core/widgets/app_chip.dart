import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

enum AppChipVariant { success, warning, error, info, primary, neutral }

class AppChip extends StatelessWidget {
  final String label;
  final AppChipVariant variant;
  final Widget? icon;
  final bool isSmall;

  const AppChip({
    super.key,
    required this.label,
    this.variant = AppChipVariant.primary,
    this.icon,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;

    switch (variant) {
      case AppChipVariant.success:
        bg = AppColors.success.withOpacity(0.12);
        fg = AppColors.success;
        border = AppColors.success.withOpacity(0.3);
        break;
      case AppChipVariant.warning:
        bg = AppColors.warning.withOpacity(0.12);
        fg = AppColors.warning;
        border = AppColors.warning.withOpacity(0.3);
        break;
      case AppChipVariant.error:
        bg = AppColors.error.withOpacity(0.12);
        fg = AppColors.error;
        border = AppColors.error.withOpacity(0.3);
        break;
      case AppChipVariant.info:
        bg = AppColors.info.withOpacity(0.12);
        fg = AppColors.info;
        border = AppColors.info.withOpacity(0.3);
        break;
      case AppChipVariant.primary:
        bg = AppColors.primary500.withOpacity(0.12);
        fg = AppColors.primary400;
        border = AppColors.primary500.withOpacity(0.3);
        break;
      case AppChipVariant.neutral:
        bg = Colors.white.withOpacity(0.06);
        fg = Colors.white70;
        border = Colors.white12;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppSpacing.radiusFull,
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            icon!,
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: isSmall
                ? AppTypography.labelSmall(color: fg).copyWith(fontSize: 10)
                : AppTypography.labelSmall(color: fg),
          ),
        ],
      ),
    );
  }
}

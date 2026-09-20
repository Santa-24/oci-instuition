import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Color? borderColor;
  final bool hasGlow;
  final Color? glowColor;
  final BorderRadius? borderRadius;

  const AppCard({
    super.key,
    required this.child,
    this.padding = AppSpacing.p16,
    this.margin,
    this.onTap,
    this.backgroundColor,
    this.borderColor,
    this.hasGlow = false,
    this.glowColor,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final radius = borderRadius ?? AppSpacing.radius16;
    final bg = backgroundColor ?? (isDark ? AppColors.darkSurface : AppColors.lightSurface);
    final border = borderColor ?? (isDark ? AppColors.darkBorder : AppColors.lightBorder);

    List<BoxShadow>? shadows;
    if (hasGlow && isDark) {
      shadows = AppSpacing.darkGlow(glowColor ?? AppColors.primary500);
    } else if (!isDark) {
      shadows = AppSpacing.shadowSm;
    }

    final cardContent = Container(
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(color: border, width: 1),
      ),
      child: child,
    );

    final card = Material(
      color: bg,
      borderRadius: radius,
      clipBehavior: Clip.antiAlias,
      child: onTap != null
          ? InkWell(
              onTap: onTap,
              borderRadius: radius,
              child: cardContent,
            )
          : cardContent,
    );

    if (shadows != null || margin != null) {
      return Container(
        margin: margin,
        decoration: BoxDecoration(
          borderRadius: radius,
          boxShadow: shadows,
        ),
        child: card,
      );
    }

    return card;
  }
}

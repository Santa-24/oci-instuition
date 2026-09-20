import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_typography.dart';

class LiveBadge extends StatefulWidget {
  final String label;
  final bool isSmall;

  const LiveBadge({
    super.key,
    this.label = 'LIVE NOW',
    this.isSmall = false,
  });

  @override
  State<LiveBadge> createState() => _LiveBadgeState();
}

class _LiveBadgeState extends State<LiveBadge> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final opacity = 0.5 + (_controller.value * 0.5);
        return Container(
          padding: EdgeInsets.symmetric(
            horizontal: widget.isSmall ? 7 : 10,
            vertical: widget.isSmall ? 3 : 5,
          ),
          decoration: BoxDecoration(
            color: AppColors.accentRose.withOpacity(0.15),
            borderRadius: AppSpacing.radiusFull,
            border: Border.all(
              color: AppColors.accentRose.withOpacity(0.5 * opacity),
              width: 1.2,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: widget.isSmall ? 6 : 8,
                height: widget.isSmall ? 6 : 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.liveRed.withOpacity(opacity),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.liveRed.withOpacity(0.6 * opacity),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: widget.isSmall
                    ? AppTypography.labelSmall(color: AppColors.accentRose).copyWith(fontSize: 10, fontWeight: FontWeight.w800)
                    : AppTypography.labelSmall(color: AppColors.accentRose).copyWith(fontWeight: FontWeight.w800),
              ),
            ],
          ),
        );
      },
    );
  }
}

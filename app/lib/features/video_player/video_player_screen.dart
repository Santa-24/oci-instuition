import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;
  final String title;

  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.title,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  bool _isPlaying = true;
  double _playbackSpeed = 1.0;
  String _quality = '720p';
  double _currentPosition = 0.0;
  final double _totalDuration = 3600.0; // 60 mins default stream

  void _showSpeedPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [0.75, 1.0, 1.25, 1.5, 2.0].map((s) {
          return ListTile(
            title: Text('${s}x', style: const TextStyle(color: Colors.white)),
            trailing: _playbackSpeed == s ? const Icon(LucideIcons.check, color: AppColors.primary400) : null,
            onTap: () {
              setState(() => _playbackSpeed = s);
              Navigator.pop(ctx);
            },
          );
        }).toList(),
      ),
    );
  }

  void _showQualityPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: ['Auto', '480p', '720p', '1080p'].map((q) {
          final val = q == 'Auto' ? '720p' : q;
          return ListTile(
            title: Text(q, style: const TextStyle(color: Colors.white)),
            trailing: _quality == val ? const Icon(LucideIcons.check, color: AppColors.primary400) : null,
            onTap: () {
              setState(() => _quality = val);
              Navigator.pop(ctx);
            },
          );
        }).toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        title: Text(
          widget.title,
          style: AppTypography.titleSmall(
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, size: 20),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Lecture reference link copied to clipboard')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Video Viewport Stage
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              color: Colors.black,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isPlaying ? LucideIcons.playCircle : LucideIcons.pauseCircle,
                          size: 56,
                          color: Colors.white70,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.title,
                          style: AppTypography.titleSmall(color: Colors.white70),
                          textAlign: TextAlign.center,
                        ),
                        Text(
                          'OCI Secure Video Player • $_quality',
                          style: AppTypography.labelSmall(color: Colors.white38),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Colors.black87],
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              trackHeight: 3,
                              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                              overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                              activeTrackColor: AppColors.primary500,
                              inactiveTrackColor: Colors.white24,
                              thumbColor: AppColors.primary400,
                            ),
                            child: Slider(
                              value: _currentPosition.clamp(0.0, _totalDuration),
                              min: 0.0,
                              max: _totalDuration,
                              onChanged: (val) => setState(() => _currentPosition = val),
                            ),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  IconButton(
                                    icon: Icon(_isPlaying ? LucideIcons.pause : LucideIcons.play, color: Colors.white, size: 20),
                                    onPressed: () => setState(() => _isPlaying = !_isPlaying),
                                  ),
                                  Text(
                                    '${(_currentPosition ~/ 60).toString().padLeft(2, '0')}:${(_currentPosition % 60).toInt().toString().padLeft(2, '0')} / 60:00',
                                    style: const TextStyle(color: Colors.white, fontSize: 12),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  TextButton(
                                    onPressed: _showSpeedPicker,
                                    child: Text('${_playbackSpeed}x', style: const TextStyle(color: Colors.white, fontSize: 12)),
                                  ),
                                  TextButton(
                                    onPressed: _showQualityPicker,
                                    child: Text(_quality, style: const TextStyle(color: Colors.white, fontSize: 12)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Lecture Information Section
          Expanded(
            child: ListView(
              padding: AppSpacing.p16,
              children: [
                Text(
                  widget.title,
                  style: AppTypography.titleLarge(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'OCI Official Video Stream • High-Definition Academic Archive',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 16),
                Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                const SizedBox(height: 16),
                Container(
                  padding: AppSpacing.p16,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    borderRadius: AppSpacing.radius12,
                    border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          LucideIcons.checkCircle,
                          size: 20,
                          color: isDark ? AppColors.primary400 : AppColors.primary600,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Verified Attendance Logged',
                              style: AppTypography.titleSmall(
                                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                              ),
                            ),
                            Text(
                              'Viewing time is recorded toward your course progress.',
                              style: AppTypography.bodySmall(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
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

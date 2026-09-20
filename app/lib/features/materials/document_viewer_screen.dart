import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';

class DocumentViewerScreen extends StatefulWidget {
  final String title;
  final String url;

  const DocumentViewerScreen({
    super.key,
    required this.title,
    required this.url,
  });

  @override
  State<DocumentViewerScreen> createState() => _DocumentViewerScreenState();
}

class _DocumentViewerScreenState extends State<DocumentViewerScreen> {
  double _zoom = 1.0;
  int _currentPage = 1;
  final int _totalPages = 1;

  Future<void> _downloadOrOpenExternal() async {
    final uri = Uri.tryParse(widget.url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to open document link: ${widget.url}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: AppTypography.titleSmall(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              'Official Academic Document',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.download, size: 20),
            tooltip: 'Download / Open in External Viewer',
            onPressed: _downloadOrOpenExternal,
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 1,
            ),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                IconButton(
                  icon: const Icon(LucideIcons.zoomOut, size: 20),
                  onPressed: () {
                    if (_zoom > 0.8) setState(() => _zoom -= 0.1);
                  },
                ),
                Text('${(_zoom * 100).toInt()}%', style: AppTypography.labelSmall()),
                IconButton(
                  icon: const Icon(LucideIcons.zoomIn, size: 20),
                  onPressed: () {
                    if (_zoom < 2.0) setState(() => _zoom += 0.1);
                  },
                ),
              ],
            ),
            Text('Page $_currentPage of $_totalPages', style: AppTypography.labelSmall()),
            AppButton(
              label: 'Open Full PDF',
              variant: AppButtonVariant.primary,
              size: AppButtonSize.small,
              icon: const Icon(LucideIcons.externalLink, size: 14, color: Colors.white),
              onPressed: _downloadOrOpenExternal,
            ),
          ],
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: AppSpacing.p16,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 600),
            padding: AppSpacing.p24,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: AppSpacing.radius16,
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          LucideIcons.fileText,
                          color: isDark ? AppColors.primary400 : AppColors.primary600,
                          size: 32,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'ODISHA COMPETITIVE INSTITUTE',
                        style: AppTypography.labelSmall(
                          color: isDark ? AppColors.primary400 : AppColors.primary600,
                        ).copyWith(letterSpacing: 1.2, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        widget.title,
                        style: AppTypography.titleLarge(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'DOCUMENT DETAILS',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'File Resource: ${widget.url.isNotEmpty ? widget.url.split('/').last : "Document Attachment"}',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: AppSpacing.p16,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                    borderRadius: AppSpacing.radius12,
                    border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Secure Document Viewer',
                        style: AppTypography.titleSmall(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'This document is verified and authenticated by the OCI academic faculty. Tap below to launch high-resolution view or save for offline study.',
                        style: AppTypography.bodySmall(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                      const SizedBox(height: 14),
                      AppButton(
                        label: 'Launch Document in PDF Viewer',
                        variant: AppButtonVariant.primary,
                        size: AppButtonSize.medium,
                        isFullWidth: true,
                        icon: const Icon(LucideIcons.fileDown, size: 16, color: Colors.white),
                        onPressed: _downloadOrOpenExternal,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

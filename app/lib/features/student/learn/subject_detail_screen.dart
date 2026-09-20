import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_app_bar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_empty_state.dart';

import '../../../shared/providers/academic_providers.dart';

class SubjectDetailScreen extends ConsumerStatefulWidget {
  final String subjectId;
  final String? name;
  final String? teacher;

  const SubjectDetailScreen({
    super.key,
    required this.subjectId,
    this.name,
    this.teacher,
  });

  @override
  ConsumerState<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends ConsumerState<SubjectDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final subjectName = widget.name ?? 'Subject Module';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: subjectName,
        subtitle: widget.teacher != null ? 'Faculty: ${widget.teacher}' : 'Curriculum & Content',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: isDark ? AppColors.primary400 : AppColors.primary600,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: const [
            Tab(text: 'Lectures & Archive'),
            Tab(text: 'Study Materials'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLecturesTab(context, isDark, subjectName),
          _buildMaterialsTab(context, isDark, subjectName),
        ],
      ),
    );
  }

  Widget _buildLecturesTab(BuildContext context, bool isDark, String subjectName) {
    final recordedAsync = ref.watch(recordedClassesProvider);

    return recordedAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Lectures',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(recordedClassesProvider),
        ),
      ),
      data: (allRecordings) {
        final filtered = allRecordings.where((r) {
          final s = r.subject.toLowerCase();
          final q = subjectName.toLowerCase();
          return s.contains(q) || q.contains(s);
        }).toList();

        if (filtered.isEmpty) {
          return Center(
            child: AppEmptyState(
              icon: LucideIcons.videoOff,
              title: 'No Lecture Archives Available',
              message: 'Recorded class lectures for $subjectName will appear here after live sessions are conducted.',
            ),
          );
        }

        return ListView.builder(
          padding: AppSpacing.p16,
          itemCount: filtered.length,
          itemBuilder: (context, index) {
            final rec = filtered[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: AppSpacing.p16,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: AppSpacing.radius16,
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                      borderRadius: AppSpacing.radius12,
                    ),
                    child: Icon(
                      LucideIcons.playCircle,
                      color: isDark ? AppColors.primary400 : AppColors.primary600,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          rec.title,
                          style: AppTypography.titleSmall(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Duration: ${(rec.durationSeconds / 60).toStringAsFixed(0)} mins',
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AppButton(
                    label: 'Watch',
                    variant: AppButtonVariant.ghost,
                    size: AppButtonSize.small,
                    onPressed: () {
                      context.push(
                        '${RoutePaths.videoPlayer}?videoUrl=${Uri.encodeComponent(rec.videoUrl)}&title=${Uri.encodeComponent(rec.title)}',
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMaterialsTab(BuildContext context, bool isDark, String subjectName) {
    final materialsAsync = ref.watch(studyMaterialsProvider);

    return materialsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Materials',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(studyMaterialsProvider),
        ),
      ),
      data: (allMaterials) {
        final filtered = allMaterials.where((m) {
          final s = m.subject.toLowerCase();
          final q = subjectName.toLowerCase();
          return s.contains(q) || q.contains(s);
        }).toList();

        if (filtered.isEmpty) {
          return Center(
            child: AppEmptyState(
              icon: LucideIcons.fileQuestion,
              title: 'No Documents Uploaded',
              message: 'Study notes, DPPs, and formula sheets for $subjectName will appear here once published.',
            ),
          );
        }

        return ListView.builder(
          padding: AppSpacing.p16,
          itemCount: filtered.length,
          itemBuilder: (context, index) {
            final mat = filtered[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: AppSpacing.p16,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: AppSpacing.radius16,
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                      borderRadius: AppSpacing.radius12,
                    ),
                    child: Icon(
                      LucideIcons.fileText,
                      color: isDark ? AppColors.accentCyan : AppColors.primary600,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          mat.title,
                          style: AppTypography.titleSmall(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          mat.type,
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AppButton(
                    label: 'Read',
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.small,
                    onPressed: () {
                      context.push(
                        '${RoutePaths.documentViewer}?url=${Uri.encodeComponent(mat.fileUrl)}&title=${Uri.encodeComponent(mat.title)}',
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

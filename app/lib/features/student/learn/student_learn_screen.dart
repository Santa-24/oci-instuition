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
import '../../../shared/models/subject_model.dart';
import '../../../shared/models/study_material_model.dart';
import '../../../shared/providers/academic_providers.dart';
import '../../auth/providers/auth_provider.dart';

class StudentLearnScreen extends ConsumerWidget {
  const StudentLearnScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = ref.watch(authStateProvider).asData?.value;

    final subjectsAsync = ref.watch(subjectsProvider);
    final materialsAsync = ref.watch(studyMaterialsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: const AppAppBar(
        title: 'Study & Curriculum',
        subtitle: 'Subjects, syllabus modules & learning notes',
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(subjectsProvider);
          ref.invalidate(studyMaterialsProvider);
        },
        child: ListView(
          padding: AppSpacing.p16,
          children: [
            // 1. Academic Track Banner
            Container(
              padding: AppSpacing.p16,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: AppSpacing.radius16,
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      LucideIcons.bookMarked,
                      color: isDark ? AppColors.primary400 : AppColors.primary600,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.batchName ?? 'Academic Curriculum',
                          style: AppTypography.titleMedium(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Authorized course notes, subject materials & practice sets.',
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
            const SizedBox(height: 24),

            // 2. Enrolled Subjects Section
            Text(
              'COURSE SUBJECTS',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
            const SizedBox(height: 12),

            subjectsAsync.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (err, _) => Center(
                child: AppEmptyState(
                  icon: LucideIcons.alertCircle,
                  title: 'Unable to Load Subjects',
                  message: err.toString(),
                  actionLabel: 'Retry',
                  onAction: () => ref.invalidate(subjectsProvider),
                ),
              ),
              data: (subjects) {
                if (subjects.isEmpty) {
                  return Container(
                    padding: AppSpacing.p24,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: AppSpacing.radius16,
                      border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                    child: Center(
                      child: AppEmptyState(
                        icon: LucideIcons.bookOpen,
                        title: 'No Subjects Assigned Yet',
                        message: 'Course subjects and syllabus outlines will appear here once allocated by your academic coordinator.',
                      ),
                    ),
                  );
                }

                return Column(
                  children: subjects.map((subj) => _buildSubjectCard(context, subj, isDark)).toList(),
                );
              },
            ),

            const SizedBox(height: 28),

            // 3. Published Study Materials
            Text(
              'PUBLISHED MATERIALS & NOTES',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
            const SizedBox(height: 12),

            materialsAsync.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (err, _) => Center(
                child: AppEmptyState(
                  icon: LucideIcons.alertCircle,
                  title: 'Unable to Load Materials',
                  message: err.toString(),
                  actionLabel: 'Retry',
                  onAction: () => ref.invalidate(studyMaterialsProvider),
                ),
              ),
              data: (materials) {
                if (materials.isEmpty) {
                  return Container(
                    padding: AppSpacing.p24,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: AppSpacing.radius16,
                      border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                    child: Center(
                      child: AppEmptyState(
                        icon: LucideIcons.fileQuestion,
                        title: 'No Study Materials Available',
                        message: 'Faculty members have not uploaded any study notes or worksheets for your enrolled subjects yet.',
                      ),
                    ),
                  );
                }

                return Column(
                  children: materials.map((mat) => _buildMaterialTile(context, mat, isDark)).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectCard(BuildContext context, SubjectModel subj, bool isDark) {
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
              LucideIcons.bookmark,
              color: isDark ? AppColors.primary400 : AppColors.primary600,
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subj.name,
                  style: AppTypography.titleMedium(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Code: ${subj.code} • Faculty: ${subj.leadTeacherName}',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
          AppButton(
            label: 'Open',
            variant: AppButtonVariant.ghost,
            size: AppButtonSize.small,
            onPressed: () {
              context.push(
                '${RoutePaths.studentSubjectDetail}?subjectId=${subj.id}&name=${Uri.encodeComponent(subj.name)}&teacher=${Uri.encodeComponent(subj.leadTeacherName)}',
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMaterialTile(BuildContext context, StudyMaterialModel mat, bool isDark) {
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
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${mat.subject} • ${mat.type}',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
          AppButton(
            label: 'View',
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
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/router/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/date_formatters.dart';
import '../../../core/widgets/app_app_bar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../shared/models/assignment_model.dart';
import '../../../shared/models/exam_model.dart';
import '../../../shared/providers/academic_providers.dart';

class FacultyTestsScreen extends ConsumerStatefulWidget {
  const FacultyTestsScreen({super.key});

  @override
  ConsumerState<FacultyTestsScreen> createState() => _FacultyTestsScreenState();
}

class _FacultyTestsScreenState extends ConsumerState<FacultyTestsScreen>
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
    final assignmentsAsync = ref.watch(assignmentsProvider);
    final assignments = assignmentsAsync.asData?.value ?? [];
    final examsAsync = ref.watch(examsProvider);
    final exams = examsAsync.asData?.value ?? [];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Tests, Mock CBTs & Grading',
        subtitle: 'Batch performance reports and assignment evaluations',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary500,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: [
            Tab(text: 'Mock CBTs (${exams.length})'),
            Tab(text: 'Assignments (${assignments.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCbtAnalyticsTab(context, exams, isDark),
          _buildAssignmentsTab(context, assignments, isDark),
        ],
      ),
    );
  }

  Widget _buildCbtAnalyticsTab(BuildContext context, List<ExamModel> exams, bool isDark) {
    if (exams.isEmpty) {
      return const Center(
        child: AppEmptyState(
          icon: LucideIcons.barChart2,
          title: 'No CBT Exams Configured',
          message: 'There are no active or completed mock computer-based tests.',
        ),
      );
    }

    return ListView.builder(
      padding: AppSpacing.p16,
      itemCount: exams.length,
      itemBuilder: (context, index) {
        final exam = exams[index];
        return AppCard(
          margin: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppChip(label: exam.courseName, variant: AppChipVariant.primary, isSmall: true),
                  Text(
                    AppFormatters.formatShortDate(exam.scheduledDate),
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                exam.title,
                style: AppTypography.titleMedium(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${exam.durationMinutes} Minutes • ${exam.totalQuestions} Questions • ${exam.totalMarks} Total Marks',
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Preview Test Paper',
                      variant: AppButtonVariant.outline,
                      size: AppButtonSize.small,
                      onPressed: () {
                        context.push('${RoutePaths.examRoom}?examId=${exam.id}&title=${Uri.encodeComponent(exam.title)}');
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAssignmentsTab(
    BuildContext context,
    List<AssignmentModel> assignments,
    bool isDark,
  ) {
    if (assignments.isEmpty) {
      return const Center(
        child: AppEmptyState(
          icon: LucideIcons.fileText,
          title: 'No Assignments Active',
          message: 'No assignments have been assigned to your batches.',
        ),
      );
    }

    return ListView(
      padding: AppSpacing.p16,
      children: [
        Text(
          'ACTIVE BATCH ASSIGNMENTS (${assignments.length})',
          style: AppTypography.labelSmall(
            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          ),
        ),
        const SizedBox(height: 12),
        ...assignments.map((asg) => AppCard(
              margin: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppChip(label: asg.subject, variant: AppChipVariant.primary, isSmall: true),
                      Text(
                        'Due ${AppFormatters.formatShortDate(asg.dueDate)}',
                        style: AppTypography.labelSmall(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    asg.title,
                    style: AppTypography.titleSmall(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Batch: ${asg.batchName} • Total: ${asg.totalMarks} Marks',
                    style: AppTypography.bodySmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: 'View Assignment Details',
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.small,
                          onPressed: () {
                            context.push('${RoutePaths.assignmentDetail}?id=${asg.id}');
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

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
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../shared/models/exam_model.dart';
import '../../../shared/providers/academic_providers.dart';

class StudentTestsScreen extends ConsumerStatefulWidget {
  const StudentTestsScreen({super.key});

  @override
  ConsumerState<StudentTestsScreen> createState() => _StudentTestsScreenState();
}

class _StudentTestsScreenState extends ConsumerState<StudentTestsScreen>
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
    final examsAsync = ref.watch(examsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Tests & Mock CBTs',
        subtitle: 'Simulated computer-based examinations',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: isDark ? AppColors.primary400 : AppColors.primary600,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: const [
            Tab(text: 'Available Tests'),
            Tab(text: 'My Scorecards'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildUpcomingTab(context, examsAsync, isDark),
          _buildPastResultsTab(context, isDark),
        ],
      ),
    );
  }

  Widget _buildUpcomingTab(BuildContext context, AsyncValue<List<ExamModel>> examsAsync, bool isDark) {
    return examsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Tests',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(examsProvider),
        ),
      ),
      data: (exams) {
        if (exams.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(examsProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: AppSpacing.p24,
              children: const [
                SizedBox(height: 40),
                AppEmptyState(
                  icon: LucideIcons.fileQuestion,
                  title: 'No Tests Scheduled',
                  message: 'No computer-based tests or mock exams are scheduled right now. Check back soon or consult your course schedule.',
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(examsProvider),
          child: ListView.builder(
            padding: AppSpacing.p16,
            itemCount: exams.length,
            itemBuilder: (context, index) {
              final exam = exams[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: AppSpacing.p16,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                  borderRadius: AppSpacing.radius16,
                  border: Border.all(
                    color: exam.isPublished
                        ? (isDark ? AppColors.primary400.withOpacity(0.3) : AppColors.primary600.withOpacity(0.3))
                        : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppChip(
                          label: exam.isPublished ? 'CBT AVAILABLE' : 'SCHEDULED',
                          variant: exam.isPublished ? AppChipVariant.primary : AppChipVariant.neutral,
                          isSmall: true,
                        ),
                        Text(
                          AppFormatters.formatShortDate(exam.scheduledDate),
                          style: AppTypography.labelSmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      exam.title,
                      style: AppTypography.titleLarge(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${exam.courseName.isNotEmpty ? exam.courseName : "Standard Examination"} • ${exam.totalMarks} Marks • ${exam.durationMinutes} Mins',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                    const SizedBox(height: 14),
                    AppButton(
                      label: 'Enter CBT Exam Room',
                      icon: const Icon(LucideIcons.arrowRight, size: 16, color: Colors.white),
                      variant: AppButtonVariant.primary,
                      size: AppButtonSize.small,
                      isFullWidth: true,
                      onPressed: () {
                        context.push(
                          '${RoutePaths.examRoom}?examId=${exam.id}&title=${Uri.encodeComponent(exam.title)}',
                        );
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildPastResultsTab(BuildContext context, bool isDark) {
    final resultsAsync = ref.watch(studentExamResultsProvider);

    return resultsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => RefreshIndicator(
        onRefresh: () async => ref.invalidate(studentExamResultsProvider),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: AppSpacing.p24,
          children: const [
            SizedBox(height: 40),
            AppEmptyState(
              icon: LucideIcons.award,
              title: 'Unable to Load Scorecards',
              message: 'Check your network connection and retry.',
            ),
          ],
        ),
      ),
      data: (results) {
        if (results.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(studentExamResultsProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: AppSpacing.p24,
              children: const [
                SizedBox(height: 40),
                AppEmptyState(
                  icon: LucideIcons.award,
                  title: 'No Scorecards Released Yet',
                  message: 'You have not submitted any test attempts yet. Complete a mock test in the Available Tests tab to generate verified performance analytics.',
                ),
              ],
            ),
          );
        }

        final totalScore = results.fold<int>(0, (sum, r) => sum + r.score);
        final totalMax = results.fold<int>(0, (sum, r) => sum + r.totalMarks);
        final avgPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0.0;

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(studentExamResultsProvider),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: AppSpacing.p16,
            children: [
              // Summary Header
              Container(
                padding: AppSpacing.p16,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                  borderRadius: AppSpacing.radius16,
                  border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tests Attempted',
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${results.length}',
                            style: AppTypography.titleLarge(
                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(height: 36, width: 1, color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            'Total Points',
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$totalScore',
                            style: AppTypography.titleLarge(
                              color: isDark ? AppColors.primary400 : AppColors.primary600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(height: 36, width: 1, color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Average',
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${avgPercentage.toStringAsFixed(1)}%',
                            style: AppTypography.titleLarge(
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Text(
                'VERIFIED SCORECARDS',
                style: AppTypography.labelSmall(
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ),
              ),
              const SizedBox(height: 12),

              ...results.map((res) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: AppSpacing.p16,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: AppSpacing.radius16,
                      border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            AppChip(
                              label: res.percentage >= 50 ? 'Passed' : 'Completed',
                              variant: res.percentage >= 50 ? AppChipVariant.success : AppChipVariant.neutral,
                              isSmall: true,
                            ),
                            Text(
                              AppFormatters.formatShortDate(res.submittedAt),
                              style: AppTypography.labelSmall(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          res.examTitle,
                          style: AppTypography.titleMedium(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Text(
                              'Score: ${res.score} / ${res.totalMarks}',
                              style: AppTypography.bodySmall(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Text(
                              'Percentage: ${res.percentage.toStringAsFixed(1)}%',
                              style: AppTypography.bodySmall(
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        AppButton(
                          label: 'View Detailed Scorecard',
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.small,
                          isFullWidth: true,
                          icon: const Icon(LucideIcons.barChart2, size: 16),
                          onPressed: () {
                            context.push('${RoutePaths.examResult}?examId=${res.examId}&resultId=${res.id}');
                          },
                        ),
                      ],
                    ),
                  )),
            ],
          ),
        );
      },
    );
  }
}

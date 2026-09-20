import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/router/route_paths.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/date_formatters.dart';
import '../../core/widgets/app_app_bar.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/app_chip.dart';
import '../../core/widgets/app_empty_state.dart';
import '../../shared/providers/academic_providers.dart';

class ExamResultScreen extends ConsumerWidget {
  final String? examId;
  final String? resultId;

  const ExamResultScreen({super.key, this.examId, this.resultId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final resultsAsync = ref.watch(studentExamResultsProvider);
    final examsAsync = ref.watch(examsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'CBT Examination Scorecard',
        subtitle: 'Official Performance Analytics',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, size: 20),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Scorecard link ready to share.')),
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: AppSpacing.p16,
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(top: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.lightBorder)),
        ),
        child: AppButton(
          label: 'Back to Student Portal',
          onPressed: () => context.go(RoutePaths.studentShell),
          variant: AppButtonVariant.primary,
          isFullWidth: true,
        ),
      ),
      body: resultsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: AppEmptyState(
            icon: LucideIcons.alertCircle,
            title: 'Unable to Load Scorecard',
            message: e.toString(),
            actionLabel: 'Retry',
            onAction: () => ref.invalidate(studentExamResultsProvider),
          ),
        ),
        data: (results) {
          final result = results.where((r) {
            if (resultId != null && resultId!.isNotEmpty) return r.id == resultId;
            if (examId != null && examId!.isNotEmpty) return r.examId == examId;
            return false;
          }).firstOrNull;

          if (result == null) {
            return const Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(
                child: AppEmptyState(
                  icon: LucideIcons.fileQuestion,
                  title: 'No Scorecard Recorded',
                  message: 'No completed exam submission was found for this examination. Make sure you submit your test to generate a verified scorecard.',
                ),
              ),
            );
          }

          final allExams = examsAsync.asData?.value ?? [];
          final exam = allExams.where((e) => e.id == result.examId).firstOrNull;
          final questions = exam?.questions ?? [];

          return ListView(
            padding: AppSpacing.p16,
            children: [
              // Hero Performance Banner
              Container(
                decoration: BoxDecoration(
                  borderRadius: AppSpacing.radius20,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF312E81)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary500.withOpacity(0.25),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                padding: AppSpacing.p20,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.accentAmber.withOpacity(0.2),
                            borderRadius: AppSpacing.radiusFull,
                            border: Border.all(color: AppColors.accentAmber),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.award, size: 14, color: AppColors.accentAmber),
                              const SizedBox(width: 6),
                              Text(
                                result.percentage >= 50 ? 'QUALIFIED' : 'EVALUATED',
                                style: AppTypography.labelSmall(color: AppColors.accentAmber).copyWith(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          AppFormatters.formatShortDate(result.submittedAt),
                          style: AppTypography.labelSmall(color: Colors.white70),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text(
                      '${result.score} / ${result.totalMarks}',
                      style: AppTypography.displaySmall(color: Colors.white).copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Total Marks Obtained • Score: ${result.percentage.toStringAsFixed(1)}%',
                      style: AppTypography.bodySmall(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Exam Details Card
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'EXAM DETAILS',
                      style: AppTypography.labelSmall(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      result.examTitle,
                      style: AppTypography.titleMedium(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Official computer-based test conducted by OCI Institute.',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Questions & Solutions (if available)
              if (questions.isNotEmpty) ...[
                Text(
                  'QUESTION-BY-QUESTION SOLUTIONS',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 12),
                ...List.generate(questions.length, (idx) {
                  final q = questions[idx];
                  final correctOpt = q.options.isNotEmpty && q.correctOptionIndex < q.options.length
                      ? q.options[q.correctOptionIndex]
                      : 'Option ${q.correctOptionIndex + 1}';

                  return AppCard(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            AppChip(label: 'Q${idx + 1} • ${q.subject}', variant: AppChipVariant.primary, isSmall: true),
                            AppChip(label: '+${q.marks} Marks', variant: AppChipVariant.success, isSmall: true),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          q.question,
                          style: AppTypography.titleSmall(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: AppSpacing.radius8,
                            border: Border.all(color: AppColors.success.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Correct Answer: $correctOpt',
                                  style: AppTypography.labelLarge(color: AppColors.success).copyWith(fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (q.explanation.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Text(
                            'Solution:',
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            q.explanation,
                            style: AppTypography.bodySmall(
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }),
              ],
            ],
          );
        },
      ),
    );
  }
}

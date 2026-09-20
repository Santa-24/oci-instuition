import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/network/supabase_service.dart';
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
import '../auth/providers/auth_provider.dart';

class AssignmentDetailScreen extends ConsumerStatefulWidget {
  final String? assignmentId;

  const AssignmentDetailScreen({super.key, this.assignmentId});

  @override
  ConsumerState<AssignmentDetailScreen> createState() => _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState extends ConsumerState<AssignmentDetailScreen> {
  bool _hasSelectedFile = false;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final assignmentsAsync = ref.watch(assignmentsProvider);
    final assignmentList = assignmentsAsync.asData?.value ?? [];
    final assignment = assignmentList.where((a) => a.id == widget.assignmentId).firstOrNull ??
                       assignmentList.firstOrNull;

    if (assignment == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        appBar: const AppAppBar(
          title: 'Assignment Details',
          subtitle: 'Academic Submissions',
        ),
        body: Center(
          child: AppEmptyState(
            icon: LucideIcons.fileX,
            title: 'Assignment Not Found',
            message: 'This assignment is not available or has been removed from your batch curriculum.',
            actionLabel: 'Go Back',
            onAction: () => context.pop(),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Assignment Details',
        subtitle: assignment.subject,
      ),
      body: ListView(
        padding: AppSpacing.p16,
        children: [
          // Header card
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppChip(label: assignment.subject, variant: AppChipVariant.primary, isSmall: true),
                    Text(
                      'Total: ${assignment.totalMarks} Marks',
                      style: AppTypography.titleSmall(color: AppColors.primary500),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  assignment.title,
                  style: AppTypography.titleLarge(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(LucideIcons.calendar, size: 14, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                    const SizedBox(width: 6),
                    Text(
                      'Due: ${AppFormatters.formatFullDateTime(assignment.dueDate)}',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(LucideIcons.users, size: 14, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                    const SizedBox(width: 6),
                    Text(
                      'Batch: ${assignment.batchName}',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Instructions
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'INSTRUCTIONS & PROBLEM STATEMENTS',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  assignment.description,
                  style: AppTypography.bodyMedium(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ).copyWith(height: 1.5),
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(LucideIcons.paperclip, size: 16, color: AppColors.primary500),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Assignment_Brief_${assignment.subject}.pdf',
                        style: AppTypography.titleSmall(color: AppColors.primary500),
                      ),
                    ),
                    AppButton(
                      label: 'Download PDF',
                      variant: AppButtonVariant.ghost,
                      size: AppButtonSize.small,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Downloading problem worksheet...')),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Submission Section
          if (assignment.isSubmitted) ...[
            AppCard(
              backgroundColor: AppColors.success.withOpacity(0.08),
              child: Row(
                children: [
                  const Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Submission Received',
                          style: AppTypography.titleMedium(color: AppColors.success),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Submitted on ${AppFormatters.formatShortDate(assignment.submittedAt ?? DateTime.now())}',
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
          ] else ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SUBMIT YOUR WORK',
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () {
                      setState(() => _hasSelectedFile = !_hasSelectedFile);
                    },
                    borderRadius: AppSpacing.radius12,
                    child: Container(
                      width: double.infinity,
                      padding: AppSpacing.p20,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _hasSelectedFile ? AppColors.success : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                          width: _hasSelectedFile ? 2 : 1,
                        ),
                        borderRadius: AppSpacing.radius12,
                        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                      ),
                      child: Column(
                        children: [
                          Icon(
                            _hasSelectedFile ? LucideIcons.fileCheck : LucideIcons.uploadCloud,
                            size: 32,
                            color: _hasSelectedFile ? AppColors.success : AppColors.primary500,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _hasSelectedFile ? 'Solution_Document.pdf (Selected)' : 'Tap to Select Solution Document',
                            style: AppTypography.titleSmall(
                              color: _hasSelectedFile ? AppColors.success : AppColors.primary500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _hasSelectedFile ? 'Ready to submit' : 'Supports PDF, JPG, PNG (Max 15MB)',
                            style: AppTypography.labelSmall(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppButton(
                    label: _isSubmitting ? 'Uploading Solution...' : 'Submit Assignment',
                    isLoading: _isSubmitting,
                    onPressed: _hasSelectedFile
                        ? () async {
                            final user = ref.read(authStateProvider).asData?.value;
                            final studentId = user?.id ?? SupabaseService.currentUser?.id;
                            if (studentId == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Please log in to submit assignments.')),
                              );
                              return;
                            }

                            setState(() => _isSubmitting = true);
                            try {
                              await ref.read(academicRepositoryProvider).submitAssignment(
                                assignmentId: assignment.id,
                                studentId: studentId,
                                fileUrl: 'https://storage.oci.edu.in/assignments/submission_${DateTime.now().millisecondsSinceEpoch}.pdf',
                              );
                              ref.invalidate(assignmentsProvider);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Assignment submitted successfully.'),
                                    backgroundColor: AppColors.success,
                                  ),
                                );
                                context.pop();
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Submission failed: $e'),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                              }
                            } finally {
                              if (mounted) setState(() => _isSubmitting = false);
                            }
                          }
                        : null,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

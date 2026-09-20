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
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_chip.dart';
import '../../../core/widgets/live_badge.dart';
import '../../../shared/providers/academic_providers.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/services/app_update_service.dart';

class StudentDashboardScreen extends ConsumerStatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  ConsumerState<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends ConsumerState<StudentDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        AppUpdateService.checkForUpdates(context);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final user = ref.watch(authStateProvider).asData?.value;

    if (user == null) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final liveClassesAsync = ref.watch(liveClassesProvider);
    final assignmentsAsync = ref.watch(assignmentsProvider);
    final examsAsync = ref.watch(examsProvider);
    final notificationsAsync = ref.watch(notificationsProvider);
    final announcementsAsync = ref.watch(announcementsProvider);
    final progressAsync = ref.watch(studentProgressProvider);

    final liveClassList = liveClassesAsync.asData?.value ?? [];
    final ongoingLiveClass = liveClassList.where((c) => c.isLive).firstOrNull;
    final nextScheduledClass = liveClassList.where((c) => !c.isLive && c.status == 'scheduled').firstOrNull;

    final assignmentList = assignmentsAsync.asData?.value ?? [];
    final pendingAssignment = assignmentList.where((a) => a.isPending).firstOrNull ?? assignmentList.firstOrNull;

    final examList = examsAsync.asData?.value ?? [];
    final upcomingExam = examList.where((e) => e.isPublished).firstOrNull ?? examList.firstOrNull;

    final announcements = announcementsAsync.asData?.value ?? [];
    final urgentAnnouncement = announcements.where((a) => a.isUrgent).firstOrNull;

    final unreadCount = notificationsAsync.asData?.value.where((n) => !n.isRead).length ?? 0;
    final progress = progressAsync.asData?.value;

    final isNewStudent = (user.batchId == null || user.batchId!.isEmpty) &&
                         liveClassList.isEmpty &&
                         assignmentList.isEmpty &&
                         examList.isEmpty;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'OCI Institute',
        subtitle: user.batchName ?? 'Student Academic Portal',
        showNotificationAction: true,
        unreadNotifications: unreadCount,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(liveClassesProvider);
          ref.invalidate(assignmentsProvider);
          ref.invalidate(examsProvider);
          ref.invalidate(notificationsProvider);
          ref.invalidate(announcementsProvider);
          ref.invalidate(studentProgressProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: AppSpacing.p16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Editorial Student Identity Header
              _buildStudentHeader(context, user, isDark),
              const SizedBox(height: 16),

              // 2. Urgent Institutional Announcement (If any)
              if (urgentAnnouncement != null) ...[
                _buildUrgentNoticeBanner(context, urgentAnnouncement, isDark),
                const SizedBox(height: 16),
              ],

              // 3. Ongoing Live Classroom (Only if truly LIVE)
              if (ongoingLiveClass != null) ...[
                _buildLiveClassHero(context, ongoingLiveClass, isDark),
                const SizedBox(height: 20),
              ],

              // 4. Dynamic State Dispatcher
              if (isNewStudent)
                _buildNewStudentState(context, isDark)
              else if (upcomingExam != null)
                _buildActiveExamState(context, upcomingExam, pendingAssignment, isDark)
              else if (nextScheduledClass != null || pendingAssignment != null)
                _buildActiveStudentState(context, nextScheduledClass, pendingAssignment, isDark)
              else
                _buildCalmIdleState(context, isDark),

              const SizedBox(height: 24),

              // 5. Academic Hub Quick Nav (Editorial Rows, Not Cluttered Cards)
              _buildSectionHeader('ACADEMIC CURRICULUM & RESOURCES', isDark),
              const SizedBox(height: 12),
              _buildAcademicNavigationRow(context, isDark),

              const SizedBox(height: 24),

              // 6. Real Progress Status (Only if real activity exists)
              if (progress != null && progress.hasActivity) ...[
                _buildSectionHeader('ACADEMIC PROGRESS', isDark),
                const SizedBox(height: 12),
                _buildProgressSummary(context, progress, isDark),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStudentHeader(BuildContext context, dynamic user, bool isDark) {
    final rollText = user.rollNo != null && user.rollNo.toString().isNotEmpty
        ? user.rollNo.toString()
        : 'OCI-STU-${user.id.substring(0, user.id.length >= 6 ? 6 : user.id.length).toUpperCase()}';

    return Container(
      padding: AppSpacing.p16,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: AppSpacing.radius16,
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Row(
        children: [
          AppAvatar(name: user.fullName, size: 48),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.fullName,
                  style: AppTypography.titleLarge(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Roll No: $rollText',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
              borderRadius: AppSpacing.radius8,
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              ),
            ),
            child: Text(
              user.batchName != null && user.batchName.toString().isNotEmpty
                  ? user.batchName.toString()
                  : 'Enrolled Aspirant',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.primary400 : AppColors.primary600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUrgentNoticeBanner(BuildContext context, dynamic announcement, bool isDark) {
    return Container(
      padding: AppSpacing.p12,
      decoration: BoxDecoration(
        color: AppColors.accentRose.withOpacity(0.08),
        borderRadius: AppSpacing.radius12,
        border: Border.all(color: AppColors.accentRose.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.bellRing, size: 18, color: AppColors.accentRose),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  announcement.title,
                  style: AppTypography.titleSmall(color: AppColors.accentRose),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  announcement.content,
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveClassHero(BuildContext context, dynamic liveClass, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161B26) : const Color(0xFF0F172A),
        borderRadius: AppSpacing.radius16,
        border: Border.all(color: AppColors.liveRed.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.liveRed.withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: AppSpacing.p16,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const LiveBadge(label: 'LIVE NOW'),
              Text(
                liveClass.subject,
                style: AppTypography.labelSmall(color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            liveClass.title,
            style: AppTypography.titleLarge(color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            'Instructor: ${liveClass.teacherName}',
            style: AppTypography.bodySmall(color: Colors.white70),
          ),
          const SizedBox(height: 14),
          AppButton(
            label: 'Join Live Classroom',
            icon: const Icon(LucideIcons.radio, size: 16, color: Colors.white),
            onPressed: () {
              context.push(
                '${RoutePaths.liveClassroom}?classId=${liveClass.id}&title=${Uri.encodeComponent(liveClass.title)}&teacher=${Uri.encodeComponent(liveClass.teacherName)}&isHost=false',
              );
            },
            variant: AppButtonVariant.primary,
            size: AppButtonSize.medium,
            isFullWidth: true,
          ),
        ],
      ),
    );
  }

  /// State A: Brand New Student with No Assigned Batches Yet
  Widget _buildNewStudentState(BuildContext context, bool isDark) {
    return Container(
      padding: AppSpacing.p20,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: AppSpacing.radius16,
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary600.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.sparkles, color: AppColors.primary600, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome to OCI Institute',
                      style: AppTypography.titleMedium(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    Text(
                      'Your official academic profile is active.',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'What happens next?',
            style: AppTypography.labelMedium(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 8),
          _buildOnboardingStep(
            '1',
            'Batch Allocation',
            'The administration desk will allocate your batch and curriculum schedule.',
            isDark,
          ),
          const SizedBox(height: 8),
          _buildOnboardingStep(
            '2',
            'Live Classes & Materials',
            'Once assigned, your daily lectures and study materials will appear automatically.',
            isDark,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'View Course Catalog',
                  variant: AppButtonVariant.outline,
                  size: AppButtonSize.small,
                  onPressed: () => context.push(RoutePaths.studentLearn),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: 'Support Desk',
                  variant: AppButtonVariant.secondary,
                  size: AppButtonSize.small,
                  onPressed: () => context.push(RoutePaths.studentProfile),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOnboardingStep(String number, String title, String description, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20,
          height: 20,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
            shape: BoxShape.circle,
          ),
          child: Text(
            number,
            style: AppTypography.labelSmall(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ).copyWith(fontSize: 10),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.labelMedium(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              Text(
                description,
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// State B: Active Student with scheduled lectures & tasks
  Widget _buildActiveStudentState(BuildContext context, dynamic scheduledClass, dynamic assignment, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (scheduledClass != null) ...[
          _buildSectionHeader('NEXT SCHEDULED LECTURE', isDark),
          const SizedBox(height: 10),
          Container(
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
                      label: scheduledClass.subject,
                      variant: AppChipVariant.primary,
                      isSmall: true,
                    ),
                    Text(
                      AppFormatters.formatTime(scheduledClass.scheduledStart),
                      style: AppTypography.labelMedium(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  scheduledClass.title,
                  style: AppTypography.titleMedium(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Faculty: ${scheduledClass.teacherName}',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: 12),
                AppButton(
                  label: 'View Timetable',
                  variant: AppButtonVariant.outline,
                  size: AppButtonSize.small,
                  onPressed: () => context.push(RoutePaths.studentClasses),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        if (assignment != null) ...[
          _buildSectionHeader('PENDING WORK & HOMEWORK', isDark),
          const SizedBox(height: 10),
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
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accentAmber.withOpacity(0.12),
                    borderRadius: AppSpacing.radius12,
                  ),
                  child: const Icon(LucideIcons.fileText, color: AppColors.accentAmber, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        assignment.title,
                        style: AppTypography.titleSmall(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Due: ${AppFormatters.formatDate(assignment.dueDate)} • ${assignment.subject}',
                        style: AppTypography.bodySmall(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                AppButton(
                  label: 'Submit',
                  variant: AppButtonVariant.ghost,
                  size: AppButtonSize.small,
                  onPressed: () {
                    context.push(
                      '${RoutePaths.assignmentDetail}?id=${assignment.id}&title=${Uri.encodeComponent(assignment.title)}&subject=${Uri.encodeComponent(assignment.subject)}&dueDate=${Uri.encodeComponent(assignment.dueDate.toIso8601String())}',
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  /// State C: Active Examination Period
  Widget _buildActiveExamState(BuildContext context, dynamic exam, dynamic assignment, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('EXAMINATION IN PROGRESS', isDark),
        const SizedBox(height: 10),
        Container(
          padding: AppSpacing.p16,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: AppSpacing.radius16,
            border: Border.all(color: AppColors.primary600.withOpacity(0.4), width: 1.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const AppChip(label: 'CBT MOCK TEST', variant: AppChipVariant.primary, isSmall: true),
                  Text(
                    '${exam.durationMinutes} Minutes',
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                exam.title,
                style: AppTypography.titleLarge(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Total Marks: ${exam.totalMarks} • Verified CBT Pattern',
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 14),
              AppButton(
                label: 'Enter CBT Exam Room',
                icon: const Icon(LucideIcons.arrowRight, size: 16, color: Colors.white),
                variant: AppButtonVariant.primary,
                size: AppButtonSize.medium,
                isFullWidth: true,
                onPressed: () {
                  context.push(
                    '${RoutePaths.examRoom}?examId=${exam.id}&title=${Uri.encodeComponent(exam.title)}',
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// State D: Calm Idle State (All Caught Up)
  Widget _buildCalmIdleState(BuildContext context, bool isDark) {
    return Container(
      padding: AppSpacing.p20,
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
              LucideIcons.calendarCheck,
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'All Caught Up',
                  style: AppTypography.titleMedium(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                Text(
                  'No pending lectures or tests right now.',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
          AppButton(
            label: 'Timetable',
            variant: AppButtonVariant.ghost,
            size: AppButtonSize.small,
            onPressed: () => context.push(RoutePaths.studentClasses),
          ),
        ],
      ),
    );
  }

  Widget _buildAcademicNavigationRow(BuildContext context, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: _buildNavigationTile(
            context,
            icon: LucideIcons.video,
            title: 'Classroom',
            subtitle: 'Live & Schedule',
            onTap: () => context.push(RoutePaths.studentClasses),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildNavigationTile(
            context,
            icon: LucideIcons.bookOpen,
            title: 'Syllabus',
            subtitle: 'Notes & Vault',
            onTap: () => context.push(RoutePaths.studentLearn),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildNavigationTile(
            context,
            icon: LucideIcons.award,
            title: 'Tests',
            subtitle: 'CBT Mocks',
            onTap: () => context.push(RoutePaths.studentTests),
            isDark: isDark,
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return Material(
      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      borderRadius: AppSpacing.radius12,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppSpacing.radius12,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: AppSpacing.radius12,
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 20, color: isDark ? AppColors.primary400 : AppColors.primary600),
              const SizedBox(height: 8),
              Text(
                title,
                style: AppTypography.titleSmall(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ).copyWith(fontSize: 10),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressSummary(BuildContext context, dynamic progress, bool isDark) {
    return Container(
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
                  'Curriculum Activity',
                  style: AppTypography.titleSmall(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${progress.completed} of ${progress.totalAssigned} academic tasks completed',
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            progress.percentageText,
            style: AppTypography.headlineMedium(
              color: isDark ? AppColors.primary400 : AppColors.primary600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Text(
      title,
      style: AppTypography.labelSmall(
        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
      ),
    );
  }
}

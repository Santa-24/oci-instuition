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
import '../../../core/widgets/live_badge.dart';
import '../../../shared/models/live_class_model.dart';
import '../../../shared/providers/academic_providers.dart';
import '../../auth/providers/auth_provider.dart';

class StudentClassesScreen extends ConsumerStatefulWidget {
  const StudentClassesScreen({super.key});

  @override
  ConsumerState<StudentClassesScreen> createState() => _StudentClassesScreenState();
}

class _StudentClassesScreenState extends ConsumerState<StudentClassesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Classroom & Schedule',
        subtitle: 'Live batches, upcoming sessions & archives',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: isDark ? AppColors.primary400 : AppColors.primary600,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: const [
            Tab(text: 'Today & Live'),
            Tab(text: 'Batch Schedule'),
            Tab(text: 'Recordings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTodayAndLiveTab(context, isDark),
          _buildBatchScheduleTab(context, isDark),
          _buildRecordingsTab(context, isDark),
        ],
      ),
    );
  }

  Widget _buildTodayAndLiveTab(BuildContext context, bool isDark) {
    final liveClassesAsync = ref.watch(liveClassesProvider);

    return liveClassesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Classes',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(liveClassesProvider),
        ),
      ),
      data: (allClasses) {
        final liveClasses = allClasses.where((c) => c.isLive).toList();
        final scheduledToday = allClasses.where((c) => !c.isLive && c.status == 'scheduled').toList();

        if (liveClasses.isEmpty && scheduledToday.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(liveClassesProvider),
            child: ListView(
              padding: AppSpacing.p24,
              children: [
                const SizedBox(height: 40),
                AppEmptyState(
                  icon: LucideIcons.calendarCheck,
                  title: 'No Classes Scheduled Today',
                  message: 'You have no active live sessions or lectures scheduled for today. Check your batch schedule or review video archives.',
                  actionLabel: 'Refresh Schedule',
                  onAction: () => ref.invalidate(liveClassesProvider),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(liveClassesProvider),
          child: ListView(
            padding: AppSpacing.p16,
            children: [
              if (liveClasses.isNotEmpty) ...[
                Text(
                  'LIVE SESSIONS NOW',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 12),
                ...liveClasses.map((cls) => _buildLiveClassCard(context, cls, isDark)),
                const SizedBox(height: 24),
              ],

              if (scheduledToday.isNotEmpty) ...[
                Text(
                  'TODAY\'S UPCOMING SESSIONS',
                  style: AppTypography.labelSmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(height: 12),
                ...scheduledToday.map((cls) => _buildScheduledClassCard(context, cls, isDark)),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildLiveClassCard(BuildContext context, LiveClassModel cls, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: AppSpacing.p16,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161B26) : const Color(0xFF0F172A),
        borderRadius: AppSpacing.radius16,
        border: Border.all(color: AppColors.liveRed.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.liveRed.withOpacity(0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const LiveBadge(label: 'LIVE CLASSROOM'),
              Text(
                cls.subject,
                style: AppTypography.labelSmall(color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            cls.title,
            style: AppTypography.titleLarge(color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            'Instructor: ${cls.teacherName}',
            style: AppTypography.bodySmall(color: Colors.white70),
          ),
          const SizedBox(height: 14),
          AppButton(
            label: 'Enter Live Classroom',
            icon: const Icon(LucideIcons.radio, size: 16, color: Colors.white),
            variant: AppButtonVariant.primary,
            size: AppButtonSize.medium,
            isFullWidth: true,
            onPressed: () {
              context.push(
                '${RoutePaths.liveClassroom}?classId=${cls.id}&title=${Uri.encodeComponent(cls.title)}&teacher=${Uri.encodeComponent(cls.teacherName)}&isHost=false',
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildScheduledClassCard(BuildContext context, LiveClassModel cls, bool isDark) {
    return Container(
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
              AppChip(label: cls.subject, variant: AppChipVariant.primary, isSmall: true),
              Text(
                AppFormatters.formatTime(cls.scheduledStart),
                style: AppTypography.labelMedium(
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            cls.title,
            style: AppTypography.titleMedium(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Instructor: ${cls.teacherName}',
            style: AppTypography.bodySmall(
              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          if (cls.batchName.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(LucideIcons.mapPin, size: 12, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                const SizedBox(width: 4),
                Text(
                  cls.batchName,
                  style: AppTypography.bodySmall(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ).copyWith(fontSize: 11),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBatchScheduleTab(BuildContext context, bool isDark) {
    final user = ref.watch(authStateProvider).asData?.value;
    final batchesAsync = ref.watch(batchesProvider);

    return batchesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Batch Info',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(batchesProvider),
        ),
      ),
      data: (batches) {
        final assignedBatch = batches.where((b) => b.id == user?.batchId).firstOrNull ??
                              (user?.batchName != null ? batches.where((b) => b.name == user?.batchName).firstOrNull : null);

        if (assignedBatch == null) {
          return Padding(
            padding: AppSpacing.p24,
            child: Center(
              child: AppEmptyState(
                icon: LucideIcons.calendarDays,
                title: 'No Batch Assigned Yet',
                message: 'Your official batch timetable will appear here as soon as the admission desk assigns you to an active batch.',
              ),
            ),
          );
        }

        return ListView(
          padding: AppSpacing.p16,
          children: [
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
                        label: assignedBatch.status.toUpperCase(),
                        variant: AppChipVariant.primary,
                        isSmall: true,
                      ),
                      Text(
                        'Capacity: ${assignedBatch.capacity} Seats',
                        style: AppTypography.labelSmall(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    assignedBatch.name,
                    style: AppTypography.titleLarge(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (assignedBatch.roomName.isNotEmpty) ...[
                    Row(
                      children: [
                        Icon(LucideIcons.doorOpen, size: 14, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        const SizedBox(width: 6),
                        Text(
                          'Lecture Hall: ${assignedBatch.roomName}',
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                  ],
                  if (assignedBatch.schedule.isNotEmpty) ...[
                    Row(
                      children: [
                        Icon(LucideIcons.clock, size: 14, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        const SizedBox(width: 6),
                        Text(
                          'Timing: ${assignedBatch.schedule}',
                          style: AppTypography.bodySmall(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildRecordingsTab(BuildContext context, bool isDark) {
    final recordedClassesAsync = ref.watch(recordedClassesProvider);

    return recordedClassesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: AppEmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Unable to Load Recordings',
          message: err.toString(),
          actionLabel: 'Retry',
          onAction: () => ref.invalidate(recordedClassesProvider),
        ),
      ),
      data: (recordings) {
        if (recordings.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(recordedClassesProvider),
            child: ListView(
              padding: AppSpacing.p24,
              children: [
                const SizedBox(height: 40),
                AppEmptyState(
                  icon: LucideIcons.videoOff,
                  title: 'No Video Archives Available',
                  message: 'Archived class recordings will become available once faculty members conclude and upload their live lecture streams.',
                  actionLabel: 'Refresh',
                  onAction: () => ref.invalidate(recordedClassesProvider),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(recordedClassesProvider),
          child: ListView.builder(
            padding: AppSpacing.p16,
            itemCount: recordings.length,
            itemBuilder: (context, index) {
              final rec = recordings[index];
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
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurfaceElevated,
                        borderRadius: AppSpacing.radius12,
                      ),
                      child: Icon(
                        LucideIcons.playCircle,
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
                            rec.title,
                            style: AppTypography.titleSmall(
                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            rec.subject,
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
          ),
        );
      },
    );
  }
}

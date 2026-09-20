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
import '../../../shared/models/batch_model.dart';
import '../../../shared/models/live_class_model.dart';
import '../../../shared/providers/academic_providers.dart';

class FacultyClassesScreen extends ConsumerStatefulWidget {
  const FacultyClassesScreen({super.key});

  @override
  ConsumerState<FacultyClassesScreen> createState() => _FacultyClassesScreenState();
}

class _FacultyClassesScreenState extends ConsumerState<FacultyClassesScreen>
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

  void _showScheduleClassModal(BuildContext context, List<BatchModel> batches) {
    final titleController = TextEditingController();
    String selectedSubject = 'Physics';
    String selectedBatchId = batches.isNotEmpty ? batches.first.id : 'batch_alpha';
    String selectedBatchName = batches.isNotEmpty ? batches.first.name : 'JEE Alpha Super 30';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkSurface
          : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          return Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Schedule Live Lecture', style: AppTypography.titleLarge()),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Lecture Topic / Title',
                    hintText: 'e.g. Electromagnetic Induction & Lenz Law',
                  ),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: selectedSubject,
                  decoration: const InputDecoration(labelText: 'Subject'),
                  items: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (val) => setModalState(() => selectedSubject = val ?? 'Physics'),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: selectedBatchId,
                  decoration: const InputDecoration(labelText: 'Assign to Batch'),
                  items: batches
                      .map((b) => DropdownMenuItem(value: b.id, child: Text(b.name)))
                      .toList(),
                  onChanged: (val) {
                    setModalState(() {
                      selectedBatchId = val ?? '';
                      selectedBatchName = batches.firstWhere((b) => b.id == val, orElse: () => batches.first).name;
                    });
                  },
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Publish Live Class',
                  icon: const Icon(LucideIcons.video, size: 18),
                  isFullWidth: true,
                  onPressed: () async {
                    final title = titleController.text.trim().isNotEmpty
                        ? titleController.text.trim()
                        : '$selectedSubject Advanced Lecture';

                    final now = DateTime.now();
                    final start = now.add(const Duration(minutes: 5));
                    final end = start.add(const Duration(hours: 1, minutes: 30));

                    Navigator.pop(ctx);

                    await ref.read(academicRepositoryProvider).createLiveClass(
                          title: title,
                          subject: selectedSubject,
                          batchId: selectedBatchId,
                          batchName: selectedBatchName,
                          scheduledStart: start,
                          scheduledEnd: end,
                        );

                    ref.invalidate(liveClassesProvider);

                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Class "$title" scheduled & broadcasted!'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final batchesAsync = ref.watch(batchesProvider);
    final batches = batchesAsync.asData?.value ?? [];

    final liveClassesAsync = ref.watch(liveClassesProvider);
    final liveClasses = liveClassesAsync.asData?.value ?? [];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Assigned Batches & Classes',
        subtitle: 'Classroom management & live lecture scheduling',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary500,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: [
            Tab(text: 'My Batches (${batches.length})'),
            Tab(text: 'Schedule & Live (${liveClasses.length})'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary500,
        foregroundColor: Colors.white,
        icon: const Icon(LucideIcons.plus, size: 20),
        label: const Text('Schedule Class'),
        onPressed: () => _showScheduleClassModal(context, batches),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBatchesTab(context, batches, isDark),
          _buildScheduleTab(context, liveClasses, isDark),
        ],
      ),
    );
  }

  Widget _buildBatchesTab(BuildContext context, List<BatchModel> batches, bool isDark) {
    if (batches.isEmpty) {
      return const Center(
        child: AppEmptyState(
          icon: LucideIcons.layers,
          title: 'No Batches Assigned',
          message: 'You have not been assigned to any active batches yet. Consult institute administration.',
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
      itemCount: batches.length,
      itemBuilder: (context, index) {
        final batch = batches[index];
        return AppCard(
          margin: const EdgeInsets.only(bottom: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppChip(label: batch.courseName, variant: AppChipVariant.primary, isSmall: true),
                  Text(
                    '${batch.enrolledCount} / ${batch.capacity} Students',
                    style: AppTypography.labelSmall(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                batch.name,
                style: AppTypography.titleMedium(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Weekly Schedule: ${batch.schedule} • Room: ${batch.roomName}',
                style: AppTypography.bodySmall(
                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Launch Class',
                      icon: const Icon(LucideIcons.video, size: 16),
                      variant: AppButtonVariant.primary,
                      size: AppButtonSize.small,
                      onPressed: () {
                        context.push(
                          '${RoutePaths.liveClassroom}?title=${Uri.encodeComponent(batch.name)}&subject=Physics&room=${Uri.encodeComponent(batch.id)}',
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: 'Course Notes',
                      icon: const Icon(LucideIcons.fileText, size: 16),
                      variant: AppButtonVariant.outline,
                      size: AppButtonSize.small,
                      onPressed: () {
                        context.push(RoutePaths.facultyContent);
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

  Widget _buildScheduleTab(BuildContext context, List<LiveClassModel> liveClasses, bool isDark) {
    if (liveClasses.isEmpty) {
      return Center(
        child: Text('No classes scheduled yet', style: AppTypography.bodyMedium()),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
      itemCount: liveClasses.length,
      itemBuilder: (context, index) {
        final cls = liveClasses[index];
        return AppCard(
          margin: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                width: 54,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: cls.isLive
                      ? AppColors.error.withValues(alpha: 0.15)
                      : AppColors.primary500.withValues(alpha: 0.12),
                  borderRadius: AppSpacing.radius12,
                ),
                child: Column(
                  children: [
                    Icon(
                      cls.isLive ? LucideIcons.radio : LucideIcons.calendar,
                      size: 18,
                      color: cls.isLive ? AppColors.error : AppColors.primary500,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      cls.isLive ? 'LIVE' : AppFormatters.formatShortDate(cls.scheduledStart).split(' ').first,
                      style: AppTypography.labelSmall(
                        color: cls.isLive ? AppColors.error : AppColors.primary500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppChip(label: cls.subject, variant: AppChipVariant.primary, isSmall: true),
                        Text(
                          AppFormatters.formatTimeOnly(cls.scheduledStart),
                          style: AppTypography.labelSmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      cls.title,
                      style: AppTypography.titleSmall(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${cls.batchName} • Jitsi: ${cls.jitsiRoomName}',
                      style: AppTypography.bodySmall(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(LucideIcons.arrowRight, size: 18),
                onPressed: () {
                  context.push(
                    '${RoutePaths.liveClassroom}?title=${Uri.encodeComponent(cls.title)}&subject=${Uri.encodeComponent(cls.subject)}&room=${Uri.encodeComponent(cls.jitsiRoomName)}',
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

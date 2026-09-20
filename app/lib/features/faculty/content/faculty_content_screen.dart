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
import '../../../shared/models/study_material_model.dart';
import '../../../shared/providers/academic_providers.dart';

class FacultyContentScreen extends ConsumerStatefulWidget {
  const FacultyContentScreen({super.key});

  @override
  ConsumerState<FacultyContentScreen> createState() => _FacultyContentScreenState();
}

class _FacultyContentScreenState extends ConsumerState<FacultyContentScreen>
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

  void _showUploadDialog(BuildContext context) {
    final titleController = TextEditingController();
    String selectedType = 'DPP';
    String selectedSubject = 'Physics';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkSurface
          : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Upload Academic Material', style: AppTypography.titleMedium()),
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
                  labelText: 'Material Title',
                  hintText: 'e.g. Daily Practice Paper #15',
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: selectedSubject,
                      decoration: const InputDecoration(labelText: 'Subject'),
                      items: ['Physics', 'Chemistry', 'Mathematics'].map((s) {
                        return DropdownMenuItem(value: s, child: Text(s));
                      }).toList(),
                      onChanged: (v) => setModalState(() => selectedSubject = v!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: selectedType,
                      decoration: const InputDecoration(labelText: 'Type'),
                      items: ['DPP', 'Theory Notes', 'Formula Sheet', 'PYQ'].map((t) {
                        return DropdownMenuItem(value: t, child: Text(t));
                      }).toList(),
                      onChanged: (v) => setModalState(() => selectedType = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.primary500.withOpacity(0.5), style: BorderStyle.solid),
                  borderRadius: AppSpacing.radius12,
                  color: AppColors.primary500.withOpacity(0.05),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(LucideIcons.fileUp, color: AppColors.primary500, size: 20),
                    SizedBox(width: 8),
                    Text('Select PDF from device (Max 25MB)', style: TextStyle(color: AppColors.primary500)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              AppButton(
                label: 'Publish to Batch Roster',
                onPressed: () async {
                  final title = titleController.text.trim().isNotEmpty
                      ? titleController.text.trim()
                      : '$selectedSubject $selectedType Material';
                  Navigator.pop(ctx);
                  await ref.read(academicRepositoryProvider).createStudyMaterial(
                        title: title,
                        subject: selectedSubject,
                        type: selectedType,
                        fileUrl: 'https://intuition-institute.edu/materials/${selectedSubject.toLowerCase()}_handbook.pdf',
                        batchName: 'All Batches',
                      );
                  ref.invalidate(studyMaterialsProvider);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Study material "$title" published & synced!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final materialsAsync = ref.watch(studyMaterialsProvider);
    final materials = materialsAsync.asData?.value ?? [];
    final recordingsAsync = ref.watch(recordedClassesProvider);
    final recordings = recordingsAsync.asData?.value ?? [];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppAppBar(
        title: 'Content & Material Vault',
        subtitle: 'Upload study notes, DPPs & video recordings',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary500,
          labelColor: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          labelStyle: AppTypography.titleSmall(),
          unselectedLabelStyle: AppTypography.bodyMedium(),
          tabs: [
            Tab(text: 'Documents & DPPs (${materials.length})'),
            Tab(text: 'Recorded Lectures (${recordings.length})'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showUploadDialog(context),
        backgroundColor: AppColors.primary500,
        icon: const Icon(LucideIcons.uploadCloud, color: Colors.white, size: 18),
        label: const Text('Upload Material', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMaterialsList(context, materials, isDark),
          _buildRecordingsList(context, recordings, isDark),
        ],
      ),
    );
  }

  Widget _buildMaterialsList(BuildContext context, List<StudyMaterialModel> materials, bool isDark) {
    if (materials.isEmpty) {
      return const Center(
        child: AppEmptyState(
          icon: LucideIcons.fileText,
          title: 'No Materials Uploaded',
          message: 'You have not uploaded any study documents, notes, or DPPs yet.',
        ),
      );
    }
    return ListView.builder(
      padding: AppSpacing.p16,
      itemCount: materials.length,
      itemBuilder: (context, index) {
        final mat = materials[index];
        return AppCard(
          margin: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary500.withOpacity(0.12),
                  borderRadius: AppSpacing.radius12,
                ),
                child: const Icon(LucideIcons.fileText, color: AppColors.primary500, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        AppChip(label: mat.type, variant: AppChipVariant.primary, isSmall: true),
                        Text(
                          '${mat.downloadCount} Downloads',
                          style: AppTypography.labelSmall(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      mat.title,
                      style: AppTypography.titleSmall(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${mat.batchName} • ${AppFormatters.formatShortDate(mat.uploadDate)}',
                      style: AppTypography.labelSmall(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(LucideIcons.moreVertical, size: 18),
                onSelected: (val) {
                  if (val == 'view') {
                    context.push(RoutePaths.documentViewer);
                  } else if (val == 'delete') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Material deleted')),
                    );
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'view', child: Text('Preview Document')),
                  const PopupMenuItem(value: 'delete', child: Text('Remove from Batch')),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRecordingsList(BuildContext context, List<RecordedLectureModel> recordings, bool isDark) {
    return ListView.builder(
      padding: AppSpacing.p16,
      itemCount: recordings.length,
      itemBuilder: (context, index) {
        final rec = recordings[index];
        return AppCard(
          margin: const EdgeInsets.only(bottom: 12),
          onTap: () {
            context.push(
              '${RoutePaths.videoPlayer}?videoUrl=${Uri.encodeComponent(rec.videoUrl)}&title=${Uri.encodeComponent(rec.title)}',
            );
          },
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primary900,
                  borderRadius: AppSpacing.radius12,
                ),
                child: const Center(
                  child: Icon(LucideIcons.playCircle, color: Colors.white, size: 28),
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
                        AppChip(label: rec.subject, variant: AppChipVariant.primary, isSmall: true),
                        const AppChip(label: 'Published', variant: AppChipVariant.success, isSmall: true),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      rec.title,
                      style: AppTypography.titleSmall(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${AppFormatters.formatDurationMinutes(rec.durationSeconds)} • ${AppFormatters.formatShortDate(rec.recordedDate)}',
                      style: AppTypography.labelSmall(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

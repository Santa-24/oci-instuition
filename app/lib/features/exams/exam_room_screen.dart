import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/router/route_paths.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/network/supabase_service.dart';
import '../../core/widgets/app_empty_state.dart';
import '../../shared/models/exam_model.dart';
import '../../shared/providers/academic_providers.dart';
import '../auth/providers/auth_provider.dart';

enum QuestionStatus { answered, unanswered, markedForReview, notVisited }

class ExamRoomScreen extends ConsumerStatefulWidget {
  final String? examId;
  final String? title;

  const ExamRoomScreen({
    super.key,
    this.examId,
    this.title,
  });

  @override
  ConsumerState<ExamRoomScreen> createState() => _ExamRoomScreenState();
}

class _ExamRoomScreenState extends ConsumerState<ExamRoomScreen> {
  late int _remainingSeconds;
  Timer? _timer;
  int _currentQuestionIndex = 0;
  late List<QuestionModel> _questions;

  // Track responses: question index -> chosen option index
  final Map<int, int> _userResponses = {};
  // Track review marks: question index -> bool
  final Set<int> _markedForReview = {};

  @override
  void initState() {
    super.initState();
    _remainingSeconds = 180 * 60; // 3 hours
    _questions = const [];

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _timer?.cancel();
        _autoSubmit();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadQuestions();
    });
  }

  Future<void> _loadQuestions() async {
    if (widget.examId == null || widget.examId!.isEmpty) return;
    final allExams = await ref.read(academicRepositoryProvider).getExams();
    final currentExam = allExams.where((e) => e.id == widget.examId).firstOrNull;
    if (currentExam != null && currentExam.questions.isNotEmpty) {
      if (mounted) {
        setState(() {
          _questions = currentExam.questions;
          _remainingSeconds = currentExam.durationMinutes * 60;
        });
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTimer(int totalSec) {
    final h = (totalSec ~/ 3600).toString().padLeft(2, '0');
    final m = ((totalSec % 3600) ~/ 60).toString().padLeft(2, '0');
    final s = (totalSec % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  QuestionStatus _getQuestionStatus(int index) {
    final hasAnswer = _userResponses.containsKey(index);
    final isMarked = _markedForReview.contains(index);

    if (isMarked) return QuestionStatus.markedForReview;
    if (hasAnswer) return QuestionStatus.answered;
    if (index <= _currentQuestionIndex) return QuestionStatus.unanswered;
    return QuestionStatus.notVisited;
  }

  void _showPaletteSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkSurface
          : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: AppSpacing.p20,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Question Palette', style: AppTypography.titleMedium()),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Legend
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _buildLegendItem(AppColors.success, 'Answered'),
                _buildLegendItem(AppColors.error, 'Unanswered'),
                _buildLegendItem(Colors.purple, 'Review'),
                _buildLegendItem(Colors.grey, 'Not Visited'),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            // Grid of questions
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 6,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: _questions.length,
              itemBuilder: (context, i) {
                final status = _getQuestionStatus(i);
                Color btnColor = Colors.grey.withOpacity(0.3);
                if (status == QuestionStatus.answered) btnColor = AppColors.success;
                if (status == QuestionStatus.unanswered) btnColor = AppColors.error;
                if (status == QuestionStatus.markedForReview) btnColor = Colors.purple;

                return InkWell(
                  onTap: () {
                    Navigator.pop(ctx);
                    setState(() => _currentQuestionIndex = i);
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: btnColor,
                      borderRadius: AppSpacing.radius8,
                      border: i == _currentQuestionIndex
                          ? Border.all(color: Colors.white, width: 2)
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  void _confirmSubmit() {
    final answeredCount = _userResponses.length;
    final totalCount = _questions.length;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? AppColors.darkSurface
            : AppColors.lightSurface,
        title: Text('Submit CBT Examination?', style: AppTypography.titleMedium()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Are you sure you want to end this exam? You cannot modify your responses once submitted.'),
            const SizedBox(height: 14),
            Text('• Questions Answered: $answeredCount of $totalCount', style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('• Marked for Review: ${_markedForReview.length}'),
            Text('• Unanswered: ${totalCount - answeredCount}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Resume Test'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
            onPressed: () {
              Navigator.pop(ctx);
              _autoSubmit();
            },
            child: const Text('Submit Final Exam', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _autoSubmit() async {
    _timer?.cancel();
    int score = 0;
    for (int i = 0; i < _questions.length; i++) {
      final chosen = _userResponses[i];
      if (chosen != null) {
        if (chosen == _questions[i].correctOptionIndex) {
          score += _questions[i].marks;
        } else {
          score -= _questions[i].negativeMarks;
        }
      }
    }
    if (score < 0) score = 0;

    final user = ref.read(authStateProvider).asData?.value;
    final studentId = user?.id ?? SupabaseService.currentUser?.id;
    if (studentId == null) {
      if (mounted) context.pop();
      return;
    }

    try {
      if (widget.examId != null && widget.examId!.isNotEmpty) {
        await ref.read(academicRepositoryProvider).submitExamResult(
          examId: widget.examId!,
          studentId: studentId,
          score: score,
          totalMarks: _questions.length * 4,
          responses: _userResponses.map((k, v) => MapEntry(k.toString(), v)),
        );
        ref.invalidate(studentExamResultsProvider);
      }
    } catch (e) {
      debugPrint('Error saving exam result: $e');
    }

    if (mounted) {
      context.pushReplacement('${RoutePaths.examResult}?examId=${widget.examId ?? ""}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        appBar: AppBar(
          title: Text(widget.title ?? 'CBT Examination'),
        ),
        body: const Center(
          child: AppEmptyState(
            icon: LucideIcons.fileQuestion,
            title: 'No Questions Loaded',
            message: 'There are no questions configured for this examination session.',
          ),
        ),
      );
    }

    final currentQuestion = _questions[_currentQuestionIndex];
    final selectedOption = _userResponses[_currentQuestionIndex];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.title ?? 'CBT Examination', style: AppTypography.titleSmall()),
            Text('Subject: ${currentQuestion.subject}', style: AppTypography.labelSmall(color: Colors.grey)),
          ],
        ),
        actions: [
          // Countdown timer badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            margin: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.accentAmber.withOpacity(0.15),
              borderRadius: AppSpacing.radius8,
              border: Border.all(color: AppColors.accentAmber),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.clock, size: 14, color: AppColors.accentAmber),
                const SizedBox(width: 6),
                Text(
                  _formatTimer(_remainingSeconds),
                  style: AppTypography.titleSmall(color: AppColors.accentAmber),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(LucideIcons.layoutGrid, size: 20),
            onPressed: _showPaletteSheet,
          ),
          const SizedBox(width: 8),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(top: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.lightBorder)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Mark for review
            OutlinedButton.icon(
              icon: const Icon(LucideIcons.bookmark, size: 16, color: Colors.purple),
              label: const Text('Review', style: TextStyle(color: Colors.purple)),
              onPressed: () {
                setState(() {
                  if (_markedForReview.contains(_currentQuestionIndex)) {
                    _markedForReview.remove(_currentQuestionIndex);
                  } else {
                    _markedForReview.add(_currentQuestionIndex);
                  }
                  if (_currentQuestionIndex < _questions.length - 1) {
                    _currentQuestionIndex++;
                  }
                });
              },
            ),
            // Clear Response
            TextButton(
              onPressed: selectedOption != null
                  ? () => setState(() => _userResponses.remove(_currentQuestionIndex))
                  : null,
              child: const Text('Clear'),
            ),
            // Save & Next / Finish
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary500,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                if (_currentQuestionIndex < _questions.length - 1) {
                  setState(() => _currentQuestionIndex++);
                } else {
                  _confirmSubmit();
                }
              },
              child: Text(
                _currentQuestionIndex == _questions.length - 1 ? 'Finish & Submit' : 'Save & Next',
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: AppSpacing.p16,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Question meta header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary500.withOpacity(0.1),
                    borderRadius: AppSpacing.radius8,
                  ),
                  child: Text(
                    'Question ${_currentQuestionIndex + 1} of ${_questions.length}',
                    style: AppTypography.titleSmall(color: AppColors.primary500),
                  ),
                ),
                Text(
                  'Marking: +${currentQuestion.marks} / -${currentQuestion.negativeMarks}',
                  style: AppTypography.labelSmall(color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Question Statement
            Container(
              padding: AppSpacing.p16,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: AppSpacing.radius16,
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              child: Text(
                currentQuestion.question,
                style: AppTypography.titleMedium(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ).copyWith(height: 1.5),
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'SELECT CORRECT OPTION:',
              style: AppTypography.labelSmall(
                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              ),
            ),
            const SizedBox(height: 12),

            // 4 Options
            ...List.generate(currentQuestion.options.length, (optIdx) {
              final optionText = currentQuestion.options[optIdx];
              final isChosen = selectedOption == optIdx;
              final optionLabels = ['(A)', '(B)', '(C)', '(D)'];

              return InkWell(
                onTap: () {
                  setState(() {
                    _userResponses[_currentQuestionIndex] = optIdx;
                    _markedForReview.remove(_currentQuestionIndex);
                  });
                },
                borderRadius: AppSpacing.radius12,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: AppSpacing.p16,
                  decoration: BoxDecoration(
                    color: isChosen
                        ? AppColors.primary500.withOpacity(0.12)
                        : (isDark ? AppColors.darkSurface : AppColors.lightSurface),
                    borderRadius: AppSpacing.radius12,
                    border: Border.all(
                      color: isChosen ? AppColors.primary500 : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      width: isChosen ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isChosen ? AppColors.primary500 : Colors.grey.withOpacity(0.2),
                        ),
                        child: Center(
                          child: Text(
                            optionLabels[optIdx],
                            style: TextStyle(
                              color: isChosen ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          optionText,
                          style: AppTypography.bodyMedium(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

import 'exam_model.dart';

class QuestionAnalysis {
  final QuestionModel question;
  final int? selectedOptionIndex;
  final bool isCorrect;
  final bool isAttempted;

  const QuestionAnalysis({
    required this.question,
    required this.selectedOptionIndex,
    required this.isCorrect,
    required this.isAttempted,
  });
}

class ExamResultModel {
  final String id;
  final String examId;
  final String examTitle;
  final String studentId;
  final int score;
  final int totalMarks;
  final double accuracyPercentage;
  final int? airRank;
  final int correctCount;
  final int incorrectCount;
  final int unattemptedCount;
  final Duration timeTaken;
  final DateTime completedAt;
  final List<QuestionAnalysis> questionBreakdown;

  const ExamResultModel({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.studentId,
    required this.score,
    required this.totalMarks,
    required this.accuracyPercentage,
    this.airRank,
    required this.correctCount,
    required this.incorrectCount,
    required this.unattemptedCount,
    required this.timeTaken,
    required this.completedAt,
    this.questionBreakdown = const [],
  });

  double get scorePercentage => totalMarks > 0 ? (score / totalMarks) * 100 : 0.0;
}

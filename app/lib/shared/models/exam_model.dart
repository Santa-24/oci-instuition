class QuestionModel {
  final String id;
  final String subject;
  final String topic;
  final String question;
  final List<String> options;
  final int correctOptionIndex;
  final String explanation;
  final int marks;
  final int negativeMarks;

  const QuestionModel({
    required this.id,
    required this.subject,
    required this.topic,
    required this.question,
    required this.options,
    required this.correctOptionIndex,
    required this.explanation,
    this.marks = 4,
    this.negativeMarks = 1,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id'] as String,
      subject: json['subject'] as String? ?? 'Physics',
      topic: json['topic'] as String? ?? 'General',
      question: json['question'] as String? ?? '',
      options: (json['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      correctOptionIndex: json['correct_option_index'] as int? ?? 0,
      explanation: json['explanation'] as String? ?? '',
      marks: json['marks'] as int? ?? 4,
      negativeMarks: json['negative_marks'] as int? ?? 1,
    );
  }
}

class ExamModel {
  final String id;
  final String title;
  final String courseName;
  final int durationMinutes;
  final int totalMarks;
  final int totalQuestions;
  final DateTime scheduledDate;
  final bool isPublished;
  final List<QuestionModel> questions;

  const ExamModel({
    required this.id,
    required this.title,
    required this.courseName,
    required this.durationMinutes,
    required this.totalMarks,
    required this.totalQuestions,
    required this.scheduledDate,
    this.isPublished = true,
    this.questions = const [],
  });

  factory ExamModel.fromJson(Map<String, dynamic> json, [List<QuestionModel> questions = const []]) {
    return ExamModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Mock Exam',
      courseName: json['course_name'] as String? ?? 'Competitive Track',
      durationMinutes: json['duration_minutes'] as int? ?? 180,
      totalMarks: json['total_marks'] as int? ?? 300,
      totalQuestions: json['total_questions'] as int? ?? (questions.isNotEmpty ? questions.length : 75),
      scheduledDate: DateTime.tryParse(json['scheduled_date'] as String? ?? '') ?? DateTime.now(),
      isPublished: json['is_published'] as bool? ?? true,
      questions: questions,
    );
  }
}

class ExamResultModel {
  final String id;
  final String examId;
  final String examTitle;
  final String studentId;
  final int score;
  final int totalMarks;
  final double percentage;
  final DateTime submittedAt;

  const ExamResultModel({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.studentId,
    required this.score,
    required this.totalMarks,
    required this.percentage,
    required this.submittedAt,
  });

  factory ExamResultModel.fromJson(Map<String, dynamic> json) {
    return ExamResultModel(
      id: json['id'] as String? ?? '',
      examId: json['exam_id'] as String? ?? '',
      examTitle: json['exam_title'] as String? ?? (json['exams'] != null ? json['exams']['title'] as String? ?? 'Mock Examination' : 'Mock Examination'),
      studentId: json['student_id'] as String? ?? '',
      score: (json['score'] as num?)?.toInt() ?? 0,
      totalMarks: (json['total_marks'] as num?)?.toInt() ?? 300,
      percentage: double.tryParse(json['percentage']?.toString() ?? '0') ?? 0.0,
      submittedAt: json['submitted_at'] != null ? DateTime.tryParse(json['submitted_at'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }
}


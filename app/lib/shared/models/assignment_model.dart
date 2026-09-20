enum AssignmentStatus { pending, submitted, reviewed, late }

class AssignmentModel {
  final String id;
  final String title;
  final String subject;
  final String batchName;
  final DateTime dueDate;
  final int totalMarks;
  final String description;
  final AssignmentStatus status;
  final int? obtainedMarks;
  final String? facultyFeedback;
  final String? submissionFileUrl;
  final DateTime? submittedAt;

  const AssignmentModel({
    required this.id,
    required this.title,
    required this.subject,
    required this.batchName,
    required this.dueDate,
    this.totalMarks = 50,
    required this.description,
    this.status = AssignmentStatus.pending,
    this.obtainedMarks,
    this.facultyFeedback,
    this.submissionFileUrl,
    this.submittedAt,
  });

  bool get isPending => status == AssignmentStatus.pending;
  bool get isSubmitted => status == AssignmentStatus.submitted;
  bool get isReviewed => status == AssignmentStatus.reviewed;
  bool get isLate => status == AssignmentStatus.late;

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Homework Assignment',
      subject: json['subject'] as String? ?? 'General',
      batchName: json['batch_name'] as String? ?? 'Batch Alpha',
      dueDate: DateTime.tryParse(json['due_date'] as String? ?? '') ?? DateTime.now().add(const Duration(days: 3)),
      totalMarks: json['total_marks'] as int? ?? 50,
      description: json['description'] as String? ?? '',
    );
  }
}

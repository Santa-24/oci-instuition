class CourseModel {
  final String id;
  final String name;
  final String code;
  final String category;
  final int durationMonths;
  final String description;
  final bool isActive;
  final int batchesCount;
  final int enrolledStudentsCount;

  const CourseModel({
    required this.id,
    required this.name,
    required this.code,
    required this.category,
    required this.durationMonths,
    required this.description,
    this.isActive = true,
    this.batchesCount = 1,
    this.enrolledStudentsCount = 0,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Comprehensive Course',
      code: json['code'] as String? ?? 'COURSE-01',
      category: json['category'] as String? ?? 'General',
      durationMonths: json['duration_months'] as int? ?? 12,
      description: json['description'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
      batchesCount: json['batches_count'] as int? ?? 1,
      enrolledStudentsCount: json['enrolled_students_count'] as int? ?? 0,
    );
  }
}

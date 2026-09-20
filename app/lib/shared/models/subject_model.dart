class SubjectModel {
  final String id;
  final String courseId;
  final String name;
  final String code;
  final int totalChapters;
  final int totalLectures;
  final String leadTeacherName;

  const SubjectModel({
    required this.id,
    required this.courseId,
    required this.name,
    required this.code,
    this.totalChapters = 0,
    this.totalLectures = 0,
    this.leadTeacherName = 'Faculty',
  });

  factory SubjectModel.fromJson(Map<String, dynamic> json) {
    return SubjectModel(
      id: json['id'] as String? ?? '',
      courseId: json['course_id'] as String? ?? '',
      name: json['name'] as String? ?? 'Subject',
      code: json['code'] as String? ?? 'SUB',
      totalChapters: json['total_chapters'] as int? ?? 0,
      totalLectures: json['total_lectures'] as int? ?? 0,
      leadTeacherName: json['lead_teacher_name'] as String? ?? 'Faculty',
    );
  }
}

class ChapterModel {
  final String id;
  final String title;
  final int chapterNumber;
  final int lectureCount;
  final int notesCount;
  final double progress; // 0.0 to 1.0

  const ChapterModel({
    required this.id,
    required this.title,
    required this.chapterNumber,
    this.lectureCount = 0,
    this.notesCount = 0,
    this.progress = 0.0,
  });

  factory ChapterModel.fromJson(Map<String, dynamic> json) {
    return ChapterModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Chapter',
      chapterNumber: json['chapter_number'] as int? ?? 1,
      lectureCount: json['lecture_count'] as int? ?? 0,
      notesCount: json['notes_count'] as int? ?? 0,
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

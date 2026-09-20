class BatchModel {
  final String id;
  final String name;
  final String courseId;
  final String courseName;
  final String teacherId;
  final String teacherName;
  final String schedule;
  final String roomName;
  final String startDate;
  final String endDate;
  final int capacity;
  final int enrolledCount;
  final String status; // 'upcoming', 'ongoing', 'completed'

  const BatchModel({
    required this.id,
    required this.name,
    required this.courseId,
    required this.courseName,
    required this.teacherId,
    required this.teacherName,
    required this.schedule,
    required this.roomName,
    required this.startDate,
    required this.endDate,
    required this.capacity,
    required this.enrolledCount,
    required this.status,
  });

  factory BatchModel.fromJson(Map<String, dynamic> json) {
    return BatchModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Academic Batch',
      courseId: json['course_id'] as String? ?? '',
      courseName: json['course_name'] as String? ?? '',
      teacherId: json['teacher_id'] as String? ?? '',
      teacherName: json['teacher_name'] as String? ?? 'Faculty',
      schedule: json['schedule'] as String? ?? 'Schedule TBA',
      roomName: json['room_name'] as String? ?? 'Smart Hall 1',
      startDate: json['start_date'] as String? ?? '',
      endDate: json['end_date'] as String? ?? '',
      capacity: json['capacity'] as int? ?? 50,
      enrolledCount: json['enrolled_count'] as int? ?? 0,
      status: json['status'] as String? ?? 'ongoing',
    );
  }
}

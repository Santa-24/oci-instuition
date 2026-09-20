class AttendanceRecord {
  final String id;
  final String studentId;
  final String liveClassId;
  final String status; // 'present', 'absent', 'late'
  final DateTime recordedAt;
  final String? subject;
  final String? classTitle;

  const AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.liveClassId,
    required this.status,
    required this.recordedAt,
    this.subject,
    this.classTitle,
  });

  bool get isPresent => status == 'present';
  bool get isLate => status == 'late';
  bool get isAbsent => status == 'absent';

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'] as String? ?? '',
      studentId: json['student_id'] as String? ?? '',
      liveClassId: json['live_class_id'] as String? ?? '',
      status: json['status'] as String? ?? 'present',
      recordedAt: DateTime.tryParse(json['recorded_at'] as String? ?? '') ?? DateTime.now(),
      subject: json['live_classes'] != null ? json['live_classes']['subject'] as String? : null,
      classTitle: json['live_classes'] != null ? json['live_classes']['title'] as String? : null,
    );
  }
}

class AttendanceSummary {
  final int totalClasses;
  final int presentCount;
  final int lateCount;
  final int absentCount;

  const AttendanceSummary({
    this.totalClasses = 0,
    this.presentCount = 0,
    this.lateCount = 0,
    this.absentCount = 0,
  });

  double get percentage => totalClasses > 0 ? ((presentCount + (lateCount * 0.5)) / totalClasses) * 100 : 0.0;
  bool get hasRecords => totalClasses > 0;
}

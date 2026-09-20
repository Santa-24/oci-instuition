class LiveClassModel {
  final String id;
  final String title;
  final String subject;
  final String courseName;
  final String batchId;
  final String batchName;
  final String teacherId;
  final String teacherName;
  final DateTime scheduledStart;
  final DateTime scheduledEnd;
  final String jitsiRoomName;
  final String status; // 'scheduled', 'live', 'completed', 'cancelled'
  final int attendeeCount;

  const LiveClassModel({
    required this.id,
    required this.title,
    required this.subject,
    required this.courseName,
    required this.batchId,
    required this.batchName,
    required this.teacherId,
    required this.teacherName,
    required this.scheduledStart,
    required this.scheduledEnd,
    required this.jitsiRoomName,
    this.status = 'scheduled',
    this.attendeeCount = 0,
  });

  bool get isLive => status == 'live';
  bool get isScheduled => status == 'scheduled';
  bool get isCompleted => status == 'completed';

  factory LiveClassModel.fromJson(Map<String, dynamic> json) {
    return LiveClassModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Live Lecture',
      subject: json['subject'] as String? ?? 'General',
      courseName: json['course_name'] as String? ?? 'Competitive Track',
      batchId: json['batch_id'] as String? ?? '',
      batchName: json['batch_name'] as String? ?? 'Batch Alpha',
      teacherId: json['teacher_id'] as String? ?? '',
      teacherName: json['teacher_name'] as String? ?? 'Faculty',
      scheduledStart: DateTime.tryParse(json['scheduled_start'] as String? ?? '') ?? DateTime.now(),
      scheduledEnd: DateTime.tryParse(json['scheduled_end'] as String? ?? '') ?? DateTime.now().add(const Duration(hours: 1)),
      jitsiRoomName: json['jitsi_room_name'] as String? ?? 'INTUITION_ROOM',
      status: json['status'] as String? ?? 'scheduled',
      attendeeCount: json['attendee_count'] as int? ?? 0,
    );
  }
}

class StudyMaterialModel {
  final String id;
  final String title;
  final String subject;
  final String batchName;
  final String type; // 'Theory Notes', 'DPP', 'PYQ Archive', 'Formula Sheet'
  final String fileUrl;
  final String fileSize;
  final DateTime uploadDate;
  final int downloadCount;
  final bool isDownloaded;

  const StudyMaterialModel({
    required this.id,
    required this.title,
    required this.subject,
    required this.batchName,
    required this.type,
    required this.fileUrl,
    this.fileSize = '2.4 MB',
    required this.uploadDate,
    this.downloadCount = 0,
    this.isDownloaded = false,
  });

  factory StudyMaterialModel.fromJson(Map<String, dynamic> json) {
    return StudyMaterialModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Study Document',
      subject: json['subject'] as String? ?? 'General',
      batchName: json['batch_name'] as String? ?? 'Batch Alpha',
      type: json['type'] as String? ?? 'Theory Notes',
      fileUrl: json['file_url'] as String? ?? '',
      fileSize: json['file_size'] as String? ?? '2.4 MB',
      uploadDate: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
      downloadCount: json['download_count'] as int? ?? 0,
    );
  }
}

class RecordedLectureModel {
  final String id;
  final String title;
  final String subject;
  final String batchName;
  final String videoUrl;
  final String? thumbnailUrl;
  final int durationSeconds;
  final DateTime recordedDate;

  const RecordedLectureModel({
    required this.id,
    required this.title,
    required this.subject,
    required this.batchName,
    required this.videoUrl,
    this.thumbnailUrl,
    this.durationSeconds = 3600,
    required this.recordedDate,
  });

  String get durationText {
    final mins = durationSeconds ~/ 60;
    return '$mins mins';
  }

  factory RecordedLectureModel.fromJson(Map<String, dynamic> json) {
    return RecordedLectureModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Recorded Class',
      subject: json['subject'] as String? ?? 'General',
      batchName: json['batch_name'] as String? ?? 'All Batches',
      videoUrl: json['video_url'] as String? ?? json['file_url'] as String? ?? '',
      thumbnailUrl: json['thumbnail_url'] as String?,
      durationSeconds: json['duration_seconds'] as int? ?? 3600,
      recordedDate: DateTime.tryParse(json['recorded_date'] as String? ?? json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

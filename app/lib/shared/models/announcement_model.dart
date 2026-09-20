class AnnouncementModel {
  final String id;
  final String title;
  final String content;
  final String category;
  final bool isUrgent;
  final DateTime createdAt;

  const AnnouncementModel({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.isUrgent,
    required this.createdAt,
  });

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    return AnnouncementModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Notice',
      content: json['content'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      isUrgent: json['is_urgent'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

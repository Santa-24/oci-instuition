enum NotificationCategory { classAlert, examAlert, assignmentAlert, general }

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final NotificationCategory category;
  final DateTime timestamp;
  final bool isRead;
  final String? deepLinkRoute;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.category,
    required this.timestamp,
    this.isRead = false,
    this.deepLinkRoute,
  });

  NotificationModel copyWith({bool? isRead}) {
    return NotificationModel(
      id: id,
      title: title,
      body: body,
      category: category,
      timestamp: timestamp,
      isRead: isRead ?? this.isRead,
      deepLinkRoute: deepLinkRoute,
    );
  }

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    NotificationCategory cat = NotificationCategory.general;
    final type = json['type'] as String? ?? '';
    if (type.contains('class')) {
      cat = NotificationCategory.classAlert;
    } else if (type.contains('exam')) {
      cat = NotificationCategory.examAlert;
    } else if (type.contains('assignment')) {
      cat = NotificationCategory.assignmentAlert;
    }

    return NotificationModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Notification',
      body: json['body'] as String? ?? json['message'] as String? ?? '',
      category: cat,
      timestamp: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
      isRead: json['is_read'] as bool? ?? false,
      deepLinkRoute: json['deep_link'] as String?,
    );
  }
}

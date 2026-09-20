/// User roles supported by Intuition Coaching Institute.
/// IMPORTANT: Admin role is RESTRICTED from mobile app.
enum UserRole {
  student,
  faculty,
  admin;

  static UserRole fromString(String? role) {
    switch (role?.toLowerCase().trim()) {
      case 'faculty':
      case 'teacher':
        return UserRole.faculty;
      case 'admin':
      case 'superadmin':
        return UserRole.admin;
      case 'student':
      default:
        return UserRole.student;
    }
  }

  String get displayName {
    switch (this) {
      case UserRole.student:
        return 'Student';
      case UserRole.faculty:
        return 'Faculty';
      case UserRole.admin:
        return 'Administrator';
    }
  }

  bool get isStudent => this == UserRole.student;
  bool get isFaculty => this == UserRole.faculty;
  bool get isAdmin => this == UserRole.admin;
}

class AppUserProfile {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final UserRole role;
  final String? avatarUrl;
  final String? batchId;
  final String? batchName;
  final String? rollNo;
  final String? employeeId;
  final String? subject;
  final String? designation;

  const AppUserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    required this.role,
    this.avatarUrl,
    this.batchId,
    this.batchName,
    this.rollNo,
    this.employeeId,
    this.subject,
    this.designation,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullName': fullName,
        'phone': phone,
        'role': role.name,
        'avatarUrl': avatarUrl,
        'batchId': batchId,
        'batchName': batchName,
        'rollNo': rollNo,
        'employeeId': employeeId,
        'subject': subject,
        'designation': designation,
      };

  factory AppUserProfile.fromJson(Map<String, dynamic> json) {
    return AppUserProfile(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? json['full_name'] as String? ?? 'Student Aspirant',
      phone: json['phone'] as String?,
      role: UserRole.fromString(json['role'] as String?),
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
      batchId: json['batchId'] as String? ?? json['batch_id'] as String?,
      batchName: json['batchName'] as String? ?? json['batch_name'] as String?,
      rollNo: json['rollNo'] as String? ?? json['roll_no'] as String?,
      employeeId: json['employeeId'] as String? ?? json['employee_id'] as String?,
      subject: json['subject'] as String?,
      designation: json['designation'] as String?,
    );
  }

  factory AppUserProfile.empty({
    required String id,
    required String email,
    UserRole role = UserRole.student,
  }) {
    return AppUserProfile(
      id: id,
      email: email,
      fullName: 'Aspirant',
      role: role,
    );
  }
}

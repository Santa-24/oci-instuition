/// Typed route constants for Intuition Coaching Institute mobile client.
/// NOTE: Admin routes DO NOT exist on mobile.
class RoutePaths {
  RoutePaths._();

  // Auth Routes
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String adminRestricted = '/auth/admin-restricted';

  // Student Routes
  static const String studentShell = '/student';
  static const String studentDashboard = '/student/dashboard';
  static const String studentClasses = '/student/classes';
  static const String studentLearn = '/student/learn';
  static const String studentSubjectDetail = '/student/subject-detail';
  static const String studentTests = '/student/tests';
  static const String studentProfile = '/student/profile';

  // Faculty Routes
  static const String facultyShell = '/faculty';
  static const String facultyDashboard = '/faculty/dashboard';
  static const String facultyClasses = '/faculty/classes';
  static const String facultyContent = '/faculty/content';
  static const String facultyTests = '/faculty/tests';
  static const String facultyProfile = '/faculty/profile';

  // Shared Modal & Fullscreen Experiences
  static const String liveClassroom = '/live-classroom';
  static const String videoPlayer = '/video-player';
  static const String documentViewer = '/document-viewer';
  static const String assignmentDetail = '/assignment-detail';
  static const String examRoom = '/exam-room';
  static const String examResult = '/exam-result';
  static const String notifications = '/notifications';
}

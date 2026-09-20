/// Core application constants for Odisha Competitive Institute (OCI).
class AppConstants {
  AppConstants._();

  static const String appName = 'Odisha Competitive Institute';
  static const String appShortName = 'OCI';
  static const String appTagline = 'Premier Competitive Exam Coaching in Odisha';
  static const String instituteLocation = 'Bhadrak, Odisha';
  static const String supportPhone = '+91 94370 12345';
  static const String supportEmail = 'admissions@oci.org.in';
  static const String webAdminUrl = 'https://admin.oci.org.in';
  static const String websiteUrl = 'https://oci.org.in';

  // App Versioning
  static const String currentVersionName = '1.0.0';
  static const int currentVersionCode = 1;
  static const String androidPackageId = 'com.oci.institute';

  // Academic thresholds
  static const int defaultExamDurationMinutes = 180;
  static const int autosaveIntervalSeconds = 5;

  // Cache duration
  static const Duration cacheTtl = Duration(hours: 4);
}

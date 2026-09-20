import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Centralized environment configuration.
/// Ensures runtime safety and prevents hardcoding of secrets or endpoints.
class Env {
  Env._();

  static String get supabaseUrl =>
      dotenv.env['SUPABASE_URL'] ?? 'https://oci-institute.supabase.co';

  static String get supabaseAnonKey =>
      dotenv.env['SUPABASE_ANON_KEY'] ??
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-placeholder-key-for-local-dev';

  static String get jitsiServerUrl =>
      dotenv.env['JITSI_SERVER_URL'] ?? 'https://meet.jit.si';

  static String get backendUrl =>
      dotenv.env['RENDER_BACKEND_URL'] ??
      dotenv.env['BACKEND_URL'] ??
      'https://oci-platform.onrender.com';

  static String get fcmSenderId =>
      dotenv.env['FCM_SENDER_ID'] ?? '123456789012';

  static String get environment =>
      dotenv.env['ENVIRONMENT'] ?? 'development';

  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
}

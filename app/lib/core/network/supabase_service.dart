import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/env.dart';

/// Central database table references matching PostgreSQL schema.
class DbTables {
  DbTables._();

  static const String profiles = 'profiles';
  static const String userRoles = 'user_roles';
  static const String students = 'students';
  static const String teachers = 'teachers';
  static const String courses = 'courses';
  static const String subjects = 'subjects';
  static const String batches = 'batches';
  static const String liveClasses = 'live_classes';
  static const String studyMaterials = 'study_materials';
  static const String recordedClasses = 'recorded_classes';
  static const String assignments = 'assignments';
  static const String assignmentSubmissions = 'assignment_submissions';
  static const String questions = 'questions';
  static const String exams = 'exams';
  static const String examResults = 'exam_results';
  static const String attendance = 'attendance';
  static const String announcements = 'announcements';
  static const String notifications = 'notifications';
  static const String auditLogs = 'audit_logs';
}

/// Central Supabase service manager.
class SupabaseService {
  SupabaseService._();

  static bool _isInitialized = false;

  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      await Supabase.initialize(
        url: Env.supabaseUrl,
        anonKey: Env.supabaseAnonKey,
        authOptions: const FlutterAuthClientOptions(
          authFlowType: AuthFlowType.pkce,
        ),
      );
      _isInitialized = true;
    } catch (e) {
      debugPrint('Supabase initialization notice (running offline/fallback): $e');
    }
  }

  static SupabaseClient get client {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return SupabaseClient(Env.supabaseUrl, Env.supabaseAnonKey);
    }
  }

  static User? get currentUser {
    try {
      return client.auth.currentUser;
    } catch (_) {
      return null;
    }
  }

  static Session? get currentSession {
    try {
      return client.auth.currentSession;
    } catch (_) {
      return null;
    }
  }

  static bool get isAuthenticated => currentUser != null && currentSession != null;

  static Stream<AuthState> get authStateChanges {
    try {
      return client.auth.onAuthStateChange;
    } catch (_) {
      return const Stream.empty();
    }
  }
}

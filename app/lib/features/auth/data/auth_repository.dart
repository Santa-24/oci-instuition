import 'package:flutter/foundation.dart';
import '../../../core/network/supabase_service.dart';
import '../../../core/storage/preferences_service.dart';
import '../../../shared/models/user_profile.dart';

class AuthRepository {
  /// Sign In with Email & Password (Real Supabase Auth Only - No Mocks)
  Future<AppUserProfile> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final response = await SupabaseService.client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );

    if (response.user == null) {
      throw Exception('Authentication failed: No user returned by identity provider.');
    }

    final userId = response.user!.id;
    final profile = await fetchUserProfile(userId, email: response.user!.email);
    await PreferencesService.saveSelectedRole(profile.role.name);
    await PreferencesService.saveUserId(userId);
    return profile;
  }

  /// Sign Up with Email, Password, Full Name, Phone (Student Registration Only)
  Future<AppUserProfile> signUpWithEmail({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    UserRole role = UserRole.student,
    String? targetExamOrSubject,
  }) async {
    // SECURITY: Public registration is strictly for Students.
    final response = await SupabaseService.client.auth.signUp(
      email: email.trim(),
      password: password,
      data: {
        'full_name': fullName.trim(),
        'phone': phone.trim(),
        'role': 'student',
        'target_exam': targetExamOrSubject?.trim() ?? '',
      },
    );

    if (response.user == null) {
      throw Exception('Signup failed: Unable to create student identity in auth system.');
    }

    final userId = response.user!.id;

    // If session was not returned immediately, sign in to acquire session tokens
    if (response.session == null) {
      try {
        await SupabaseService.client.auth.signInWithPassword(
          email: email.trim(),
          password: password,
        );
      } catch (signInErr) {
        debugPrint('[AuthRepository] Notice on initial signup auto-signin: $signInErr');
      }
    }

    // Ensure database rows exist (handled by on_auth_user_created DB trigger, with fallback upsert)
    try {
      await SupabaseService.client.from(DbTables.profiles).upsert({
        'id': userId,
        'email': email.trim(),
        'full_name': fullName.trim(),
        'phone': phone.trim(),
      });
      await SupabaseService.client.from(DbTables.userRoles).upsert({
        'user_id': userId,
        'role': 'student',
      });
      await SupabaseService.client.from(DbTables.students).upsert({
        'id': userId,
        'roll_no': 'OCI-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch % 10000}',
        'status': 'active',
      });
    } catch (e) {
      debugPrint('[AuthRepository] Database profile check notice: $e');
    }

    final profile = await fetchUserProfile(
      userId,
      email: email.trim(),
      phone: phone.trim(),
    );

    await PreferencesService.saveSelectedRole(profile.role.name);
    await PreferencesService.saveUserId(userId);
    return profile;
  }

  /// Fetch user profile from Supabase profiles, user_roles, students & teachers table
  Future<AppUserProfile> fetchUserProfile(String userId, {String? email, String? phone}) async {
    // 1. Fetch Role
    final roleRes = await SupabaseService.client
        .from(DbTables.userRoles)
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

    final roleStr = roleRes != null ? roleRes['role'] as String? : 'student';
    final role = UserRole.fromString(roleStr);

    // 2. Fetch Base Profile
    final profileRes = await SupabaseService.client
        .from(DbTables.profiles)
        .select()
        .eq('id', userId)
        .maybeSingle();

    String? batchId;
    String? batchName;
    String? rollNo;
    String? employeeId;
    String? subject;
    String? designation;

    // 3. Fetch Role-Specific Student or Faculty Record
    if (role.isStudent) {
      try {
        final studentRes = await SupabaseService.client
            .from(DbTables.students)
            .select('roll_no, batch_id')
            .eq('id', userId)
            .maybeSingle();

        if (studentRes != null) {
          rollNo = studentRes['roll_no'] as String?;
          batchId = studentRes['batch_id'] as String?;
          if (batchId != null && batchId.isNotEmpty) {
            final batchRes = await SupabaseService.client
                .from(DbTables.batches)
                .select('name')
                .eq('id', batchId)
                .maybeSingle();
            batchName = batchRes?['name'] as String?;
          }
        }
      } catch (e) {
        debugPrint('[AuthRepository] Student details fetch notice: $e');
      }
    } else if (role.isFaculty) {
      try {
        final teacherRes = await SupabaseService.client
            .from(DbTables.teachers)
            .select('employee_id, subject, designation')
            .eq('id', userId)
            .maybeSingle();

        if (teacherRes != null) {
          employeeId = teacherRes['employee_id'] as String?;
          subject = teacherRes['subject'] as String?;
          designation = teacherRes['designation'] as String? ?? 'Faculty Member';
        }
      } catch (e) {
        debugPrint('[AuthRepository] Teacher details fetch notice: $e');
      }
    }

    final resolvedEmail = email ?? profileRes?['email'] as String? ?? '';
    final resolvedFullName = profileRes?['full_name'] as String? ?? (role.isFaculty ? 'Faculty Member' : 'Student Aspirant');

    return AppUserProfile(
      id: userId,
      email: resolvedEmail,
      fullName: resolvedFullName,
      phone: phone ?? profileRes?['phone'] as String?,
      role: role,
      avatarUrl: profileRes?['avatar_url'] as String?,
      batchId: batchId,
      batchName: batchName,
      rollNo: rollNo,
      employeeId: employeeId,
      subject: subject,
      designation: designation,
    );
  }

  /// Sign Out
  Future<void> signOut() async {
    try {
      await SupabaseService.client.auth.signOut();
    } catch (_) {}
    await PreferencesService.clearSession();
  }
}

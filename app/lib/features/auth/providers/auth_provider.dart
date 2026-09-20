import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/supabase_service.dart';
import '../../../shared/models/user_profile.dart';
import '../../../shared/providers/academic_providers.dart';
import '../data/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AsyncValue<AppUserProfile?>>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthStateNotifier(repo, ref);
});

class AuthStateNotifier extends StateNotifier<AsyncValue<AppUserProfile?>> {
  final AuthRepository _repository;
  final Ref _ref;

  AuthStateNotifier(this._repository, this._ref) : super(const AsyncValue.loading()) {
    _restoreSession();
  }

  /// Restore active authenticated session strictly from Supabase Auth
  Future<void> _restoreSession() async {
    try {
      final currentUser = SupabaseService.currentUser;
      if (currentUser != null) {
        final profile = await _repository.fetchUserProfile(currentUser.id, email: currentUser.email);
        state = AsyncValue.data(profile);
        return;
      }

      // If no active Supabase user session exists, state is unauthenticated.
      // NEVER restore fake or mock profiles.
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Sign In with Email & Password
  Future<bool> signInWithEmail(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final profile = await _repository.signInWithEmail(email: email, password: password);
      _invalidateUserData();
      state = AsyncValue.data(profile);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  /// Student Registration with Email & Password
  Future<bool> signUpWithEmail({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    UserRole role = UserRole.student,
    String? targetExamOrSubject,
  }) async {
    state = const AsyncValue.loading();
    try {
      final profile = await _repository.signUpWithEmail(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        role: UserRole.student, // Public registration is strictly student
        targetExamOrSubject: targetExamOrSubject,
      );
      _invalidateUserData();
      if (SupabaseService.currentSession != null) {
        state = AsyncValue.data(profile);
      } else {
        state = const AsyncValue.data(null);
      }
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  /// Refresh the current authenticated user's profile
  Future<void> refreshProfile() async {
    final currentUser = SupabaseService.currentUser;
    if (currentUser != null) {
      try {
        final profile = await _repository.fetchUserProfile(currentUser.id, email: currentUser.email);
        state = AsyncValue.data(profile);
      } catch (_) {}
    }
  }

  /// Invalidate all user-specific data to prevent cross-account data leakage
  void _invalidateUserData() {
    _ref.invalidate(liveClassesProvider);
    _ref.invalidate(recordedClassesProvider);
    _ref.invalidate(examsProvider);
    _ref.invalidate(assignmentsProvider);
    _ref.invalidate(studyMaterialsProvider);
    _ref.invalidate(notificationsProvider);
    _ref.invalidate(studentExamResultsProvider);
    _ref.invalidate(subjectsProvider);
    _ref.invalidate(studentAttendanceProvider);
    _ref.invalidate(announcementsProvider);
    _ref.invalidate(studentProgressProvider);
  }

  /// Sign Out completely
  Future<void> signOut() async {
    state = const AsyncValue.loading();
    _invalidateUserData();
    await _repository.signOut();
    state = const AsyncValue.data(null);
  }
}

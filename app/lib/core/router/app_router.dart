import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/assignments/assignment_detail_screen.dart';
import '../../features/auth/presentation/admin_restricted_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/exams/exam_room_screen.dart';
import '../../features/faculty/presentation/faculty_shell_screen.dart';
import '../../features/live_classroom/live_classroom_screen.dart';
import '../../features/materials/document_viewer_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/results/exam_result_screen.dart';
import '../../features/student/learn/subject_detail_screen.dart';
import '../../features/student/presentation/student_shell_screen.dart';
import '../../features/video_player/video_player_screen.dart';
import '../../shared/models/user_profile.dart';
import 'route_paths.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: RoutePaths.splash,
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final loc = state.matchedLocation;

      // Handle initial splash loading ONLY - never kick user out of login/signup during auth calls
      if (authState.isLoading) {
        return loc == RoutePaths.splash ? null : null;
      }

      final user = authState.asData?.value;
      final isAuthenticated = user != null;

      final isAuthRoute = loc == RoutePaths.login ||
          loc == RoutePaths.signup ||
          loc == RoutePaths.onboarding ||
          loc == RoutePaths.splash;

      // Unauthenticated users
      if (!isAuthenticated) {
        return isAuthRoute ? null : RoutePaths.login;
      }

      // Admin users are strictly restricted on mobile
      if (user.role == UserRole.admin) {
        return loc == RoutePaths.adminRestricted ? null : RoutePaths.adminRestricted;
      }

      // If on auth route and authenticated, redirect to role home
      if (isAuthRoute || loc == RoutePaths.adminRestricted) {
        return user.role == UserRole.faculty ? RoutePaths.facultyShell : RoutePaths.studentShell;
      }

      // Role boundary check: Students cannot access Faculty shell or routes
      if (user.role == UserRole.student && loc.startsWith('/faculty')) {
        return RoutePaths.studentShell;
      }
      // Faculty cannot access Student shell or routes
      if (user.role == UserRole.faculty && loc.startsWith('/student')) {
        return RoutePaths.facultyShell;
      }

      return null;
    },
    routes: [
      // Auth Routes
      GoRoute(
        path: RoutePaths.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: RoutePaths.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: RoutePaths.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: RoutePaths.signup,
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: RoutePaths.adminRestricted,
        builder: (context, state) => const AdminRestrictedScreen(),
      ),

      // Student Shell & Sub-screens
      GoRoute(
        path: RoutePaths.studentShell,
        builder: (context, state) => const StudentShellScreen(initialTab: 0),
      ),
      GoRoute(
        path: RoutePaths.studentDashboard,
        builder: (context, state) => const StudentShellScreen(initialTab: 0),
      ),
      GoRoute(
        path: RoutePaths.studentClasses,
        builder: (context, state) => const StudentShellScreen(initialTab: 1),
      ),
      GoRoute(
        path: RoutePaths.studentLearn,
        builder: (context, state) => const StudentShellScreen(initialTab: 2),
      ),
      GoRoute(
        path: RoutePaths.studentTests,
        builder: (context, state) => const StudentShellScreen(initialTab: 3),
      ),
      GoRoute(
        path: RoutePaths.studentProfile,
        builder: (context, state) => const StudentShellScreen(initialTab: 4),
      ),
      GoRoute(
        path: RoutePaths.studentSubjectDetail,
        builder: (context, state) {
          final id = state.uri.queryParameters['subjectId'] ?? 'sub_phy';
          final name = state.uri.queryParameters['name'] ?? 'Physics';
          final teacher = state.uri.queryParameters['teacher'] ?? 'Dr. H. C. Verma';
          return SubjectDetailScreen(subjectId: id, name: name, teacher: teacher);
        },
      ),

      // Faculty Shell & Sub-screens
      GoRoute(
        path: RoutePaths.facultyShell,
        builder: (context, state) => const FacultyShellScreen(initialTab: 0),
      ),
      GoRoute(
        path: RoutePaths.facultyDashboard,
        builder: (context, state) => const FacultyShellScreen(initialTab: 0),
      ),
      GoRoute(
        path: RoutePaths.facultyClasses,
        builder: (context, state) => const FacultyShellScreen(initialTab: 1),
      ),
      GoRoute(
        path: RoutePaths.facultyContent,
        builder: (context, state) => const FacultyShellScreen(initialTab: 2),
      ),
      GoRoute(
        path: RoutePaths.facultyTests,
        builder: (context, state) => const FacultyShellScreen(initialTab: 3),
      ),
      GoRoute(
        path: RoutePaths.facultyProfile,
        builder: (context, state) => const FacultyShellScreen(initialTab: 4),
      ),

      // Shared Interactive Experiences
      GoRoute(
        path: RoutePaths.liveClassroom,
        builder: (context, state) {
          final classId = state.uri.queryParameters['classId'] ?? '';
          final title = state.uri.queryParameters['title'] ?? 'Live Classroom';
          final teacher = state.uri.queryParameters['teacher'] ?? 'Faculty';
          final isHost = state.uri.queryParameters['isHost'] == 'true';
          return LiveClassroomScreen(
            classId: classId,
            title: title,
            teacher: teacher,
            isHost: isHost,
          );
        },
      ),
      GoRoute(
        path: RoutePaths.videoPlayer,
        builder: (context, state) {
          final videoUrl = state.uri.queryParameters['videoUrl'] ?? '';
          final title = state.uri.queryParameters['title'] ?? 'Lecture Video';
          return VideoPlayerScreen(videoUrl: videoUrl, title: title);
        },
      ),
      GoRoute(
        path: RoutePaths.documentViewer,
        builder: (context, state) {
          final title = state.uri.queryParameters['title'] ?? 'Academic Document';
          final docUrl = state.uri.queryParameters['url'] ?? '';
          return DocumentViewerScreen(title: title, url: docUrl);
        },
      ),
      GoRoute(
        path: RoutePaths.assignmentDetail,
        builder: (context, state) {
          final id = state.uri.queryParameters['id'];
          return AssignmentDetailScreen(assignmentId: id);
        },
      ),
      GoRoute(
        path: RoutePaths.examRoom,
        builder: (context, state) {
          final examId = state.uri.queryParameters['examId'];
          final title = state.uri.queryParameters['title'];
          return ExamRoomScreen(examId: examId, title: title);
        },
      ),
      GoRoute(
        path: RoutePaths.examResult,
        builder: (context, state) {
          final examId = state.uri.queryParameters['examId'];
          final resultId = state.uri.queryParameters['resultId'];
          return ExamResultScreen(examId: examId, resultId: resultId);
        },
      ),
      GoRoute(
        path: RoutePaths.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
    ],
  );
});

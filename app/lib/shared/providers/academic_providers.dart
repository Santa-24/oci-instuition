import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/course_model.dart';
import '../models/batch_model.dart';
import '../models/live_class_model.dart';
import '../models/exam_model.dart';
import '../models/assignment_model.dart';
import '../models/study_material_model.dart';
import '../models/notification_model.dart';
import '../models/subject_model.dart';
import '../models/attendance_model.dart';
import '../models/announcement_model.dart';
import '../repositories/academic_repository.dart';

final academicRepositoryProvider = Provider<AcademicRepository>((ref) {
  return AcademicRepository();
});

final liveClassesProvider = FutureProvider<List<LiveClassModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getLiveClasses();
});

final recordedClassesProvider = FutureProvider<List<RecordedLectureModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getRecordedClasses();
});

final examsProvider = FutureProvider<List<ExamModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getExams();
});

final assignmentsProvider = FutureProvider<List<AssignmentModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getAssignments();
});

final studyMaterialsProvider = FutureProvider<List<StudyMaterialModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getStudyMaterials();
});

final coursesProvider = FutureProvider<List<CourseModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getCourses();
});

final batchesProvider = FutureProvider<List<BatchModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getBatches();
});

final notificationsProvider = FutureProvider<List<NotificationModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getNotifications();
});

final studentExamResultsProvider = FutureProvider<List<ExamResultModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getExamResults();
});

final subjectsProvider = FutureProvider<List<SubjectModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getSubjects();
});

final studentAttendanceProvider = FutureProvider<AttendanceSummary>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getAttendanceSummary();
});

final announcementsProvider = FutureProvider<List<AnnouncementModel>>((ref) async {
  final repo = ref.watch(academicRepositoryProvider);
  return repo.getAnnouncements();
});

class StudentProgress {
  final int totalAssigned;
  final int completed;
  final double ratio; // 0.0 to 1.0

  const StudentProgress({
    this.totalAssigned = 0,
    this.completed = 0,
    this.ratio = 0.0,
  });

  bool get hasActivity => completed > 0;
  String get percentageText => '${(ratio * 100).toInt()}%';
}

final studentProgressProvider = FutureProvider<StudentProgress>((ref) async {
  final exams = await ref.watch(examsProvider.future);
  final results = await ref.watch(studentExamResultsProvider.future);
  final assignments = await ref.watch(assignmentsProvider.future);

  final totalTasks = exams.length + assignments.length;
  if (totalTasks == 0) {
    return const StudentProgress(totalAssigned: 0, completed: 0, ratio: 0.0);
  }
  final completedTasks = results.length;
  final ratio = (completedTasks / totalTasks).clamp(0.0, 1.0);
  return StudentProgress(
    totalAssigned: totalTasks,
    completed: completedTasks,
    ratio: ratio,
  );
});

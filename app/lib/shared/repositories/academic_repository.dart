import 'package:flutter/foundation.dart';
import '../../../core/network/supabase_service.dart';
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

class AcademicRepository {
  /// Fetch Live Classes from Supabase
  Future<List<LiveClassModel>> getLiveClasses({String? batchId}) async {
    try {
      var query = SupabaseService.client.from(DbTables.liveClasses).select();
      if (batchId != null && batchId.isNotEmpty) {
        query = query.eq('batch_id', batchId);
      }
      final res = await query.order('scheduled_start', ascending: true);
      if (res.isNotEmpty) {
        return (res as List).map((r) => LiveClassModel.fromJson(r)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getLiveClasses query error: $e');
    }
    return const [];
  }

  /// Fetch Active & Scheduled Exams from Supabase
  Future<List<ExamModel>> getExams({String? courseId}) async {
    try {
      final examsRes = await SupabaseService.client
          .from(DbTables.exams)
          .select()
          .order('scheduled_date', ascending: true);

      final questionsRes = await SupabaseService.client
          .from(DbTables.questions)
          .select();

      final List<QuestionModel> allQuestions = questionsRes.isNotEmpty
          ? (questionsRes as List).map((q) => QuestionModel.fromJson(q)).toList()
          : const [];

      if (examsRes.isNotEmpty) {
        return (examsRes as List).map((e) {
          return ExamModel.fromJson(e, allQuestions);
        }).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getExams query error: $e');
    }
    return const [];
  }

  /// Fetch Questions from Supabase
  Future<List<QuestionModel>> getQuestions({String? subject}) async {
    try {
      var query = SupabaseService.client.from(DbTables.questions).select();
      if (subject != null && subject.isNotEmpty) {
        query = query.eq('subject', subject);
      }
      final res = await query;
      if (res.isNotEmpty) {
        return (res as List).map((q) => QuestionModel.fromJson(q)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getQuestions error: $e');
    }
    return const [];
  }

  /// Submit Exam Result into Supabase
  Future<bool> submitExamResult({
    required String examId,
    required String studentId,
    required int score,
    required int totalMarks,
    required Map<String, dynamic> responses,
  }) async {
    try {
      final percentage = (score / (totalMarks > 0 ? totalMarks : 300)) * 100;
      await SupabaseService.client.from(DbTables.examResults).insert({
        'exam_id': examId,
        'student_id': studentId,
        'score': score,
        'total_marks': totalMarks,
        'percentage': percentage.toStringAsFixed(1),
        'submitted_at': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      debugPrint('[AcademicRepository] submitExamResult error: $e');
      return false;
    }
  }

  /// Fetch Assignments from Supabase
  Future<List<AssignmentModel>> getAssignments({String? batchId}) async {
    try {
      var query = SupabaseService.client.from(DbTables.assignments).select();
      if (batchId != null && batchId.isNotEmpty) {
        query = query.eq('batch_id', batchId);
      }
      final res = await query.order('due_date', ascending: true);
      if (res.isNotEmpty) {
        return (res as List).map((a) => AssignmentModel.fromJson(a)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getAssignments error: $e');
    }
    return const [];
  }

  /// Fetch Study Materials from Supabase
  Future<List<StudyMaterialModel>> getStudyMaterials({String? subject}) async {
    try {
      var query = SupabaseService.client.from(DbTables.studyMaterials).select();
      if (subject != null && subject.isNotEmpty) {
        query = query.eq('subject', subject);
      }
      final res = await query;
      if (res.isNotEmpty) {
        return (res as List).map((m) => StudyMaterialModel.fromJson(m)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getStudyMaterials error: $e');
    }
    return const [];
  }

  /// Fetch Courses from Supabase
  Future<List<CourseModel>> getCourses() async {
    try {
      final res = await SupabaseService.client.from(DbTables.courses).select();
      if (res.isNotEmpty) {
        return (res as List).map((c) => CourseModel.fromJson(c)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getCourses error: $e');
    }
    return const [];
  }

  /// Fetch Batches from Supabase
  Future<List<BatchModel>> getBatches() async {
    try {
      final res = await SupabaseService.client.from(DbTables.batches).select();
      if (res.isNotEmpty) {
        return (res as List).map((b) => BatchModel.fromJson(b)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getBatches error: $e');
    }
    return const [];
  }

  /// Fetch Recorded Classes from Supabase
  Future<List<RecordedLectureModel>> getRecordedClasses({String? subject}) async {
    try {
      var query = SupabaseService.client.from(DbTables.recordedClasses).select();
      if (subject != null && subject.isNotEmpty) {
        query = query.eq('subject', subject);
      }
      final res = await query.order('created_at', ascending: false);
      if (res.isNotEmpty) {
        return (res as List).map((r) => RecordedLectureModel.fromJson(r)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getRecordedClasses error: $e');
    }
    return const [];
  }

  /// Create Live Class (Faculty / Admin)
  Future<LiveClassModel?> createLiveClass({
    required String title,
    required String subject,
    required String batchId,
    required String batchName,
    required DateTime scheduledStart,
    required DateTime scheduledEnd,
    String? jitsiRoomName,
  }) async {
    final currentUserId = SupabaseService.currentUser?.id;
    final room = jitsiRoomName ?? 'OCI_${subject.toUpperCase()}_${DateTime.now().millisecondsSinceEpoch % 10000}';
    final payload = {
      'title': title,
      'subject': subject,
      'batch_id': batchId,
      'batch_name': batchName,
      'teacher_id': currentUserId,
      'scheduled_start': scheduledStart.toIso8601String(),
      'scheduled_end': scheduledEnd.toIso8601String(),
      'jitsi_room_name': room,
      'status': 'scheduled',
    };

    try {
      final res = await SupabaseService.client
          .from(DbTables.liveClasses)
          .insert(payload)
          .select()
          .single();
      return LiveClassModel.fromJson(res);
    } catch (e) {
      debugPrint('[AcademicRepository] createLiveClass error: $e');
      return null;
    }
  }

  /// Update Live Class Status
  Future<bool> updateLiveClassStatus(String id, String status) async {
    try {
      await SupabaseService.client
          .from(DbTables.liveClasses)
          .update({'status': status})
          .eq('id', id);
      return true;
    } catch (e) {
      debugPrint('[AcademicRepository] updateLiveClassStatus error: $e');
      return false;
    }
  }

  /// Submit Assignment (Student)
  Future<bool> submitAssignment({
    required String assignmentId,
    required String studentId,
    String? notes,
    String? fileUrl,
  }) async {
    try {
      await SupabaseService.client.from(DbTables.assignmentSubmissions).insert({
        'assignment_id': assignmentId,
        'student_id': studentId,
        'submitted_at': DateTime.now().toIso8601String(),
        'status': 'submitted',
        if (notes != null) 'notes': notes,
        if (fileUrl != null) 'file_url': fileUrl,
      });
      return true;
    } catch (e) {
      debugPrint('[AcademicRepository] submitAssignment error: $e');
      return false;
    }
  }

  /// Publish Study Material (Faculty)
  Future<bool> createStudyMaterial({
    required String title,
    required String subject,
    required String type,
    required String fileUrl,
    required String batchName,
  }) async {
    try {
      await SupabaseService.client.from(DbTables.studyMaterials).insert({
        'title': title,
        'subject': subject,
        'type': type,
        'file_url': fileUrl,
        'download_count': 0,
        'created_at': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      debugPrint('[AcademicRepository] createStudyMaterial error: $e');
      return false;
    }
  }

  /// Fetch Notifications
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final res = await SupabaseService.client
          .from(DbTables.notifications)
          .select()
          .order('created_at', ascending: false);
      if (res.isNotEmpty) {
        return (res as List).map((n) => NotificationModel.fromJson(n)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getNotifications error: $e');
    }
    return const [];
  }

  /// Fetch Student Exam Results
  Future<List<ExamResultModel>> getExamResults({String? studentId}) async {
    try {
      final sId = studentId ?? SupabaseService.currentUser?.id;
      if (sId == null) return const [];
      final res = await SupabaseService.client
          .from(DbTables.examResults)
          .select('*, exams(title)')
          .eq('student_id', sId)
          .order('submitted_at', ascending: false);
      if (res.isNotEmpty) {
        return (res as List).map((r) => ExamResultModel.fromJson(r)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getExamResults error: $e');
    }
    return const [];
  }

  /// Fetch Subjects from Supabase
  Future<List<SubjectModel>> getSubjects({String? courseId}) async {
    try {
      var query = SupabaseService.client.from(DbTables.subjects).select();
      if (courseId != null && courseId.isNotEmpty) {
        query = query.eq('course_id', courseId);
      }
      final res = await query.order('name', ascending: true);
      if (res.isNotEmpty) {
        return (res as List).map((s) => SubjectModel.fromJson(s)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getSubjects error: $e');
    }
    return const [];
  }

  /// Fetch Attendance Records for Student
  Future<List<AttendanceRecord>> getAttendance({String? studentId}) async {
    try {
      final sId = studentId ?? SupabaseService.currentUser?.id;
      if (sId == null) return const [];
      final res = await SupabaseService.client
          .from(DbTables.attendance)
          .select('*, live_classes(subject, title)')
          .eq('student_id', sId)
          .order('recorded_at', ascending: false);
      if (res.isNotEmpty) {
        return (res as List).map((a) => AttendanceRecord.fromJson(a)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getAttendance error: $e');
    }
    return const [];
  }

  /// Fetch Attendance Summary (Computed from database)
  Future<AttendanceSummary> getAttendanceSummary({String? studentId}) async {
    final records = await getAttendance(studentId: studentId);
    if (records.isEmpty) return const AttendanceSummary();
    final present = records.where((r) => r.isPresent).length;
    final late = records.where((r) => r.isLate).length;
    final absent = records.where((r) => r.isAbsent).length;
    return AttendanceSummary(
      totalClasses: records.length,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
    );
  }

  /// Fetch Institutional Announcements
  Future<List<AnnouncementModel>> getAnnouncements() async {
    try {
      final res = await SupabaseService.client
          .from(DbTables.announcements)
          .select()
          .order('created_at', ascending: false);
      if (res.isNotEmpty) {
        return (res as List).map((a) => AnnouncementModel.fromJson(a)).toList();
      }
    } catch (e) {
      debugPrint('[AcademicRepository] getAnnouncements error: $e');
    }
    return const [];
  }
}


export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ACADEMIC_ADMIN'
  | 'CONTENT_ADMIN'
  | 'TEACHER_ADMIN'
  | 'SEO_ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'suspended';
  avgMockScore: number;
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  assignedBatches: string[];
  status: 'active' | 'on_leave' | 'inactive';
  activeLiveClassesToday: number;
  photoUrl?: string;
  bio?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  category: 'Engineering (JEE)' | 'Medical (NEET)' | 'Civil Services (OPSC)' | 'Foundation';
  durationMonths: number;
  description: string;
  isActive: boolean;
  batchesCount: number;
  enrolledStudentsCount: number;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  code: string;
  totalChapters: number;
  totalLectures: number;
  leadTeacherName: string;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  roomName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface LiveClass {
  id: string;
  title: string;
  subject: string;
  courseName: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  teacherName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  jitsiRoomName: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendeeCount?: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  batchName: string;
  type: 'Theory Notes' | 'DPP' | 'PYQ Archive' | 'Formula Sheet';
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  downloadCount: number;
  isPublished: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  batchName: string;
  dueDate: string;
  totalMarks: number;
  totalSubmissions: number;
  pendingGrading: number;
  description: string;
}

export interface QuestionBankItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  negativeMarks: number;
}

export interface MockExam {
  id: string;
  title: string;
  courseName: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  scheduledDate: string;
  isPublished: boolean;
  attemptCount: number;
  avgScore: number;
}

export interface EnquiryLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  interestedCourse: string;
  message: string;
  source: 'Website Form' | 'Mobile App' | 'Direct Walk-in' | 'WhatsApp';
  status: 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED';
  createdAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

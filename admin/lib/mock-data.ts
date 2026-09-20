import {
  Student,
  Teacher,
  Course,
  Batch,
  LiveClass,
  StudyMaterial,
  Assignment,
  QuestionBankItem,
  MockExam,
  EnquiryLead,
  AuditLog,
} from './types/admin';

// Production: Operational data must originate from Supabase database tables.
// All mock/demo seed structures have been permanently purged.
export const mockStudents: Student[] = [];
export const mockTeachers: Teacher[] = [];
export const mockCourses: Course[] = [];
export const mockBatches: Batch[] = [];
export const mockLiveClasses: LiveClass[] = [];
export const mockStudyMaterials: StudyMaterial[] = [];
export const mockAssignments: Assignment[] = [];
export const mockQuestions: QuestionBankItem[] = [];
export const mockExams: MockExam[] = [];
export const mockEnquiries: EnquiryLead[] = [];
export const mockAuditLogs: AuditLog[] = [];

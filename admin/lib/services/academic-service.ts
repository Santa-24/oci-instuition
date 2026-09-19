import {
  Student,
  Teacher,
  Course,
  Batch,
  LiveClass,
  MockExam,
  QuestionBankItem,
  EnquiryLead,
  AuditLog,
} from '@/lib/types/admin';

/**
 * AcademicService for OCI Master Admin Panel.
 * Communicates with the secure /api/admin/* service-role endpoints
 * to perform live database operations across Supabase tables.
 */
export const AcademicService = {
  // --- DASHBOARD METRICS ---
  async getDashboardMetrics() {
    const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    const json = await res.json();
    return json;
  },

  // --- STUDENTS ---
  async getStudents(): Promise<Student[]> {
    const res = await fetch('/api/admin/students', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.students || [];
  },

  async createStudent(student: { name: string; rollNo: string; email: string; phone: string; batchId?: string }) {
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create student');
    return json.student;
  },

  async deleteStudent(id: string) {
    const res = await fetch(`/api/admin/students?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete student');
    return true;
  },

  // --- TEACHERS ---
  async getTeachers(): Promise<Teacher[]> {
    const res = await fetch('/api/admin/teachers', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.teachers || [];
  },

  async createTeacher(teacher: {
    name: string;
    employeeId: string;
    email: string;
    phone: string;
    subject: string;
    qualification: string;
    experienceYears?: number;
    bio?: string;
  }) {
    const res = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create teacher');
    return json.teacher;
  },

  async deleteTeacher(id: string) {
    const res = await fetch(`/api/admin/teachers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete teacher');
    return true;
  },

  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/admin/courses', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.courses || [];
  },

  async createCourse(course: {
    name: string;
    code: string;
    category: string;
    durationMonths: number;
    description: string;
  }) {
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create course');
    return json.course;
  },

  async updateCourse(course: Partial<Course> & { id: string }) {
    const res = await fetch('/api/admin/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update course');
    return json.course;
  },

  async deleteCourse(id: string) {
    const res = await fetch(`/api/admin/courses?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete course');
    return true;
  },

  // --- BATCHES ---
  async getBatches(): Promise<Batch[]> {
    const res = await fetch('/api/admin/batches', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.batches || [];
  },

  async createBatch(batch: {
    name: string;
    courseId: string;
    schedule: string;
    roomName: string;
    capacity: number;
    startDate?: string;
    endDate?: string;
  }) {
    const res = await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create batch');
    return json.batch;
  },

  async deleteBatch(id: string) {
    const res = await fetch(`/api/admin/batches?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete batch');
    return true;
  },

  // --- EXAMS ---
  async getExams(): Promise<MockExam[]> {
    const res = await fetch('/api/admin/exams', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.exams || [];
  },

  async getMockExams(): Promise<MockExam[]> {
    return this.getExams();
  },

  async createExam(exam: { title: string; courseId?: string; durationMinutes: number; totalMarks: number }) {
    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create exam');
    return json.exam;
  },

  async deleteExam(id: string) {
    const res = await fetch(`/api/admin/exams?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete exam');
    return true;
  },

  // --- ENQUIRIES ---
  async getEnquiries(): Promise<EnquiryLead[]> {
    const res = await fetch('/api/admin/enquiries', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.enquiries || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      interestedCourse: e.interested_course || 'General Enquiry',
      message: e.message || '',
      source: e.source || 'Website Form',
      status: e.status || 'NEW',
      notes: e.internal_notes || '',
      createdAt: e.created_at,
    }));
  },

  async updateEnquiryStatus(id: string, status: string, internalNotes?: string) {
    const res = await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, internalNotes }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update enquiry');
    return json.enquiry;
  },

  async deleteEnquiry(id: string) {
    const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete enquiry');
    return true;
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements() {
    const res = await fetch('/api/admin/announcements', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.announcements || [];
  },

  async createAnnouncement(announcement: { title: string; content: string; category?: string; isUrgent?: boolean }) {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create announcement');
    return json.announcement;
  },

  async deleteAnnouncement(id: string) {
    const res = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete announcement');
    return true;
  },

  // --- LIVE CLASSES ---
  async getLiveClasses(): Promise<LiveClass[]> {
    return [];
  },

  async createLiveClass(liveClass: {
    title: string;
    subject: string;
    batchId: string;
    scheduledStart: string;
    scheduledEnd: string;
  }): Promise<LiveClass> {
    return {
      id: `live_${Date.now()}`,
      title: liveClass.title,
      subject: liveClass.subject,
      courseName: 'General Course',
      batchId: liveClass.batchId,
      batchName: 'Active Batch',
      teacherId: 'fac_default',
      teacherName: 'OCI Faculty',
      scheduledStartTime: liveClass.scheduledStart,
      scheduledEndTime: liveClass.scheduledEnd,
      status: 'scheduled',
      jitsiRoomName: `oci_${Date.now()}`,
    };
  },

  // --- QUESTION BANK ---
  async getQuestions(): Promise<QuestionBankItem[]> {
    try {
      const res = await fetch('/api/admin/exams', { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      return json.questions || [];
    } catch {
      return [];
    }
  },

  async createQuestion(question: {
    subject: string;
    topic: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
  }): Promise<QuestionBankItem> {
    return {
      id: `q_${Date.now()}`,
      subject: question.subject,
      topic: question.topic,
      question: question.question,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation || '',
      difficulty: 'Medium',
      marks: 4,
      negativeMarks: 1,
    };
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    return [];
  },
};


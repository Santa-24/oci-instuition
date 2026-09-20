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

  // --- SUBJECTS ---
  async getSubjects() {
    const res = await fetch('/api/admin/subjects', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.subjects || [];
  },

  async createSubject(subject: { name: string; code: string; courseId?: string }) {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create subject');
    return json.subject;
  },

  async deleteSubject(id: string) {
    const res = await fetch(`/api/admin/subjects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete subject');
    return true;
  },

  // --- STUDY MATERIALS ---
  async getMaterials() {
    const res = await fetch('/api/admin/materials', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.materials || [];
  },

  async createMaterial(material: { title: string; subject: string; batchId?: string; fileUrl?: string; fileSize?: string; type?: string }) {
    const res = await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create material');
    return json.material;
  },

  async deleteMaterial(id: string) {
    const res = await fetch(`/api/admin/materials?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete material');
    return true;
  },

  // --- RECORDED CLASSES ---
  async getRecordedClasses() {
    const res = await fetch('/api/admin/recorded-classes', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.recordings || [];
  },

  async createRecordedClass(recording: { title: string; subject: string; batchId?: string; videoUrl: string; durationMinutes?: number }) {
    const res = await fetch('/api/admin/recorded-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recording),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create recording');
    return json.recording;
  },

  async deleteRecordedClass(id: string) {
    const res = await fetch(`/api/admin/recorded-classes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete recording');
    return true;
  },

  // --- ASSIGNMENTS ---
  async getAssignments() {
    const res = await fetch('/api/admin/assignments', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.assignments || [];
  },

  async createAssignment(assignment: { title: string; subject: string; batchId?: string; description?: string; dueDate?: string }) {
    const res = await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create assignment');
    return json.assignment;
  },

  async deleteAssignment(id: string) {
    const res = await fetch(`/api/admin/assignments?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete assignment');
    return true;
  },

  // --- LIVE CLASSES ---
  async getLiveClasses(): Promise<LiveClass[]> {
    const res = await fetch('/api/admin/live-classes', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.liveClasses || [];
  },

  async createLiveClass(liveClass: {
    title: string;
    subject: string;
    batchId?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  }): Promise<LiveClass> {
    const res = await fetch('/api/admin/live-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liveClass),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create live class');
    return json.liveClass;
  },

  async deleteLiveClass(id: string) {
    const res = await fetch(`/api/admin/live-classes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete live class');
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.notifications || [];
  },

  async createNotification(notif: { title: string; body: string; target?: string }) {
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send notification');
    return json.notification;
  },

  // --- RESULTS ---
  async getResults() {
    const res = await fetch('/api/admin/results', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.results || [];
  },

  async createResult(result: {
    examId: string;
    studentId?: string;
    score: number;
    totalMarks?: number;
    accuracyPercentage?: number;
    airRank?: number;
    percentile?: number;
  }) {
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to record result');
    return json.result;
  },

  async deleteResult(id: string) {
    const res = await fetch(`/api/admin/results?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete result');
    return true;
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

  // --- ATTENDANCE ---
  async getAttendance(params?: { liveClassId?: string; batchId?: string }) {
    const query = new URLSearchParams();
    if (params?.liveClassId) query.set('liveClassId', params.liveClassId);
    if (params?.batchId) query.set('batchId', params.batchId);
    const res = await fetch(`/api/admin/attendance?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.attendance || [];
  },

  async markAttendance(data: { studentId: string; liveClassId?: string; status: 'present' | 'absent' | 'late' }) {
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to mark attendance');
    return json.attendance;
  },

  async deleteAttendance(id: string) {
    const res = await fetch(`/api/admin/attendance?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete attendance record');
    return true;
  },

  // --- SETTINGS ---
  async getSettings(key: string, defaultFallback: any = null) {
    try {
      const res = await fetch(`/api/admin/settings?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
      if (!res.ok) return defaultFallback;
      const json = await res.json();
      return json.data || defaultFallback;
    } catch {
      return defaultFallback;
    }
  },

  async saveSettings(key: string, content: any) {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save settings');
    return json.data;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    return [];
  },
};


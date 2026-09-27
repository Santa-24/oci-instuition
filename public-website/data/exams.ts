export interface ExamCategory {
  id: string
  title: string
  slug: string
  description: string
  examsList: string[]
  iconName: string
  badgeText: string
  featured?: boolean
  imageUrl?: string
}

export const examCategories: ExamCategory[] = [
  {
    id: 'ssc',
    title: 'SSC Exams',
    slug: 'ssc',
    badgeText: 'Staff Selection Commission',
    imageUrl: '/images/exam-ssc.jpg',
    description:
      'Systematic preparation for Staff Selection Commission recruitment examinations with in-depth coverage of Reasoning, Quantitative Aptitude, English, and General Awareness.',
    examsList: [
      'SSC CGL (Combined Graduate Level)',
      'SSC CHSL (Combined Higher Secondary Level)',
      'SSC MTS (Multi-Tasking Staff)',
      'SSC GD (General Duty Constable)',
      'Other SSC Examinations',
    ],
    iconName: 'Award',
    featured: true,
  },
  {
    id: 'odisha-govt',
    title: 'Odisha Government Exams',
    slug: 'odisha-govt',
    badgeText: 'State Recruitment',
    imageUrl: '/images/exam-odisha-govt.jpg',
    description:
      'Dedicated coaching tailored specifically to Odisha state government recruitment notifications, pattern nuances, and regional competitive standards.',
    examsList: [
      'OSSC (Odisha Staff Selection Commission)',
      'OSSSC (Odisha Sub-ordinate Staff Selection Commission)',
      'Odisha Police Constable',
      'Odisha Police Sub-Inspector (SI)',
      'Other Odisha State Government Examinations',
    ],
    iconName: 'Building2',
    featured: true,
  },
  {
    id: 'railway',
    title: 'Railway Exams',
    slug: 'railway',
    badgeText: 'Railway Recruitment Board',
    imageUrl: '/images/exam-railway.jpg',
    description:
      'Exam-oriented conceptual clarity and speed-building practice for various technical and non-technical post recruitments in Indian Railways.',
    examsList: [
      'RRB NTPC (Non-Technical Popular Categories)',
      'RRB Group D',
      'Other Railway Recruitment Examinations',
    ],
    iconName: 'Train',
    featured: true,
  },
  {
    id: 'banking',
    title: 'Banking Exams',
    slug: 'banking',
    badgeText: 'Banking & Financial Sector',
    imageUrl: '/images/exam-banking.jpg',
    description:
      'Smart techniques, time-management methodologies, and rigorous problem-solving practice for public sector banking competitive examinations.',
    examsList: [
      'IBPS PO / Clerk / RRB',
      'SBI PO / Junior Associate',
      'Other Public Sector Bank Examinations',
    ],
    iconName: 'Landmark',
    featured: true,
  },
  {
    id: 'defence',
    title: 'Defence & Uniform Services',
    slug: 'defence',
    badgeText: 'Armed & Police Forces',
    imageUrl: '/images/exam-defence.jpg',
    description:
      'Targeted guidance, disciplined physical endurance orientation, and academic groundwork for competitive examinations across Police and Armed Forces posts.',
    examsList: [
      'Odisha Police Sub-Inspector (SI)',
      'Odisha Police Constable',
      'SSC GD (General Duty) Constable',
      'Paramilitary & Defence Recruitment Exams',
    ],
    iconName: 'ShieldCheck',
    featured: true,
  },
  {
    id: 'teaching',
    title: 'Teaching Exams',
    slug: 'teaching',
    badgeText: 'Education Sector',
    imageUrl: '/images/exam-teaching.jpg',
    description:
      'Comprehensive syllabus coverage and pedagogy concept building for Odisha state and central teacher eligibility and recruitment tests.',
    examsList: [
      'CT (Certificate in Teaching)',
      'B.Ed. Entrance Examination',
      'OTET (Odisha Teacher Eligibility Test)',
      'OSSTET (Odisha Secondary School Teacher Eligibility Test)',
      'RHT (Regular High School Teacher)',
      'Other Teaching-Related Examinations',
    ],
    iconName: 'GraduationCap',
    featured: true,
  },
  {
    id: 'other-govt',
    title: 'Other Government Exams',
    slug: 'other-govt',
    badgeText: 'General Competitive',
    imageUrl: '/images/student-notes.jpg',
    description:
      'Foundation and exam-oriented preparation for various central and state government recruitment examinations requiring strong fundamental concepts.',
    examsList: [
      'Central & State Level Recruitment Tests',
      'General Aptitude & Reasoning Foundation',
      'General Studies & Current Affairs Orientation',
    ],
    iconName: 'BookOpenCheck',
    featured: false,
  },
]

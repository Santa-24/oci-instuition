export interface AppFeature {
  id: string
  title: string
  description: string
  iconName: string
}

export const appFeatures: AppFeature[] = [
  {
    id: 'dashboard',
    title: 'Student Dashboard',
    description: 'A personalized overview of your learning journey, upcoming schedules, and performance summary.',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'live-classes',
    title: 'Live Classes',
    description: 'Access live learning sessions and interactive lectures directly through the mobile application.',
    iconName: 'Video',
  },
  {
    id: 'study-materials',
    title: 'Study Materials',
    description: 'Comprehensive digital notes, topic summaries, and curated learning resources at your fingertips.',
    iconName: 'FileText',
  },
  {
    id: 'practice-tests',
    title: 'Practice Tests',
    description: 'Practice topic-wise questions regularly to strengthen conceptual understanding.',
    iconName: 'CheckSquare',
  },
  {
    id: 'mock-exams',
    title: 'Mock Exams',
    description: 'Simulate real competitive exam environments to sharpen time management and exam stamina.',
    iconName: 'Clock',
  },
  {
    id: 'results',
    title: 'Results',
    description: 'Instant scorecards and detailed answer explanations after test completion.',
    iconName: 'BarChart2',
  },
  {
    id: 'performance',
    title: 'Performance Analytics',
    description: 'Visual progress charts and subject-wise accuracy tracking to highlight growth areas.',
    iconName: 'TrendingUp',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Stay updated with class alerts, examination news, schedule changes, and institute announcements.',
    iconName: 'Bell',
  },
]

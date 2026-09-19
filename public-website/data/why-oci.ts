export interface Pillar {
  number: string
  title: string
  description: string
  iconName: string
}

export const corePillars: Pillar[] = [
  {
    number: '01',
    title: 'Exam-Oriented Preparation',
    description:
      'Curriculum structured precisely around contemporary competitive examination patterns, marking schemes, and syllabus requirements.',
    iconName: 'Target',
  },
  {
    number: '02',
    title: 'Strong Concept Building',
    description:
      'Special emphasis on fundamental principles before progressing to advanced problem solving, ensuring deep comprehension.',
    iconName: 'BrainCircuit',
  },
  {
    number: '03',
    title: 'Experienced & Dedicated Faculty',
    description:
      'Student-friendly teaching methodologies delivered by passionate educators focused on individual academic growth.',
    iconName: 'Users',
  },
  {
    number: '04',
    title: 'Regular Practice & Tests',
    description:
      'Continuous practice sets, section-wise drills, and full-length mock examinations designed to build speed and accuracy.',
    iconName: 'FileCheck',
  },
  {
    number: '05',
    title: 'Shortcut Tricks & Smart Methods',
    description:
      'Proven time-saving calculation approaches and smart elimination techniques essential for competitive exam success.',
    iconName: 'Zap',
  },
  {
    number: '06',
    title: 'Doubt-Clearing Support',
    description:
      'Open interactive environment where students are actively encouraged to ask questions and eliminate conceptual ambiguities.',
    iconName: 'HelpCircle',
  },
  {
    number: '07',
    title: 'Performance Improvement',
    description:
      'Regular evaluation analytics to help students identify weak areas and implement targeted study strategies.',
    iconName: 'TrendingUp',
  },
  {
    number: '08',
    title: 'Student-Friendly Environment',
    description:
      'A positive, disciplined, and supportive atmosphere that fosters academic focus, confidence, and determination.',
    iconName: 'Sparkles',
  },
]

export interface JourneyStep {
  step: string
  title: string
  subtitle: string
  description: string
}

export const learningJourney: JourneyStep[] = [
  {
    step: '01',
    title: 'Understand',
    subtitle: 'Build Strong Concepts',
    description:
      'Master core concepts and fundamental principles through clear, systematic, and structured classroom explanations.',
  },
  {
    step: '02',
    title: 'Practice',
    subtitle: 'Practice Consistently',
    description:
      'Apply conceptual understanding through curated practice questions, daily assignments, and topic-wise test sets.',
  },
  {
    step: '03',
    title: 'Improve',
    subtitle: 'Analyze & Refine',
    description:
      'Identify individual weaknesses, receive dedicated doubt clearance, and refine problem-solving speed and accuracy.',
  },
  {
    step: '04',
    title: 'Compete',
    subtitle: 'Approach Exams With Confidence',
    description:
      'Simulate real examination conditions with full-length mock tests and step into exam halls with total self-assurance.',
  },
]

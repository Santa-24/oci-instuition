import fs from 'fs'
import path from 'path'
import { siteConfig } from '@/data/site'
import { examCategories } from '@/data/exams'
import { corePillars, learningJourney } from '@/data/why-oci'
import { aboutData } from '@/data/about'
import { appFeatures } from '@/data/app-features'

const CMS_FILE_PATH = path.join(process.cwd(), 'data', 'cms-data.json')

export interface CMSData {
  homepage: {
    hero: {
      eyebrow: string
      heading: string
      subheading: string
      description: string
      primaryCtaText: string
      primaryCtaLink: string
      secondaryCtaText: string
      secondaryCtaLink: string
      appCtaText: string
      appCtaLink: string
    }
    trustStrip: Array<{ label: string; text: string }>
    aboutPreview: {
      heading: string
      description: string
      ctaText: string
      ctaLink: string
    }
    finalCta: {
      heading: string
      subheading: string
      primaryBtnText: string
      secondaryBtnText: string
    }
  }
  about: typeof aboutData
  whyOci: {
    pillars: typeof corePillars
    journey: typeof learningJourney
  }
  exams: typeof examCategories
  appFeatures: typeof appFeatures
  appSettings: {
    androidUrl: string
    iosUrl: string
    qrCodeText: string
  }
  successStories: Array<{
    id: string
    studentName: string
    exam: string
    achievement: string
    year: string
    photoUrl: string
    story: string
    featured: boolean
    published: boolean
  }>
  faculty: Array<{
    id: string
    name: string
    subject: string
    qualification: string
    experience: string
    photoUrl: string
    biography: string
    displayOrder: number
    published: boolean
  }>
  testimonials: Array<{
    id: string
    studentName: string
    exam: string
    photoUrl: string
    testimonial: string
    year: string
    featured: boolean
    published: boolean
  }>
  gallery: Array<{
    id: string
    title: string
    category: string
    imageUrl: string
    description: string
    published: boolean
  }>
  faqs: Array<{
    id: string
    question: string
    answer: string
    category: string
    published: boolean
  }>
  enquiries: Array<{
    id: string
    fullName: string
    phone: string
    email: string
    examInterested: string
    message: string
    createdAt: string
    status: 'New' | 'Contacted' | 'In Progress' | 'Converted' | 'Closed'
    internalNotes?: string
  }>
  settings: typeof siteConfig
  seo: {
    siteTitle: string
    siteDescription: string
    keywords: string[]
    pages: Record<string, { title: string; description: string; ogTitle?: string; ogDescription?: string }>
  }
}

const defaultCmsData: CMSData = {
  homepage: {
    hero: {
      eyebrow: 'ESTABLISHED 2017 • BHADRAK, ODISHA',
      heading: 'Your Goal. Our Guidance. Your Success.',
      subheading: 'Build Strong Concepts. Practice Consistently. Compete With Confidence.',
      description:
        'Odisha Competitive Institute (OCI) is committed to providing quality, systematic, easy-to-understand and exam-oriented education while helping students build strong concepts, practice consistently and approach competitive examinations with confidence.',
      primaryCtaText: 'Start Your Preparation',
      primaryCtaLink: '/contact',
      secondaryCtaText: 'Explore Examinations',
      secondaryCtaLink: '/exams',
      appCtaText: 'Download OCI App',
      appCtaLink: '/app',
    },
    trustStrip: [
      { label: 'Established', text: '2017' },
      { label: 'Approach', text: 'Student-Focused Learning' },
      { label: 'Target', text: 'Competitive Exam Preparation' },
      { label: 'Location', text: 'Bhadrak, Odisha' },
      { label: 'System', text: 'Exam-Oriented Education' },
    ],
    aboutPreview: {
      heading: 'Built Around Student Success.',
      description:
        'Odisha Competitive Institute (OCI) was founded on 17 January 2017 in Bhadrak with a vision to make competitive examination preparation structured, transparent, and genuinely student-centric.',
      ctaText: 'Discover OCI Story',
      ctaLink: '/about',
    },
    finalCta: {
      heading: 'Your Preparation Starts With One Decision.',
      subheading: 'Build Strong Concepts • Practice Consistently • Compete With Confidence',
      primaryBtnText: 'Start Your Preparation',
      secondaryBtnText: 'Download OCI App',
    },
  },
  about: aboutData,
  whyOci: {
    pillars: corePillars,
    journey: learningJourney,
  },
  exams: examCategories,
  appFeatures: appFeatures,
  appSettings: {
    androidUrl: 'Coming Soon',
    iosUrl: 'Coming Soon',
    qrCodeText: 'Scan QR to view app updates & release announcements',
  },
  successStories: [],
  faculty: [],
  testimonials: [],
  gallery: [],
  faqs: [
    {
      id: 'faq-1',
      question: 'What competitive exams does OCI prepare students for?',
      answer: 'OCI prepares students for SSC (CGL, CHSL, MTS, GD), Odisha State Government Exams (OSSC, OSSSC, Police Constable/SI), Railways (RRB NTPC, Group D), Banking (IBPS, SBI), Defence, and Teaching entrance exams.',
      category: 'General',
      published: true,
    },
    {
      id: 'faq-2',
      question: 'Where is OCI located in Bhadrak?',
      answer: 'OCI is located at Nayabazar, near Old Rajghat Bridge, Bhadrak, Odisha — 756100.',
      category: 'Location',
      published: true,
    },
    {
      id: 'faq-[#3]',
      question: 'What are the institute office hours?',
      answer: 'Our admissions and office hours are 8:00 AM – 8:00 PM (Monday to Sunday). You can also call us at 7205021878 or WhatsApp 7655004403.',
      category: 'Admission',
      published: true,
    },
  ],
  enquiries: [
    {
      id: 'enq-sample-1',
      fullName: 'Rajesh Kumar Swain',
      phone: '7205021878',
      email: 'rajesh@example.com',
      examInterested: 'SSC Exams',
      message: 'I want to enquire about upcoming SSC CGL batch schedules.',
      createdAt: '2026-08-08T10:30:00Z',
      status: 'New',
    },
  ],
  settings: siteConfig,
  seo: {
    siteTitle: 'Odisha Competitive Institute | Your Success, Our Tradition',
    siteDescription:
      'Odisha Competitive Institute (OCI) in Bhadrak, Odisha provides quality, systematic, easy-to-understand, and exam-oriented coaching for SSC, Odisha Govt, Railway, Banking, Defence, and Teaching exams.',
    keywords: ['Odisha Competitive Institute', 'OCI Bhadrak', 'Competitive Coaching Bhadrak', 'SSC Coaching Odisha'],
    pages: {
      home: { title: 'Odisha Competitive Institute | Your Success, Our Tradition', description: 'Exam-oriented coaching in Bhadrak.' },
      about: { title: 'About OCI | Odisha Competitive Institute', description: 'Established 17 January 2017 in Bhadrak.' },
      exams: { title: 'Competitive Exam Preparation | OCI Bhadrak', description: 'SSC, State Govt, Railways, Banking prep.' },
      whyOci: { title: 'Why Choose OCI | Odisha Competitive Institute', description: '8 Core Pillars of Academic Excellence.' },
      app: { title: 'OCI Mobile App | Learn, Practice & Prepare', description: 'Practice tests, mock exams, notes on app.' },
      success: { title: 'Student Success Stories | OCI', description: 'Verified achievements and milestones.' },
      contact: { title: 'Contact OCI | Odisha Competitive Institute Bhadrak', description: 'Location, phone numbers, enquiry form.' },
    },
  },
}

export function getCMSData(): CMSData {
  try {
    if (!fs.existsSync(CMS_FILE_PATH)) {
      saveCMSData(defaultCmsData)
      return defaultCmsData
    }
    const raw = fs.readFileSync(CMS_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...defaultCmsData, ...parsed }
  } catch (error) {
    return defaultCmsData
  }
}

export function saveCMSData(data: CMSData): boolean {
  try {
    const dir = path.dirname(CMS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    return false
  }
}

/**
 * Fetch dynamic website content live from Supabase `website_content` table
 * with seamless fallback to local CMS defaults.
 */
export async function getLiveCMSData(): Promise<CMSData> {
  const baseData = getCMSData()
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return baseData
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/website_content?select=key,value`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 10 },
    })

    if (!res.ok) {
      return baseData
    }

    const rows = await res.json()
    if (Array.isArray(rows)) {
      const merged: any = { ...baseData }
      for (const row of rows) {
        if (row.key && row.value) {
          merged[row.key] = typeof row.value === 'object' ? { ...merged[row.key], ...row.value } : row.value
        }
      }
      return merged as CMSData
    }

    return baseData
  } catch (e) {
    return baseData
  }
}


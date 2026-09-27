'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Download,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Building2,
  Train,
  Landmark,
  GraduationCap,
  Sparkles,
  Megaphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'
import { examCategories, type ExamCategory } from '@/data/exams'
import { supabase } from '@/lib/supabase/client'

const EXAM_FILTER_TABS = [
  { id: 'all', label: 'All Disciplines' },
  { id: 'odisha-govt', label: 'Odisha Govt (OSSC/OSSSC)' },
  { id: 'ssc', label: 'Staff Selection (SSC)' },
  { id: 'railway', label: 'Railways (RRB)' },
  { id: 'banking', label: 'Banking (IBPS/SBI)' },
  { id: 'teaching', label: 'Teaching (CT/B.Ed/OTET)' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all')
  const [categories, setCategories] = useState<ExamCategory[]>(examCategories)
  const [activeNotice, setActiveNotice] = useState<{ title: string; content?: string } | null>(null)
  const [appVersion, setAppVersion] = useState<string>('1.0.0')
  const [heroData, setHeroData] = useState({
    eyebrow: 'ODISHA COMPETITIVE INSTITUTE • BHADRAK • ESTD. 2017',
    heading: 'Building Conceptual Rigor. \nSecuring Government Careers.',
    description:
      'Since 2017, OCI has provided structured classroom mentorship and comprehensive CBT mock test series for competitive aspirants across coastal Odisha—transforming fundamental understanding into selection merit.',
  })

  useEffect(() => {
    async function loadLiveSiteData() {
      try {
        // 1. Fetch active announcements
        const { data: noticeData } = await supabase
          .from('announcements')
          .select('title, content, is_urgent, category')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (noticeData) {
          setActiveNotice(noticeData)
        }

        // 2. Fetch CMS homepage copy
        const { data: cmsData } = await supabase
          .from('website_content')
          .select('value')
          .eq('key', 'homepage')
          .maybeSingle()

        if (cmsData?.value?.hero) {
          const h = cmsData.value.hero
          setHeroData({
            eyebrow: h.eyebrow || 'ODISHA COMPETITIVE INSTITUTE • BHADRAK • ESTD. 2017',
            heading: h.heading || 'Building Conceptual Rigor. \nSecuring Government Careers.',
            description: h.description || heroData.description,
          })
        }

        // 3. Fetch latest active app version
        const { data: versionData } = await supabase
          .from('app_versions')
          .select('version_name')
          .eq('platform', 'android')
          .eq('is_active', true)
          .order('version_code', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (versionData?.version_name) {
          setAppVersion(versionData.version_name)
        }

        // 4. Fetch live courses from Supabase
        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)

        if (dbCourses && dbCourses.length > 0) {
          const updated = [...examCategories]
          dbCourses.forEach((crs: any) => {
            const catName = (crs.category || '').toLowerCase()
            let targetCatId = 'odisha-govt'
            if (catName.includes('ssc') || catName.includes('central')) targetCatId = 'ssc'
            else if (catName.includes('rail')) targetCatId = 'railway'
            else if (catName.includes('bank')) targetCatId = 'banking'
            else if (catName.includes('teach')) targetCatId = 'teaching'

            const idx = updated.findIndex((c) => c.id === targetCatId)
            if (idx >= 0) {
              const label = crs.code ? `${crs.name} (${crs.code})` : crs.name
              if (!updated[idx].examsList.includes(label) && !updated[idx].examsList.includes(crs.name)) {
                updated[idx] = {
                  ...updated[idx],
                  examsList: [label, ...updated[idx].examsList],
                }
              }
            }
          })
          setCategories(updated)
        }
      } catch (err) {
        console.warn('Public live data fetch notice:', err)
      }
    }

    loadLiveSiteData()
  }, [])

  const filteredExams =
    activeTab === 'all'
      ? categories
      : categories.filter((cat) => cat.id === activeTab || cat.slug === activeTab)

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* ─────────────────────────────────────────────────────────────
          OPTIONAL LIVE ANNOUNCEMENT BANNER
          ───────────────────────────────────────────────────────────── */}
      {activeNotice && (
        <aside aria-label="Official Campus Announcement" className="bg-[#0C192E] text-white py-2.5 px-4 border-b border-[#1E2D4A]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="px-2 py-0.5 rounded bg-[#D97706] text-white font-bold text-[10px] tracking-wide uppercase shrink-0">
                OFFICIAL NOTICE
              </span>
              <span className="truncate">{activeNotice.title}</span>
            </div>
            <Link
              href="/contact"
              className="text-[#FDE68A] hover:underline shrink-0 text-[11px] font-bold"
            >
              Inquire Now →
            </Link>
          </div>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL ACADEMIC HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E6E2D8] overflow-hidden">
        {/* Subtle Ambient Academic Background */}
        <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none mix-blend-multiply">
          <img
            src="/images/hero-ambient.jpg"
            alt="OCI Academic Campus Atmosphere"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/80 via-[#FAF8F5]/95 to-[#FAF8F5] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left Column: Academic Manifesto (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] sm:text-xs font-semibold tracking-wide max-w-full">
                <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                <span className="truncate">{heroData.eyebrow}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight font-serif leading-[1.18] sm:leading-[1.12] break-words whitespace-normal sm:whitespace-pre-line">
                {heroData.heading}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#475569] leading-relaxed max-w-2xl">
                {heroData.description}
              </p>

              {/* Key Institutional Authority Badges */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E6E2D8] shadow-xs space-y-1">
                  <span className="text-base sm:text-lg font-extrabold font-serif text-[#0F172A] block leading-none">9+ Years</span>
                  <span className="text-[10px] sm:text-[11px] text-[#64748B] block font-medium leading-tight">Estd. 2017 in Bhadrak</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E6E2D8] shadow-xs space-y-1">
                  <span className="text-base sm:text-lg font-extrabold font-serif text-[#1D4ED8] block leading-none">3-Hour Cycle</span>
                  <span className="text-[10px] sm:text-[11px] text-[#64748B] block font-medium leading-tight">Lecture + Supervised Drill</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E6E2D8] shadow-xs space-y-1">
                  <span className="text-base sm:text-lg font-extrabold font-serif text-[#059669] block leading-none">TCS iON CBT</span>
                  <span className="text-[10px] sm:text-[11px] text-[#64748B] block font-medium leading-tight">Lab & Android Engine</span>
                </div>
              </div>

              {/* Dual Action Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
                <Button
                  href="/exams"
                  variant="primary"
                  size="lg"
                  className="shadow-md justify-center w-full sm:w-auto text-center"
                >
                  <span>Explore Examination Batches</span>
                  <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
                </Button>

                <Button
                  href="/download"
                  variant="secondary"
                  size="lg"
                  className="border-[#CBD5E1] justify-center w-full sm:w-auto text-center"
                >
                  <Download className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Download OCI App (v{appVersion})</span>
                </Button>
              </div>

              {/* Verified Trust Strip under hero */}
              <div className="pt-6 border-t border-[#E6E2D8] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                <div className="p-3 sm:p-0 rounded-xl bg-white/60 sm:bg-transparent border border-[#E6E2D8] sm:border-0">
                  <span className="text-[#64748B] block text-[11px] uppercase tracking-wider font-semibold">Admissions Status</span>
                  <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">Active Batch Enrolment</span>
                </div>
                <div className="p-3 sm:p-0 rounded-xl bg-white/60 sm:bg-transparent border border-[#E6E2D8] sm:border-0">
                  <span className="text-[#64748B] block text-[11px] uppercase tracking-wider font-semibold">Instruction Mode</span>
                  <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">Classroom + Digital CBT</span>
                </div>
                <div className="p-3 sm:p-0 rounded-xl bg-white/60 sm:bg-transparent border border-[#E6E2D8] sm:border-0">
                  <span className="text-[#64748B] block text-[11px] uppercase tracking-wider font-semibold">Headquarters</span>
                  <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">Nayabazar, Bhadrak</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Academy Campus & Classroom Visual Showcase (5 Cols) */}
            <div className="lg:col-span-5 relative z-10 w-full space-y-4">
              {/* Main Active Lecture Hall Showcase Card */}
              <div className="rounded-2xl overflow-hidden border border-[#E6E2D8] shadow-sm bg-white">
                {/* Large Active Classroom Lecture Photo */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden group">
                  <img
                    src="/images/hero-classroom.jpg"
                    alt="Odisha Competitive Institute Physical Classroom Batch Lecture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C192E]/95 via-[#0C192E]/35 to-transparent" />
                  
                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#0C192E]/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active Offline Batches • Nayabazar</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[#0F172A] font-bold text-[10px] uppercase tracking-wide shadow-xs shrink-0">
                      9th Year
                    </span>
                  </div>

                  {/* Bottom Photo Caption */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      PHYSICAL LEARNING CENTER
                    </span>
                    <span className="text-sm sm:text-base font-bold font-serif text-white block truncate">
                      Nayabazar Lecture & Mentorship Hall
                    </span>
                    <span className="text-[11px] text-white/80 block mt-0.5 truncate">
                      Daily Morning & Evening Batches for SSC, Odisha Govt & Railways
                    </span>
                  </div>
                </div>

                {/* Dual Supporting Proof Inset: Faculty Mentorship + CBT Lab */}
                <div className="grid grid-cols-2 divide-x divide-[#E6E2D8] border-t border-[#E6E2D8] bg-[#FAF8F5]">
                  <div className="p-3 flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#E6E2D8]">
                      <img
                        src="/images/indian-classroom-study.jpg"
                        alt="Dedicated Faculty Mentorship"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0F172A] block truncate">Faculty Mentorship</span>
                      <span className="text-[10px] text-[#64748B] block truncate">Subject Specialists</span>
                    </div>
                  </div>

                  <div className="p-3 flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#E6E2D8]">
                      <img
                        src="/images/cbt-computer-lab.jpg"
                        alt="Native CBT Simulation Lab"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0F172A] block truncate">TCS iON CBT Lab</span>
                      <span className="text-[10px] text-[#64748B] block truncate">Real Exam Simulator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Center Dossier Card below */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] block">
                      PHYSICAL HEADQUARTERS
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif">
                      Nayabazar Learning Center
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#F3F0EA] text-[11px] font-semibold text-[#475569] border border-[#E6E2D8] shrink-0">
                    Classroom + Lab
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#475569]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                    <span className="leading-snug text-[#334155]">{siteConfig.locationFull}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span className="leading-snug text-[#334155]">Morning (8:00 AM – 11:30 AM) • Evening (4:30 PM – 8:00 PM)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Admissions Desk</span>
                    <a href={`tel:${siteConfig.contact.phonePrimary}`} className="font-bold text-[#1D4ED8] hover:underline">
                      +91 {siteConfig.contact.phonePrimary}
                    </a>
                  </div>

                  <Button
                    href="/contact"
                    variant="primary"
                    size="sm"
                    className="bg-[#0C192E] hover:bg-[#15253F] text-white"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Visit Center</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. METHODOLOGICAL PROMISE BANNER (High Rigor)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex flex-col justify-between rounded-2xl p-5 bg-[#FAF8F5] border border-[#E6E2D8] transition-all hover:border-[#CBD5E1] shadow-xs h-full">
              <div className="space-y-3.5">
                <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs relative">
                  <img
                    src="/images/student-notes.jpg"
                    alt="Conceptual Grounding in Mathematics & Logical Reasoning"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0C192E]/85 backdrop-blur-xs text-amber-300 font-bold text-[10px] uppercase tracking-wide shadow-xs">
                    Theory First
                  </span>
                </div>
                <div className="space-y-1.5 border-l-2 border-[#D97706] pl-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] block">
                    PRINCIPLE 01
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                    Conceptual Depth First
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Shortcuts without theory fail when exam patterns shift. We teach derivations, underlying logic, and grammatical rules before speed drills.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl p-5 bg-[#FAF8F5] border border-[#E6E2D8] transition-all hover:border-[#CBD5E1] shadow-xs h-full">
              <div className="space-y-3.5">
                <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs relative">
                  <img
                    src="/images/mentorship-guidance.jpg"
                    alt="Faculty Supervising Classroom Practice Drills"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0C192E]/85 backdrop-blur-xs text-blue-300 font-bold text-[10px] uppercase tracking-wide shadow-xs">
                    Daily Supervision
                  </span>
                </div>
                <div className="space-y-1.5 border-l-2 border-[#1D4ED8] pl-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8] block">
                    PRINCIPLE 02
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                    Daily Supervised Practice
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Lectures are followed by mandatory 1-hour problem sets. Our faculty stay in the classroom to clear doubts on the spot.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl p-5 bg-[#FAF8F5] border border-[#E6E2D8] transition-all hover:border-[#CBD5E1] shadow-xs h-full">
              <div className="space-y-3.5">
                <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs relative">
                  <img
                    src="/images/cbt-computer-lab.jpg"
                    alt="Real Computer-Based Test Simulation Lab"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0C192E]/85 backdrop-blur-xs text-emerald-300 font-bold text-[10px] uppercase tracking-wide shadow-xs">
                    TCS iON Pattern
                  </span>
                </div>
                <div className="space-y-1.5 border-l-2 border-[#059669] pl-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] block">
                    PRINCIPLE 03
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                    Exact CBT Examination Interface
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Students practice on the OCI native test engine mirroring the exact screen layout, sectional timers, and negative scoring of TCS iON.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CORE EXAMINATION DISCIPLINES & BROCHURE GRID
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E6E2D8] pb-6">
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
                ACADEMIC CURRICULUM
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
                Core Examination Streams
              </h2>
              <p className="text-[#475569] text-sm sm:text-base max-w-2xl">
                Tailored syllabi, bilingual study notes, and targeted practice sets for national and Odisha state recruitment examinations.
              </p>
            </div>

            <Button href="/exams" variant="secondary" size="sm">
              <span>View Full Prospectus</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Filter Tabs - Smooth horizontal scroll on mobile, wrap on tablet/desktop */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 scrollbar-none">
            {EXAM_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  activeTab === tab.id
                    ? 'bg-[#0C192E] text-white shadow-xs'
                    : 'bg-[#F3F0EA] text-[#475569] hover:bg-[#E6E2D8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Disciplines Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((cat) => (
              <div
                key={cat.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs flex flex-col justify-between space-y-5 hover:border-[#CBD5E1] transition-all h-full group"
              >
                <div className="space-y-4">
                  {/* Authentic Discipline Photo Header */}
                  <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs">
                    <img
                      src={cat.imageUrl || '/images/hero-classroom.jpg'}
                      alt={`${cat.title} Preparation Batch`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C192E]/90 via-[#0C192E]/25 to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#0C192E]/85 backdrop-blur-xs text-amber-300 font-bold text-[10px] uppercase tracking-wide shadow-xs border border-white/10">
                        {cat.badgeText}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold text-white/90">Nayabazar Classroom Batch</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/90 text-white font-bold uppercase shadow-xs">
                        Enrolment Open
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-[#0F172A] leading-snug">
                      {cat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F3F0EA] space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-[#64748B] block">
                      Covered Examinations:
                    </span>
                    <ul className="space-y-1 text-xs text-[#334155]">
                      {cat.examsList.slice(0, 3).map((ex, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                          <span className="truncate">{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/contact?exam=${encodeURIComponent(cat.title)}`}
                    className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Enquire About Batch</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    href={`/exams#${cat.id}`}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] shrink-0"
                  >
                    Syllabus Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE 4-STAGE LEARNING PROGRESSION RAIL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              PEDAGOGICAL FRAMEWORK
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
              The 4-Stage Progression Model
            </h2>
            <p className="text-[#475569] text-base leading-relaxed">
              Competitive success is not achieved through unguided rote memorization. At OCI, every student progresses through a systematic 4-stage academic development path.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative">
            <div className="p-5 rounded-2xl bg-white border border-[#E6E2D8] flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-xs h-full">
              <div className="space-y-3">
                <div className="h-36 sm:h-32 w-full rounded-xl overflow-hidden border border-[#E6E2D8] relative">
                  <img
                    src="/images/library-study.jpg"
                    alt="Stage 1 Concept Grounding"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-amber-300 uppercase tracking-wide">Stage 01</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-serif leading-snug">
                  Concept Grounding
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Fundamental mastery of core mathematical principles, logical reasoning rules, and language grammars before touching shortcuts.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E2D8] flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-xs h-full">
              <div className="space-y-3">
                <div className="h-36 sm:h-32 w-full rounded-xl overflow-hidden border border-[#E6E2D8] relative">
                  <img
                    src="/images/student-notes.jpg"
                    alt="Stage 2 Structured Drills"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-blue-300 uppercase tracking-wide">Stage 02</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-serif leading-snug">
                  Structured Drills
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Supervised daily 50-question section-wise speed drills to build mental calculation speed and elimination reflexes.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E2D8] flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-xs h-full">
              <div className="space-y-3">
                <div className="h-36 sm:h-32 w-full rounded-xl overflow-hidden border border-[#E6E2D8] relative">
                  <img
                    src="/images/mentorship-guidance.jpg"
                    alt="Stage 3 Mentored Doubt Clearance"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-purple-300 uppercase tracking-wide">Stage 03</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-serif leading-snug">
                  Mentored Doubt Clearance
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  One-on-one faculty sessions after class to deconstruct wrong answers, analyze error patterns, and correct misunderstandings.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E2D8] flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-xs h-full">
              <div className="space-y-3">
                <div className="h-36 sm:h-32 w-full rounded-xl overflow-hidden border border-[#E6E2D8] relative">
                  <img
                    src="/images/cbt-computer-lab.jpg"
                    alt="Stage 4 Full CBT Simulation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Stage 04</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-serif leading-snug">
                  Full CBT Simulation
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Timed, computer-based mock tests on the OCI app and center lab mirroring the exact interface of SSC, Railway, and Odisha Govt portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CLASSROOM + DIGITAL APP SYNERGY
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
                HYBRID ACADEMIC ECOSYSTEM
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
                The Power of Physical Mentorship, Backed by Digital Drills.
              </h2>
              <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
                Pure online video courses lack accountability and peer discipline; standalone physical lectures lack digital speed metrics. OCI fuses both into a single cohesive training ecosystem.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Physical Classroom Accountability
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                      Daily in-person attendance, peer competition, real teacher feedback, and an academic environment that eliminates home distractions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Native Android CBT Testing Engine
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                      Carry practice tests anywhere. Full-length mock examinations with section-wise timers, negative mark calculations, and instant rank cards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Offline Digital Study Library
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                      Download topic summaries, formula sheets, and previous-year question analyses directly to your device for low-connectivity revision.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button href="/app" variant="primary" size="default">
                  <span>Explore App Capabilities</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right: Concrete App Interface Dossier */}
            <div className="lg:col-span-6 space-y-4">
              {/* Split Classroom & CBT Lab Visual Anchor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative h-40 sm:h-36 rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs group">
                  <img
                    src="/images/hero-classroom.jpg"
                    alt="Physical Classroom Mentorship"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C192E]/90 via-[#0C192E]/35 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Classroom Mentorship</span>
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">Daily Face-to-Face Lectures</span>
                  </div>
                </div>

                <div className="relative h-40 sm:h-36 rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs group">
                  <img
                    src="/images/cbt-computer-lab.jpg"
                    alt="Digital CBT Simulation Lab"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C192E]/90 via-[#0C192E]/35 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Digital CBT Testing</span>
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">Mobile + Lab Test Engine</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8 rounded-2xl bg-[#0C192E] text-white border border-[#1E2D4A] space-y-5 sm:space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2D4A] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#D97706] tracking-wider uppercase block">
                      OFFICIAL APPLICATION
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-serif text-white">
                      OCI Mobile v{appVersion}
                    </span>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-[#15253F] text-xs font-semibold text-emerald-400 border border-emerald-500/20 shrink-0">
                    Production Release
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#CBD5E1]">
                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-white block">CBT Examination Simulator</span>
                      <span className="text-[11px] text-[#94A3B8]">Timed sections, question palette, review tags</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-white block">Subject-wise Accuracy Analysis</span>
                      <span className="text-[11px] text-[#94A3B8]">Pinpoint weak chapters in Quant, Reasoning, Odia & GK</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-white block">Offline Notes & Syllabus Repository</span>
                      <span className="text-[11px] text-[#94A3B8]">Comprehensive exam PDFs available without internet</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    href="/download"
                    variant="amber"
                    size="default"
                    className="flex-1 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official APK</span>
                  </Button>

                  <Button
                    href="/app"
                    variant="secondary"
                    size="default"
                    className="flex-1 justify-center bg-[#15253F] text-white border-[#1E2D4A] hover:bg-[#1E2D4A]"
                  >
                    <span>View App Screenshots</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. PHYSICAL CENTER ADMISSIONS & LOCATION DOSSIER
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F3F0EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              VISIT OUR LEARNING CENTER
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
              Admissions & Offline Classroom Enquiries
            </h2>
            <p className="text-[#475569] text-base leading-relaxed">
              Experience the OCI classroom environment firsthand. Visit our office in Nayabazar, Bhadrak for free counseling on batch schedules, study material distribution, and syllabus planning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 p-5 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-5">
                {/* Campus Hall Photo */}
                <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-xs group">
                  <img
                    src="/images/classroom-hall.jpg"
                    alt="Nayabazar Learning Center Lecture Hall"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C192E]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs sm:text-sm font-bold font-serif">Nayabazar Academic Hall</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-[#0C192E] font-bold uppercase shadow-xs">
                      Free Counseling
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] font-serif border-b border-[#E6E2D8] pb-3">
                  Center Contact Information
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-[#475569]">
                  <div>
                    <span className="font-bold text-[#0F172A] block text-xs uppercase tracking-wider text-[#64748B]">Full Address</span>
                    <span className="text-xs sm:text-sm text-[#334155] leading-relaxed block mt-0.5">{siteConfig.locationFull}</span>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block text-xs uppercase tracking-wider text-[#64748B]">Office & Counseling Hours</span>
                    <span className="text-xs sm:text-sm text-[#334155] leading-relaxed block mt-0.5">{siteConfig.contact.officeHours}</span>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block text-xs uppercase tracking-wider text-[#64748B]">Telephone Helpline</span>
                    <a href={`tel:${siteConfig.contact.phonePrimary}`} className="text-[#1D4ED8] font-bold hover:underline block text-xs sm:text-sm mt-0.5">
                      +91 {siteConfig.contact.phonePrimary}
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block text-xs uppercase tracking-wider text-[#64748B]">WhatsApp Enquiries</span>
                    <a href={`https://wa.me/91${siteConfig.contact.whatsapp}`} className="text-[#059669] font-bold hover:underline block text-xs sm:text-sm mt-0.5">
                      +91 {siteConfig.contact.whatsapp}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E6E2D8]">
                <Button href="/contact" variant="primary" size="default" className="w-full justify-center">
                  <span>Open Contact & Enquiry Form</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Google Maps Viewport with responsive height matching contact card */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#E6E2D8] shadow-sm bg-white min-h-[350px] sm:min-h-[420px] h-full relative">
              <iframe
                title="Odisha Competitive Institute Location Map"
                src={siteConfig.address.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '100%' }}
                className="w-full h-full min-h-[350px] sm:min-h-[420px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Academic Manifesto (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                <span>{heroData.eyebrow}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight font-serif leading-[1.12] whitespace-pre-line">
                {heroData.heading}
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl">
                {heroData.description}
              </p>

              {/* Dual Action Group */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Button
                  href="/exams"
                  variant="primary"
                  size="lg"
                  className="shadow-md"
                >
                  <span>Explore Examination Batches</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  href="/download"
                  variant="secondary"
                  size="lg"
                  className="border-[#CBD5E1]"
                >
                  <Download className="w-4 h-4 text-[#D97706]" />
                  <span>Download OCI App (v{appVersion})</span>
                </Button>
              </div>

              {/* Verified Trust Strip under hero */}
              <div className="pt-6 border-t border-[#E6E2D8] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block">Admissions Status</span>
                  <span className="font-bold text-[#0F172A]">Active Batch Enrolment</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Instruction Mode</span>
                  <span className="font-bold text-[#0F172A]">Classroom + Digital CBT</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Headquarters</span>
                  <span className="font-bold text-[#0F172A]">Nayabazar, Bhadrak</span>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Center Quick Dossier Card (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="p-7 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] block">
                      OFFLINE ACADEMY DOSSIER
                    </span>
                    <h2 className="text-xl font-bold text-[#0F172A] font-serif">
                      Nayabazar Learning Center
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#F3F0EA] text-xs font-semibold text-[#475569] border border-[#E6E2D8]">
                    9th Year
                  </span>
                </div>

                <div className="space-y-4 text-sm text-[#475569]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Physical Location:</span>
                      <span className="text-xs leading-relaxed block text-[#475569]">
                        {siteConfig.locationFull}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Batch Sessions:</span>
                      <span className="text-xs leading-relaxed block text-[#475569]">
                        Morning Batches (8:00 AM – 11:30 AM) <br />
                        Evening Batches (4:30 PM – 8:00 PM)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Academic Methodology:</span>
                      <span className="text-xs leading-relaxed block text-[#475569]">
                        2-Hour Conceptual Lecture + 1-Hour Supervised Daily Practice Set + Weekly Full CBT Mocks.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6E2D8] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Direct Admissions Desk:</span>
                    <a
                      href={`tel:${siteConfig.contact.phonePrimary}`}
                      className="font-bold text-[#1D4ED8] hover:underline"
                    >
                      +91 {siteConfig.contact.phonePrimary}
                    </a>
                  </div>

                  <Button
                    href="/contact"
                    variant="primary"
                    size="default"
                    className="w-full justify-center bg-[#0C192E] hover:bg-[#15253F] text-white"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Schedule Center Visit & Consultation</span>
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
      <section className="py-12 bg-white border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 border-l-2 border-[#D97706] pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                PRINCIPLE 01
              </span>
              <h3 className="text-base font-bold text-[#0F172A]">
                Conceptual Depth First
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Shortcuts without theory fail when exam patterns shift. We teach derivations, underlying logic, and grammatical rules before speed drills.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-[#1D4ED8] pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                PRINCIPLE 02
              </span>
              <h3 className="text-base font-bold text-[#0F172A]">
                Daily Supervised Practice
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Lectures are followed by mandatory 1-hour problem sets. Our faculty stay in the classroom to clear doubts on the spot.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-[#059669] pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                PRINCIPLE 03
              </span>
              <h3 className="text-base font-bold text-[#0F172A]">
                Exact CBT Examination Interface
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Students practice on the OCI native test engine mirroring the exact screen layout, sectional timers, and negative scoring of TCS iON.
              </p>
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

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {EXAM_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#CBD5E1] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold uppercase tracking-wider">
                      {cat.badgeText}
                    </span>
                    <span className="text-xs text-[#64748B]">Bhadrak Center</span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-[#0F172A]">
                    {cat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>

                  <div className="pt-2 border-t border-[#F3F0EA] space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-[#64748B] block">
                      Covered Examinations:
                    </span>
                    <ul className="space-y-1 text-xs text-[#334155]">
                      {cat.examsList.slice(0, 3).map((ex, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E2D8] flex items-center justify-between">
                  <Link
                    href={`/contact?exam=${encodeURIComponent(cat.title)}`}
                    className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Enquire About Batch</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    href={`/exams#${cat.id}`}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-3 relative">
              <span className="text-4xl font-extrabold font-serif text-[#CBD5E1] block">
                01
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                Concept Grounding
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Fundamental mastery of core mathematical principles, logical reasoning rules, and language grammars before touching shortcuts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-3 relative">
              <span className="text-4xl font-extrabold font-serif text-[#CBD5E1] block">
                02
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                Structured Drills
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Supervised daily 50-question section-wise speed drills to build mental calculation speed and elimination reflexes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-3 relative">
              <span className="text-4xl font-extrabold font-serif text-[#CBD5E1] block">
                03
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                Mentored Doubt Clearance
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                One-on-one faculty sessions after class to deconstruct wrong answers, analyze error patterns, and correct misunderstandings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-3 relative">
              <span className="text-4xl font-extrabold font-serif text-[#D97706] block">
                04
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                Full CBT Simulation
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Timed, computer-based mock tests on the OCI app and center lab mirroring the exact interface of SSC, Railway, and Odisha Govt portals.
              </p>
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
            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl bg-[#0C192E] text-white border border-[#1E2D4A] space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#D97706] tracking-wider uppercase block">
                      OFFICIAL APPLICATION
                    </span>
                    <span className="text-xl font-bold font-serif text-white">
                      OCI Mobile v{appVersion}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#15253F] text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    Production Release
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#CBD5E1]">
                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">CBT Examination Simulator</span>
                      <span className="text-[11px] text-[#94A3B8]">Timed sections, question palette, review tags</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Subject-wise Accuracy Analysis</span>
                      <span className="text-[11px] text-[#94A3B8]">Pinpoint weak chapters in Quant, Reasoning, Odia & GK</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] flex items-center justify-between">
                    <div>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 p-8 rounded-2xl bg-white border border-[#E6E2D8] space-y-6">
              <h3 className="text-xl font-bold text-[#0F172A] font-serif border-b border-[#E6E2D8] pb-3">
                Center Contact Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
                <div>
                  <span className="font-bold text-[#0F172A] block">Full Address:</span>
                  <span>{siteConfig.locationFull}</span>
                </div>

                <div>
                  <span className="font-bold text-[#0F172A] block">Office & Counseling Hours:</span>
                  <span>{siteConfig.contact.officeHours}</span>
                </div>

                <div>
                  <span className="font-bold text-[#0F172A] block">Telephone Helpline:</span>
                  <a href={`tel:${siteConfig.contact.phonePrimary}`} className="text-[#1D4ED8] font-bold hover:underline">
                    +91 {siteConfig.contact.phonePrimary}
                  </a>
                </div>

                <div>
                  <span className="font-bold text-[#0F172A] block">WhatsApp Enquiries:</span>
                  <a href={`https://wa.me/91${siteConfig.contact.whatsapp}`} className="text-[#059669] font-bold hover:underline">
                    +91 {siteConfig.contact.whatsapp}
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Button href="/contact" variant="primary" size="default" className="w-full justify-center">
                  <span>Open Contact & Enquiry Form</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Google Maps Viewport */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#E6E2D8] shadow-sm bg-white h-96 relative">
              <iframe
                title="Odisha Competitive Institute Location Map"
                src={siteConfig.address.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
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

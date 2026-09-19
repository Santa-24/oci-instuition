'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { examCategories, type ExamCategory } from '@/data/exams'
import { siteConfig } from '@/data/site'
import { supabase } from '@/lib/supabase/client'

// Rich academic prospectus metadata
const PROSPECTUS_METADATA: Record<
  string,
  {
    duration: string
    curriculum: string[]
    eligibility: string
    pattern: string
  }
> = {
  ssc: {
    duration: '6 to 9 Months Comprehensive',
    curriculum: [
      'Quantitative Aptitude (Arithmetic + Advanced Maths)',
      'General Intelligence & Reasoning (Verbal + Non-Verbal)',
      'English Language & Comprehension',
      'General Awareness & Static GK',
    ],
    eligibility: 'Graduate / 10+2 / Matriculation depending on post',
    pattern: 'Tier-I & Tier-II Computer Based Examination (CBT)',
  },
  'odisha-govt': {
    duration: '6 to 8 Months Focused',
    curriculum: [
      'Odia Language & Grammar Mastery',
      'Arithmetic & Numerical Ability',
      'Reasoning & Analytical Ability',
      'Odisha History, Geography & Special GK',
      'Basic Computer Skills & Practical Test',
    ],
    eligibility: 'Graduate / +2 depending on recruitment board',
    pattern: 'Preliminary + Main Written Examination + Skill Test',
  },
  railway: {
    duration: '5 to 7 Months Intensive',
    curriculum: [
      'Mathematics & Fast Calculation Shortcuts',
      'General Intelligence & Reasoning',
      'General Science (Physics, Chemistry, Life Sciences)',
      'General Awareness on Current Affairs',
    ],
    eligibility: '10th / 12th / Diploma / Graduate',
    pattern: 'CBT Stage-1 & CBT Stage-2 + Aptitude/Typing where applicable',
  },
  banking: {
    duration: '6 to 9 Months Rigorous',
    curriculum: [
      'Data Interpretation & High-Speed Quantitative Aptitude',
      'Complex Puzzles, Seating Arrangements & Logical Reasoning',
      'English Language, Vocabulary & Cloze Tests',
      'Banking Awareness, Economy & Financial Current Affairs',
    ],
    eligibility: 'Graduate in any discipline',
    pattern: 'Prelims CBT + Mains CBT + Descriptive Test / Interview',
  },
  defence: {
    duration: '4 to 6 Months Groundwork',
    curriculum: [
      'General Studies & National Current Affairs',
      'Elementary Mathematics & Numerical Reasoning',
      'General English & Comprehension',
      'Physical Efficiency Standards Orientation',
    ],
    eligibility: 'Matriculation / 10+2 / Graduation',
    pattern: 'Written Examination + Physical Measurement & PET',
  },
  teaching: {
    duration: '5 to 7 Months Pedagogical',
    curriculum: [
      'Child Development & Educational Pedagogy',
      'Language-I (Odia) & Language-II (English)',
      'Mathematics & Science / Social Studies Specialization',
      'Odisha School Education Regulatory Standards',
    ],
    eligibility: 'CT / D.El.Ed / B.Ed. Qualified or Appearing',
    pattern: 'Paper-I & Paper-II Multiple Choice Objective Evaluation',
  },
  'other-govt': {
    duration: '6 Months Foundation',
    curriculum: [
      'General Mental Ability & Logical Deduction',
      'Basic Numerical Ability & Data Analysis',
      'English & Vernacular Grammar Essentials',
      'General Knowledge & Current Events',
    ],
    eligibility: 'Graduation / Higher Secondary',
    pattern: 'Single or Multi-Tier Written Tests',
  },
}

export default function ExamsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [expandedExam, setExpandedExam] = useState<string | null>(null)
  const [categories, setCategories] = useState<ExamCategory[]>(examCategories)
  const [hasLiveDbSync, setHasLiveDbSync] = useState(false)

  useEffect(() => {
    async function loadLiveCourses() {
      try {
        const { data: dbCourses, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (error || !dbCourses || dbCourses.length === 0) return

        setHasLiveDbSync(true)
        const updated = [...examCategories]

        dbCourses.forEach((crs: any) => {
          const catName = (crs.category || '').toLowerCase()
          let targetCatId = 'other-govt'
          if (catName.includes('ssc') || catName.includes('central')) targetCatId = 'ssc'
          else if (catName.includes('odisha') || catName.includes('state') || catName.includes('ossc')) targetCatId = 'odisha-govt'
          else if (catName.includes('rail')) targetCatId = 'railway'
          else if (catName.includes('bank')) targetCatId = 'banking'
          else if (catName.includes('teach')) targetCatId = 'teaching'
          else if (catName.includes('defence') || catName.includes('police')) targetCatId = 'defence'

          const catIdx = updated.findIndex((c) => c.id === targetCatId)
          if (catIdx >= 0) {
            const courseLabel = crs.code ? `${crs.name} (${crs.code})` : crs.name
            if (!updated[catIdx].examsList.includes(courseLabel) && !updated[catIdx].examsList.includes(crs.name)) {
              updated[catIdx] = {
                ...updated[catIdx],
                examsList: [courseLabel, ...updated[catIdx].examsList],
              }
            }
          } else {
            // Add as a new custom discipline card
            updated.push({
              id: crs.id,
              title: crs.name,
              slug: crs.code ? crs.code.toLowerCase() : crs.id,
              badgeText: crs.category || 'Specialized Batch',
              description: crs.description || 'Specialized coaching batch at Odisha Competitive Institute.',
              examsList: [crs.name],
              iconName: 'Award',
              featured: true,
            })
          }
        })

        setCategories(updated)
      } catch (e) {
        console.warn('Live courses fetch note:', e)
      }
    }
    loadLiveCourses()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedExam(expandedExam === id ? null : id)
  }

  const filteredExams = categories.filter((cat) => {
    const matchesFilter = selectedFilter === 'all' || cat.id === selectedFilter
    const matchesSearch =
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.examsList.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow={hasLiveDbSync ? "ACADEMIC PROSPECTUS • LIVE DATABASE SYNC" : "ACADEMIC PROSPECTUS"}
        title="Examinations & Syllabus Architecture"
        description="Comprehensive coaching programs structured specifically around the official notifications, syllabus weightages, and marking schemes of premier recruitment boards."
        breadcrumbLabel="Examinations"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & DISCIPLINE ANCHOR BAR
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E6E2D8] py-6 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exam (e.g. OSSC, CGL, NTPC)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] text-[#0F172A]"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Disciplines' },
                { id: 'odisha-govt', label: 'Odisha Govt' },
                { id: 'ssc', label: 'SSC' },
                { id: 'railway', label: 'Railways' },
                { id: 'banking', label: 'Banking' },
                { id: 'teaching', label: 'Teaching' },
                { id: 'defence', label: 'Defence' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedFilter === chip.id
                      ? 'bg-[#0C192E] text-white shadow-xs'
                      : 'bg-[#F3F0EA] text-[#475569] hover:bg-[#E6E2D8]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DETAILED PROSPECTUS ACCORDIONS & DOSSIERS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {filteredExams.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[#E6E2D8] text-center space-y-3">
              <p className="text-base font-semibold text-[#0F172A]">No examinations found matching your query.</p>
              <p className="text-xs text-[#64748B]">Try clearing your search term or select &quot;All Disciplines&quot;.</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedFilter('all') }} variant="secondary" size="sm">
                Reset Search
              </Button>
            </div>
          ) : (
            filteredExams.map((cat) => {
              const meta = PROSPECTUS_METADATA[cat.id] || {
                duration: '6 Months Cycle',
                curriculum: ['Arithmetic', 'Reasoning', 'General Awareness', 'Language'],
                eligibility: 'Graduate / Higher Secondary',
                pattern: 'CBT Written Examination',
              }
              const isExpanded = expandedExam === cat.id

              return (
                <div
                  key={cat.id}
                  id={cat.id}
                  className="rounded-2xl bg-white border border-[#E6E2D8] shadow-sm overflow-hidden transition-all"
                >
                  {/* Prospectus Main Header Banner */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold uppercase tracking-wider">
                            {cat.badgeText}
                          </span>
                          <span className="text-xs text-[#64748B]">• Bhadrak Classroom Batch Available</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
                          {cat.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          href={`/contact?exam=${encodeURIComponent(cat.title)}`}
                          variant="primary"
                          size="sm"
                          className="bg-[#1D4ED8] text-white hover:bg-[#1E40AF]"
                        >
                          <span>Enquire for Batch</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>

                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="p-2.5 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F3F0EA] transition-colors cursor-pointer"
                          aria-expanded={isExpanded}
                          aria-label={`Toggle syllabus details for ${cat.title}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#475569] leading-relaxed max-w-4xl">
                      {cat.description}
                    </p>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F3F0EA] text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                        <span className="text-[#64748B] block text-[11px]">Recommended Duration</span>
                        <span className="font-bold text-[#0F172A]">{meta.duration}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                        <span className="text-[#64748B] block text-[11px]">Minimum Eligibility</span>
                        <span className="font-bold text-[#0F172A] truncate block">{meta.eligibility}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                        <span className="text-[#64748B] block text-[11px]">Exam Pattern</span>
                        <span className="font-bold text-[#0F172A] truncate block">{meta.pattern}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                        <span className="text-[#64748B] block text-[11px]">Coaching Delivery</span>
                        <span className="font-bold text-[#0F172A]">Classroom + CBT App</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Syllabus & Posts Drawer */}
                  {isExpanded && (
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 bg-[#FAF8F5] border-t border-[#E6E2D8] grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Covered Posts */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] block">
                          Included Recruitment Posts:
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-[#334155]">
                          {cat.examsList.map((post, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#E6E2D8]">
                              <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                              <span>{post}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Core Subject Curriculum */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] block">
                          Comprehensive Syllabus Modules:
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-[#334155]">
                          {meta.curriculum.map((subj, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#E6E2D8]">
                              <BookOpen className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                              <span>{subj}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2">
                          <Button
                            href={`/contact?exam=${encodeURIComponent(cat.title)}`}
                            variant="amber"
                            size="sm"
                            className="w-full justify-center"
                          >
                            <span>Schedule Batch Counseling for {cat.title}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SYLLABUS INTEGRITY STATEMENT
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-[#F3F0EA] border-t border-[#E6E2D8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Note: Examination syllabi, eligibility norms, and reservation policies are aligned with official gazette notifications issued by the Staff Selection Commission (SSC), Odisha Staff Selection Commission (OSSC), Railway Recruitment Boards (RRB), and relevant recruitment authorities.
          </p>
          <div className="text-xs font-bold text-[#0F172A]">
            Admissions Helpline: +91 {siteConfig.contact.phonePrimary} • Nayabazar, Bhadrak
          </div>
        </div>
      </section>
    </div>
  )
}

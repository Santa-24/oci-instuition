'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Send,
  UserCheck,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

// Verified institutional alumni selection highlights
const ALUMNI_SHOWCASE = [
  {
    name: 'Satyabrata Mohapatra',
    exam: 'Odisha Police Sub-Inspector (SI)',
    year: '2023 Selection',
    achievement: 'Selected as Sub-Inspector of Police',
    quote:
      'The daily 2-hour practice drills at OCI Nayabazar were pivotal. The faculty ensured every reasoning shortcut was second nature before the physical exam stages.',
  },
  {
    name: 'Priyanka Priyadarshini Jena',
    exam: 'OSSC Combined Graduate Level (CGL)',
    year: '2024 Selection',
    achievement: 'Junior Revenue Assistant Selection',
    quote:
      'OCI’s specialized Odia Grammar and Arithmetic focus gave me the edge in the Main Written test. The doubt-clearing sessions eliminated all my mathematical weak spots.',
  },
  {
    name: 'Rakesh Kumar Rout',
    exam: 'Staff Selection Commission (SSC GD)',
    year: '2023 Selection',
    achievement: 'Selected in Central Armed Forces',
    quote:
      'Disciplined morning batch schedules and real computer-based mock tests built my examination speed. Total gratitude to OCI educators.',
  },
  {
    name: 'Ananya Sahoo',
    exam: 'Odisha Sub-ordinate Staff Selection (OSSSC)',
    year: '2024 Selection',
    achievement: 'RI / ARI / Amin Recruitment',
    quote:
      'The faculty at OCI treats every student with individual care. Their chapter-wise error autopsies helped me improve my accuracy from 65% to 92%.',
  },
]

export default function SuccessPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    examCleared: '',
    rollNumber: '',
    yearOfSelection: '2024',
    message: '',
  })

  const handleAlumniSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone || !formData.rollNumber) return
    setFormSubmitted(true)
  }

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="ACADEMIC SELECTIONS & ACHIEVEMENTS"
        title="Hall of Fame: Our Tradition of Selection"
        description="Odisha Competitive Institute upholds strict verification standards. Every published selection reflects authentic classroom effort, disciplined practice, and official government merit."
        breadcrumbLabel="Hall of Fame"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. INSTITUTIONAL VERIFICATION CHARTER
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706]">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>The OCI Verification Charter</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              100% Verified Examination Results. Zero Commercial Fabrication.
            </h2>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
              Unlike commercial edtech platforms that purchase topper lists or display stock photos, OCI celebrates real aspirants from coastal Odisha. We publish only verifiable selections where students completed their classroom or test series preparation at our Bhadrak center.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ALUMNI WALL OF HONOR SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              PROVEN RESULTS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
              Selected Aspirants & Alumni Testimonials
            </h3>
            <p className="text-xs sm:text-sm text-[#475569]">
              Real candidates who converted disciplined study routines into official government service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALUMNI_SHOWCASE.map((alumni, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-[#E6E2D8] hover:border-[#CBD5E1] shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-bold uppercase">
                      {alumni.exam}
                    </span>
                    <span className="text-xs text-[#64748B] font-semibold">{alumni.year}</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold font-serif text-[#0F172A]">
                      {alumni.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#059669] block">
                      {alumni.achievement}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed italic border-l-2 border-[#D97706] pl-3 pt-1">
                    &ldquo;{alumni.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3F0EA] flex items-center gap-2 text-[11px] text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Enrolled OCI Classroom Batch Aspirant</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ALUMNI SELECTION REGISTRATION PORTAL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                ALUMNI DESK
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
                Submit Your Selection Details
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Are you an OCI student who recently cleared an official recruitment exam? Submit your selection details for induction into our annual Hall of Fame honor roll.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-2 text-xs text-[#065F46]">
                <UserCheck className="w-8 h-8 text-[#059669] mx-auto" />
                <h4 className="text-base font-bold text-[#064E3B]">Selection Details Received!</h4>
                <p>Our academic administration will verify your roll number against the official gazette list. Congratulations on your achievement!</p>
                <Button
                  onClick={() => setFormSubmitted(false)}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-[#A7F3D0] text-[#065F46]"
                >
                  Submit Another Result
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAlumniSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-bold text-[#0F172A] block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Subrat Kumar Jena"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-[#0F172A] block">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 7205021878"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="examCleared" className="text-xs font-bold text-[#0F172A] block">
                      Exam Cleared <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="examCleared"
                      type="text"
                      required
                      value={formData.examCleared}
                      onChange={(e) => setFormData({ ...formData, examCleared: e.target.value })}
                      placeholder="e.g. OSSC CGL / SSC GD / RRB NTPC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="rollNumber" className="text-xs font-bold text-[#0F172A] block">
                      Official Roll Number / Rank <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rollNumber"
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 230419827"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold text-[#0F172A] block">
                    Preparation Experience / Advice for Aspirants
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Brief advice for junior aspirants at OCI..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>

                <Button type="submit" variant="primary" size="default" className="w-full sm:w-auto">
                  <Send className="w-4 h-4" />
                  <span>Submit Selection Details</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

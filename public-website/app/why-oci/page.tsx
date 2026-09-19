import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'
import {
  BrainCircuit,
  Zap,
  Clock,
  TrendingUp,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from 'lucide-react'

export const metadata = {
  title: 'Methodology Dossier | How OCI Prepares Students for Selection',
  description:
    'An evidence-backed breakdown of OCI pedagogical methods: mental math shortcut systems, supervised daily practice routines, and CBT error analytics.',
}

export default function WhyOciPage() {
  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="PEDAGOGICAL DOSSIER"
        title="The OCI Examination Preparation Framework"
        description="An evidence-backed look into our teaching mechanics: why conceptual grounding precedes speed, how daily supervised drills build reflexes, and how CBT analytics eliminate exam anxiety."
        breadcrumbLabel="Methodology"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. CASE STUDY 01: CONCEPT GROUNDING BEFORE FORMULAS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block">
                PRINCIPLE 01
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] tracking-tight">
                Why Blind Formula Memorization Fails Under Pressure
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Standard coaching centers hand students booklets of 500 isolated shortcuts. When recruitment boards like SSC or OSSC alter question phrasing by 10%, students without conceptual clarity freeze.
              </p>
              <div className="p-4 rounded-xl bg-[#F3F0EA] border border-[#E6E2D8] text-xs text-[#334155] space-y-1.5">
                <span className="font-bold text-[#0F172A] block">The OCI Pedagogical Rule:</span>
                <p>Every problem type is derived from primary arithmetic and algebraic fundamentals before time-saving shortcuts are introduced.</p>
              </div>
            </div>

            {/* Visual Case Demonstration */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
                <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                  Pedagogical Comparison
                </span>
                <span className="text-xs text-[#64748B]">Classroom Benchmark</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                  <span className="font-bold text-[#991B1B] block">Generic Coaching Method</span>
                  <p className="text-[#7F1D1D] leading-relaxed">
                    Memorize formula for Profit & Loss with multiple discounts. If variables are inverted in the question, formula fails.
                  </p>
                  <span className="text-[11px] text-[#B91C1C] font-semibold block">Result: High error rate in CBT</span>
                </div>

                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                  <span className="font-bold text-[#065F46] block">OCI Conceptual Method</span>
                  <p className="text-[#064E3B] leading-relaxed">
                    Master fractional multipliers (1/7, 1/8, 1/9) and ratio balancing. Any discount structure solves mentally in 20 seconds.
                  </p>
                  <span className="text-[11px] text-[#047857] font-semibold block">Result: 100% question adaptability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CASE STUDY 02: MENTAL MATH & ELIMINATION SHORTCUTS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block">
                PRINCIPLE 02
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] tracking-tight">
                Calculated Elimination: Saving 40 Seconds Per Problem
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Competitive exams are multiple-choice objective evaluations. In 40% of Quantitative and Reasoning questions, solving the entire problem on scratch paper is a strategic blunder.
              </p>
              <div className="space-y-2 text-xs text-[#334155]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Digital Sum (Modulo-9) verification eliminates 3 of 4 options in 8 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Unit digit & last two digits multiplication for complex interest calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Venn diagram bounding methods for complex multi-statement syllogisms</span>
                </div>
              </div>
            </div>

            {/* Smart Method Showcase Box */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm border-b border-[#E6E2D8] pb-3">
                <Calculator className="w-4 h-4 text-[#D97706]" />
                <span>Classroom Shortcut Case: Digital Sum Technique</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] text-xs font-mono space-y-2">
                <span className="text-[#64748B] block">Problem: 4897 × 6241 = ?</span>
                <p className="text-[#0F172A] font-bold">Options: A) 30,562,177  B) 30,562,157  C) 30,562,167  D) 30,561,177</p>
                <div className="pt-2 border-t border-[#E6E2D8] text-[#D97706] font-sans text-xs font-semibold">
                  OCI Smart Technique: Digital sum of 4897 is 1; Digital sum of 6241 is 4. Product digit sum must be 1 × 4 = 4. Option A digit sum = 4. Solved in 6 seconds without pencil scratch!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CASE STUDY 03: DAILY CLASSROOM & DOUBT ROOM SCHEDULE
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              PRINCIPLE 03
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] tracking-tight">
              A Day at OCI: The Disciplined 3-Hour Cycle
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Every morning and evening batch at our Nayabazar center follows a synchronized 3-hour learning and verification cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Hour 01 – 02
                </span>
                <Clock className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0F172A]">
                Conceptual Lecture
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Faculty-led breakdown of theory, formula derivations, grammatical nuances, and step-by-step problem modeling across targeted exam chapters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  Hour 02 – 03
                </span>
                <FileCheck className="w-4 h-4 text-[#D97706]" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0F172A]">
                Supervised Practice Drill
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                A timed 50-question printed worksheet solved in silent exam conditions. Real-time invigilation trains speed control and pressure management.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E6E2D8] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                  Post-Class Hour
                </span>
                <HelpCircle className="w-4 h-4 text-[#059669]" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#0F172A]">
                Dedicated Doubt Room
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Direct one-on-one session with teachers. Students analyze wrong answers, discuss alternative solving angles, and clear all ambiguities before leaving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CALL TO ACTION DOSSIER
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#0C192E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              EXPERIENCE THE METHOD
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              Attend a Classroom Counseling Session
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
              Visit our Nayabazar center in Bhadrak to review current study sets, meet subject educators, and discuss your competitive preparation schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button href="/contact" variant="amber" size="default">
              <span>Schedule Center Visit</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              href="/exams"
              variant="secondary"
              size="default"
              className="bg-[#15253F] text-white border-[#1E2D4A] hover:bg-[#1E2D4A]"
            >
              <span>Explore Exam Syllabus</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

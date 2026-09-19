import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  Smartphone,
  Clock,
  CheckSquare,
  BarChart2,
  FileText,
  Bell,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react'

export const metadata = {
  title: 'OCI Mobile App | CBT Exam Simulation & Performance Analytics',
  description:
    'Explore the official OCI mobile application: live CBT mock exam engine, detailed question palette, instant accuracy scorecards, and offline study notes.',
}

export default function AppPage() {
  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="DIGITAL LEARNING PLATFORM"
        title="The OCI Mobile Examination Application"
        description="Engineered specifically for competitive aspirants: carry Computer-Based Test (CBT) mock exam series, instant subject accuracy analytics, and offline revision notes on your smartphone."
        breadcrumbLabel="Mobile App"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. WALKTHROUGH 01: THE CBT EXAM SIMULATION ENGINE
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Description Left */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block">
                CORE CAPABILITY 01
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] tracking-tight">
                Authentic Computer-Based Test (CBT) Interface
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Exam hall fear is born from unfamiliarity with the clock and the digital question palette. The OCI app faithfully replicates the testing portals of the Staff Selection Commission (SSC) and Odisha recruitment boards.
              </p>

              <div className="space-y-2.5 text-xs text-[#334155] pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Real-time sectional countdown timers with auto-submit alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Color-coded Question Palette: Answered, Not Answered, Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Exact official negative-marking calculations (0.25 / 0.33 / 0.50 per board)</span>
                </div>
              </div>
            </div>

            {/* Simulated Clean CBT Interface Showcase */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#0C192E] text-white border border-[#1E2D4A] shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold font-serif text-white">OSSC Combined CGL — Mock #06</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-[#15253F] px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span>54:12 Remaining</span>
                </div>
              </div>

              {/* Question Area */}
              <div className="p-4 rounded-xl bg-[#15253F] border border-[#1E2D4A] space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Question 24 of 100</span>
                  <span className="text-emerald-400 font-bold">+1.0 / -0.25 Marks</span>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed">
                  Which article of the Constitution of India provides for the establishment of the State Public Service Commission?
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#CBD5E1]">
                  <div className="p-2 rounded-lg bg-[#0C192E] border border-[#1E2D4A]">A) Article 315</div>
                  <div className="p-2 rounded-lg bg-[#0C192E] border border-[#1E2D4A]">B) Article 324</div>
                  <div className="p-2 rounded-lg bg-[#0C192E] border border-[#1E2D4A]">C) Article 280</div>
                  <div className="p-2 rounded-lg bg-[#0C192E] border border-[#1E2D4A]">D) Article 356</div>
                </div>
              </div>

              {/* Question Palette Preview */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">
                  CBT Palette Status:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  <span className="w-7 h-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center">21</span>
                  <span className="w-7 h-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center">22</span>
                  <span className="w-7 h-7 rounded bg-purple-600 text-white font-bold flex items-center justify-center">23</span>
                  <span className="w-7 h-7 rounded bg-blue-600 text-white font-bold ring-2 ring-white flex items-center justify-center">24</span>
                  <span className="w-7 h-7 rounded bg-[#334155] text-slate-300 flex items-center justify-center">25</span>
                  <span className="w-7 h-7 rounded bg-[#334155] text-slate-300 flex items-center justify-center">26</span>
                  <span className="w-7 h-7 rounded bg-[#334155] text-slate-300 flex items-center justify-center">27</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. WALKTHROUGH 02: INSTANT PERFORMANCE ANALYTICS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Analytics Card Left */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Test Performance Analysis
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  Qualified Cut-off
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                  <span className="text-[#64748B] block text-[11px]">Total Score</span>
                  <span className="text-lg font-bold text-[#0F172A] font-serif">142.5 / 200</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                  <span className="text-[#64748B] block text-[11px]">Accuracy Rate</span>
                  <span className="text-lg font-bold text-emerald-600 font-serif">86.2%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
                  <span className="text-[#64748B] block text-[11px]">Avg Time/Q</span>
                  <span className="text-lg font-bold text-[#1D4ED8] font-serif">42 Secs</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[#475569]">
                    <span>Reasoning & Mental Ability</span>
                    <span className="font-bold text-[#0F172A]">94% Accuracy</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[#475569]">
                    <span>Quantitative Aptitude</span>
                    <span className="font-bold text-[#0F172A]">82% Accuracy</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[82%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[#475569]">
                    <span>Odia Language & Grammar</span>
                    <span className="font-bold text-[#0F172A]">88% Accuracy</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[88%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Right */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block">
                CORE CAPABILITY 02
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F172A] tracking-tight">
                Forensic Diagnostics: Knowing Exactly Where Marks Are Lost
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Taking 50 mock tests without error analysis leads to zero improvement. The OCI engine breaks down every submission across subject accuracy, time wasted on unattempted questions, and negative marking leakages.
              </p>

              <div className="space-y-2 text-xs text-[#334155]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span>Instant chapter-wise accuracy breakdowns highlighting high-priority revision topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span>Time-management comparison against top 5% peer percentiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span>Comprehensive step-by-step solution explanations for every question</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. DOWNLOAD GATEWAY TERMINAL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#0C192E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              OFFICIAL APPLICATION DISTRIBUTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              Get OCI Mobile v1.0.0 on Android
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
              Download the official Android APK directly from our verified Supabase CDN storage. No third-party stores required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button href="/download" variant="amber" size="default">
              <Download className="w-4 h-4" />
              <span>Go to Download Terminal</span>
            </Button>

            <Button
              href="/contact"
              variant="secondary"
              size="default"
              className="bg-[#15253F] text-white border-[#1E2D4A] hover:bg-[#1E2D4A]"
            >
              <span>Student Support</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

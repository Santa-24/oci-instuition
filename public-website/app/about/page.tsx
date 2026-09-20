import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { OciLogo } from '@/components/oci-logo'
import { siteConfig } from '@/data/site'
import {
  Calendar,
  CheckCircle2,
  BookOpen,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react'

const MILESTONES = [
  {
    year: '2017',
    date: '17 January 2017',
    title: 'Inauguration at Nayabazar, Bhadrak',
    description:
      'Odisha Competitive Institute commences operations near Old Rajghat Bridge, Bhadrak, with its inaugural batch for SSC and Odisha State competitive examinations.',
  },
  {
    year: '2019',
    date: 'August 2019',
    title: 'Standardized Mock Test Series',
    description:
      'Introduction of daily section-wise speed drills and weekly full-length mock tests aligned with evolving OSSC, OSSSC, and Railway CBT patterns.',
  },
  {
    year: '2022',
    date: 'March 2022',
    title: 'Classroom & Doubt-Room Expansion',
    description:
      'Modernization of learning infrastructure with dedicated 1-hour post-class doubt-clearing rooms and an expanded offline competitive reference library.',
  },
  {
    year: '2026',
    date: 'September 2026',
    title: 'Official Launch of OCI Mobile CBT App (v1.0.0)',
    description:
      'Release of the official Android application, bringing native CBT test series, instant accuracy analysis, and offline study notes directly to students across Odisha.',
  },
]

const CORE_TENETS = [
  {
    number: '01',
    name: 'Conceptual Grounding Before Shortcuts',
    description:
      'We believe competitive examination speed is meaningless without foundational depth. Fundamental theory is thoroughly mastered before introducing rapid calculation techniques.',
  },
  {
    number: '02',
    name: 'Daily Supervised Practice',
    description:
      'True examination stamina is forged through regular, structured repetition rather than last-minute cramming. Every lecture is followed by immediate practice sets.',
  },
  {
    number: '03',
    name: 'Accessible Faculty Mentorship',
    description:
      'No student is left behind with unanswered questions. Faculty maintain open doubt-clearing sessions every afternoon to deconstruct mistakes and rebuild confidence.',
  },
  {
    number: '04',
    name: 'Rigorous CBT Exam Simulation',
    description:
      'Modern examinations are fought on computer screens against clocks. We condition students to manage sectional time pressure and negative marking with precision.',
  },
]

export const metadata = {
  title: 'About OCI | Institutional Heritage & Leadership',
  description:
    'Discover the history, educational philosophy, leadership address, and bilingual vision of Odisha Competitive Institute (OCI), founded in Bhadrak on 17 January 2017.',
}

export default function AboutPage() {
  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="INSTITUTIONAL HERITAGE"
        title="Built With Purpose. Dedicated to Student Achievement."
        description="Founded on 17 January 2017 in Nayabazar, Bhadrak, OCI has maintained an unyielding commitment to structured, accessible, and concept-grounded competitive coaching."
        breadcrumbLabel="About OCI"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. THE DIRECTOR'S ADDRESS (Authoritative Letterhead)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 lg:p-16 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-8 relative">
            {/* Letterhead Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D8] pb-6">
              <div className="flex items-center gap-3.5">
                <OciLogo size={48} />
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] font-serif leading-tight">
                    Odisha Competitive Institute
                  </h2>
                  <span className="text-xs text-[#D97706] font-semibold tracking-wide uppercase block">
                    Office of the Director • Nayabazar, Bhadrak
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#64748B] font-medium text-left sm:text-right">
                <span>Official Institutional Address</span>
                <span className="block text-[#0F172A] font-bold">Estd. 17 January 2017</span>
              </div>
            </div>

            {/* Salutation */}
            <p className="text-lg sm:text-xl font-serif text-[#0F172A] font-bold italic">
              Dear Aspirants and Well-Wishers,
            </p>

            {/* Full 3-Paragraph Letter Content */}
            <div className="space-y-5 text-sm sm:text-base text-[#334155] leading-relaxed">
              <p>
                When Odisha Competitive Institute opened its doors in Nayabazar, Bhadrak in January 2017, it was founded with a singular conviction: that competitive examination coaching must be grounded in conceptual transparency, disciplined classroom accountability, and genuine student mentorship rather than commercial salesmanship. Over the past nine years, we have worked alongside thousands of diligent aspirants preparing for SSC, Odisha State Government, Railway, Banking, and Teaching recruitments.
              </p>

              <p>
                Competitive examinations in India test much more than syllabus memory—they test mental resilience, speed under pressure, and ruthless calculation accuracy. We teach our students that shortcuts without conceptual grounding invariably collapse under unfamiliar question patterns. At OCI, every formula is understood before it is memorized, every mock test is forensically reviewed for mistakes, and every student receives the individual attention necessary to convert persistent effort into official merit.
              </p>

              <p>
                As we expand our academic resources with our official mobile CBT examination platform, our core commitment remains unchanged: our physical classroom at Nayabazar remains an open sanctuary for honest learning, dedicated doubt resolution, and relentless preparation. We invite every serious aspirant to step into our institute, experience our teaching framework, and take the definitive first step toward a respected government career.
              </p>
            </div>

            {/* Signature & Seal Sign-off */}
            <div className="pt-8 border-t border-[#E6E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-base font-serif font-bold text-[#0F172A] block">
                  Director, Academic Council
                </span>
                <span className="text-xs text-[#64748B] block">
                  Odisha Competitive Institute, Bhadrak
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E6E2D8] text-xs font-semibold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                <span>Verified Institutional Mandate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BILINGUAL VISION SHOWCASE (Odia & English Dual Pane)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              INSTITUTIONAL MANDATE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
              Our Vision for Odisha&apos;s Youth
            </h2>
            <p className="text-sm sm:text-base text-[#475569]">
              Excellence expressed in our regional mother tongue and national academic language.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English Vision */}
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E6E2D8] space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-widest text-[#1D4ED8] uppercase block">
                  ENGLISH VISION STATEMENT
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#0F172A] leading-relaxed italic">
                  &ldquo;To empower competitive exam aspirants with strong concepts, systematic guidance, and exam-oriented preparation—building confidence, discipline, and success in every student.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#F3F0EA] text-xs text-[#64748B]">
                Academic Foundation • Odisha Competitive Institute
              </div>
            </div>

            {/* Odia Vision */}
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E6E2D8] space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block">
                  ଓଡ଼ିଆ ଭିଜନ ବୟାନ (ODIA VISION)
                </span>
                <p className="text-lg sm:text-xl font-serif text-[#0F172A] leading-relaxed">
                  &ldquo;ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ଦେଉଥିବା ଛାତ୍ରଛାତ୍ରୀମାନଙ୍କୁ ସୁଦୃଢ଼ ମୌଳିକ ଜ୍ଞାନ, କ୍ରମାନ୍ୱୟ ମାର୍ଗଦର୍ଶନ ଏବଂ ପରୀକ୍ଷା-ଉପଯୋଗୀ ପ୍ରସ୍ତୁତି ମାଧ୍ୟମରେ ସଶକ୍ତ କରିବା—ପ୍ରତ୍ୟେକ ଛାତ୍ରଛାତ୍ରୀଙ୍କଠାରେ ଆତ୍ମବିଶ୍ୱାସ, ଅନୁଶାସନ ଏବଂ ସଫଳତା ସୃଷ୍ଟି କରିବା।&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#F3F0EA] text-xs text-[#64748B]">
                ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ପ୍ରସ୍ତୁତିର ବିଶ୍ୱସନୀୟ କେନ୍ଦ୍ର
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. EXPANDED CHRONOLOGICAL MILESTONES (2017–2026)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-[#E6E2D8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              OUR CHRONICLE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
              A Decade of Dedicated Guidance
            </h2>
            <p className="text-[#475569] text-base leading-relaxed">
              Trace OCI&apos;s continuous progression from its founding classroom in 2017 to becoming coastal Odisha&apos;s leading competitive coaching benchmark.
            </p>
          </div>

          {/* Chronological Milestone List */}
          <div className="space-y-6">
            {MILESTONES.map((m, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E2D8] hover:border-[#CBD5E1] transition-all grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start"
              >
                <div className="md:col-span-3 space-y-1">
                  <span className="text-2xl font-extrabold font-serif text-[#0F172A] block">
                    {m.year}
                  </span>
                  <span className="text-xs font-semibold text-[#D97706] tracking-wide block">
                    {m.date}
                  </span>
                </div>

                <div className="md:col-span-9 space-y-2">
                  <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CORE PEDAGOGICAL TENETS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F3F0EA] border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              OUR TEACHING ETHOS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-serif tracking-tight">
              Four Uncompromising Academic Tenets
            </h2>
            <p className="text-[#475569] text-base leading-relaxed">
              Principles that govern our faculty selection, syllabus scheduling, and daily classroom conduct.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_TENETS.map((tenet, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white border border-[#E6E2D8] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold font-serif text-[#D97706]">
                    {tenet.number}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-[#1D4ED8]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                  {tenet.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {tenet.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CONTEXTUAL NEXT STEPS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0C192E] text-white border border-[#1E2D4A] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                DISCOVER OUR COURSES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
                Review the Complete Academic Prospectus
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
                Explore our syllabus structures, batch timings, and coaching methodologies for SSC, State Govt, Railways, Banking, and Teaching recruitments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button href="/exams" variant="amber" size="default">
                <span>View Prospectus</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                href="/contact"
                variant="secondary"
                size="default"
                className="bg-[#15253F] text-white border-[#1E2D4A] hover:bg-[#1E2D4A]"
              >
                <span>Visit Nayabazar Center</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

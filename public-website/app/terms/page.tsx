import { PageHeader } from '@/components/page-header'
import { siteConfig } from '@/data/site'

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for Odisha Competitive Institute (OCI) website and services.',
}

export default function TermsPage() {
  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      <PageHeader
        eyebrow="LEGAL COMPLIANCE"
        title="Terms & Conditions"
        description="General terms and institutional conditions governing enrollment, study materials, digital CBT services, and center attendance at Odisha Competitive Institute."
        breadcrumbLabel="Terms & Conditions"
      />

      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-8 text-sm sm:text-base text-[#334155] leading-relaxed">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              TERMS OVERVIEW
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the website, enrolling in classroom coaching, or using the OCI Mobile Application, you agree to comply with the academic guidelines and terms established by Odisha Competitive Institute (OCI), Nayabazar, Bhadrak, Odisha.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              2. Intellectual Property & Study Materials
            </h2>
            <p>
              All curriculum documents, lecture notes, CBT mock examination question banks, shortcut techniques, and official logos are the intellectual property of OCI. Reproduction, unauthorized distribution, or commercial resale of OCI study materials is strictly prohibited under Indian copyright law.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              3. Examination Notifications & Syllabus Updates
            </h2>
            <p>
              While OCI updates its course syllabus in alignment with notifications from SSC, OSSC, OSSSC, RRB, and state recruitment bodies, students must independently verify official examination dates, admit card releases, and eligibility criteria from government gazettes.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              4. Center Inquiries
            </h2>
            <p>
              For inquiries regarding enrollment policies, classroom batch transfers, or mobile application access, please visit our Nayabazar center or contact us at{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-[#1D4ED8] font-bold underline">
                {siteConfig.contact.email}
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

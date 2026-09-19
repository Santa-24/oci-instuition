import { PageHeader } from '@/components/page-header'
import { siteConfig } from '@/data/site'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Odisha Competitive Institute (OCI) website and services.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      <PageHeader
        eyebrow="LEGAL COMPLIANCE"
        title="Privacy Policy"
        description="Odisha Competitive Institute (OCI) is committed to protecting the privacy, personal data, and confidential information of students, guardians, and visitors."
        breadcrumbLabel="Privacy Policy"
      />

      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-8 text-sm sm:text-base text-[#334155] leading-relaxed">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              POLICY OVERVIEW
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              1. Information Collection & Use
            </h2>
            <p>
              When you submit an admission enquiry, contact our office, or register on the OCI Mobile CBT Application, we collect relevant personal details including your full name, mobile telephone number, email address, and examination category of interest. This data is utilized solely for academic counseling, course scheduling, and sharing official examination notifications.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              2. Student Academic Performance Data
            </h2>
            <p>
              Test scores, accuracy analytics, and question attempt histories recorded through the OCI Mobile application or center practice sets are stored securely to generate personalized progress reports. We do not sell, rent, or monetize student testing data with commercial advertisers or third-party marketing companies.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              3. Data Security & Storage
            </h2>
            <p>
              All digital communications and cloud database interactions are secured using industry-standard transport layer encryption (TLS/HTTPS). Access to student contact lists is strictly restricted to authorized administrative personnel at our Bhadrak headquarters.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A]">
              4. Inquiries & Contact
            </h2>
            <p>
              If you have any questions or data requests regarding this Privacy Policy, please write to our administrative office at{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-[#1D4ED8] font-bold underline">
                {siteConfig.contact.email}
              </a>{' '}
              or visit our center in Nayabazar, Bhadrak, Odisha — 756100.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

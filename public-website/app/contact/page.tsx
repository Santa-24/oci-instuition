'use client'

import { useState } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'
import { examCategories } from '@/data/exams'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    examInterested: '',
    message: '',
  })

  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone) return

    setFormState('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormState('success')
        setFormData({ fullName: '', phone: '', email: '', examInterested: '', message: '' })
      } else {
        setFormState('error')
      }
    } catch (err) {
      setFormState('error')
    }
  }

  return (
    <div className="space-y-0 bg-[#FAF8F5]">
      {/* 1. EDITORIAL PAGE HEADER */}
      <PageHeader
        eyebrow="ADMISSIONS & INQUIRIES"
        title="Connect With OCI Admissions"
        description="Schedule a classroom counseling visit, discuss batch schedules, or inquire about course fees and test series. Our admissions desk in Nayabazar is open 7 days a week."
        breadcrumbLabel="Contact"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. TWO-COLUMN UTILITY LAYOUT (Details Left, Form Right)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Direct Contact Essentials (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  DIRECT ACCESS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
                  Institute Headquarters
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Located near Old Rajghat Bridge in Nayabazar, Bhadrak. Reach out directly by phone, WhatsApp, or drop by during office hours.
                </p>
              </div>

              {/* Contact Information Cards */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-white border border-[#E6E2D8] flex items-start gap-3.5 shadow-xs">
                  <MapPin className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">Physical Center Address:</span>
                    <span className="text-xs leading-relaxed text-[#475569] block mt-0.5">
                      {siteConfig.locationFull}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E2D8] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <Phone className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Admissions Telephone:</span>
                      <a
                        href={`tel:${siteConfig.contact.phonePrimary}`}
                        className="text-xs font-bold text-[#1D4ED8] hover:underline"
                      >
                        +91 {siteConfig.contact.phonePrimary}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`tel:${siteConfig.contact.phonePrimary}`}
                    className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold hover:bg-[#DBEAFE] transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E2D8] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <MessageCircle className="w-5 h-5 text-[#059669] shrink-0" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">WhatsApp Admissions:</span>
                      <a
                        href={`https://wa.me/91${siteConfig.contact.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#059669] hover:underline"
                      >
                        +91 {siteConfig.contact.whatsapp}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/91${siteConfig.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] text-xs font-bold hover:bg-[#D1FAE5] transition-colors"
                  >
                    Chat
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E2D8] flex items-center gap-3.5 shadow-xs">
                  <Mail className="w-5 h-5 text-[#D97706] shrink-0" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">Official Email Address:</span>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-xs text-[#1D4ED8] hover:underline"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E2D8] flex items-center gap-3.5 shadow-xs">
                  <Clock className="w-5 h-5 text-[#64748B] shrink-0" />
                  <div>
                    <span className="font-bold text-[#0F172A] block">Admissions Desk Hours:</span>
                    <span className="text-xs text-[#475569]">
                      {siteConfig.contact.officeHours}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Streamlined Enquiry Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#0F172A]">
                    Send an Admission Enquiry
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1">
                    Fill out the form below and an OCI academic representative will get in touch with complete batch schedules and course materials.
                  </p>
                </div>

                {formState === 'success' ? (
                  <div className="p-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
                    <h3 className="text-xl font-bold text-[#064E3B] font-serif">Enquiry Submitted Successfully!</h3>
                    <p className="text-xs sm:text-sm text-[#065F46] max-w-sm mx-auto">
                      Thank you for contacting Odisha Competitive Institute. Our academic counselor will call you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setFormState('idle')}
                      variant="outline"
                      size="sm"
                      className="mt-4 border-[#A7F3D0] text-[#065F46]"
                    >
                      Submit Another Enquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formState === 'error' && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Failed to submit enquiry. Please call us directly at +91 {siteConfig.contact.phonePrimary}.</span>
                      </div>
                    )}

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
                        placeholder="Enter your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-bold text-[#0F172A] block">
                          Phone Number <span className="text-red-500">*</span>
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

                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-[#0F172A] block">
                          Email Address (Optional)
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="examInterested" className="text-xs font-bold text-[#0F172A] block">
                        Target Examination Category
                      </label>
                      <select
                        id="examInterested"
                        value={formData.examInterested}
                        onChange={(e) => setFormData({ ...formData, examInterested: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      >
                        <option value="">Select Examination</option>
                        {examCategories.map((c) => (
                          <option key={c.id} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-xs font-bold text-[#0F172A] block">
                        Your Questions / Specific Batch Queries
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Inquire about morning/evening timings, study material, or fees..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#FAF8F5] focus:bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={formState === 'submitting'}
                      variant="primary"
                      size="default"
                      className="w-full justify-center"
                    >
                      {formState === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Admission Enquiry</span>
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. FULL-WIDTH PROMINENT GOOGLE MAPS EMBED
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F3F0EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                CENTER LOCATION
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#0F172A]">
                Find Us in Nayabazar, Bhadrak
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                Near Old Rajghat Bridge, Bhadrak, Odisha — 756100
              </p>
            </div>

            <Button
              href={`https://www.google.com/maps/search/?api=1&query=${siteConfig.address.coordinates.lat},${siteConfig.address.coordinates.lng}`}
              target="_blank"
              variant="dark"
              size="sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </Button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#E6E2D8] h-96 shadow-sm bg-white relative">
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
      </section>
    </div>
  )
}

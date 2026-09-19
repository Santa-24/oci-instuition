'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, ExternalLink, ArrowRight, ShieldCheck, Download, MessageCircle, Cookie } from 'lucide-react'
import { OciLogo } from '@/components/oci-logo'
import { siteConfig } from '@/data/site'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0C192E] text-[#94A3B8] pt-16 pb-12 border-t border-[#1E2D4A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1E2D4A]">
          {/* Column 1: Institutional Authority & Location (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <OciLogo size={46} />
              <div>
                <span className="font-extrabold text-white tracking-tight text-lg block leading-snug">
                  Odisha Competitive Institute
                </span>
                <span className="text-[#D97706] text-xs font-semibold tracking-wide uppercase block">
                  Bhadrak, Odisha • Estd. 17 Jan 2017
                </span>
              </div>
            </div>

            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-sm pt-1">
              Odisha&apos;s premier classroom and digital coaching institute dedicated to rigorous concept-grounding, disciplined test series, and competitive excellence for government aspirants.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 text-[#CBD5E1]">
                <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span className="leading-snug">{siteConfig.locationFull}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#CBD5E1]">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Admissions: </span>
                <a href={`tel:${siteConfig.contact.phonePrimary}`} className="text-white font-semibold hover:underline">
                  +91 {siteConfig.contact.phonePrimary}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#CBD5E1]">
                <MessageCircle className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>WhatsApp: </span>
                <a href={`https://wa.me/91${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:underline">
                  +91 {siteConfig.contact.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#CBD5E1]">
                <Mail className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="text-white hover:underline">
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Examination Disciplines (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#1E2D4A] pb-2">
              Examination Disciplines
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/exams#ssc" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Staff Selection Commission (SSC)</span>
                </Link>
              </li>
              <li>
                <Link href="/exams#odisha-govt" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Odisha Govt (OSSC, OSSSC, Police)</span>
                </Link>
              </li>
              <li>
                <Link href="/exams#railway" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Railway Recruitment (RRB NTPC, Gr. D)</span>
                </Link>
              </li>
              <li>
                <Link href="/exams#banking" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Banking & Finance (IBPS, SBI)</span>
                </Link>
              </li>
              <li>
                <Link href="/exams#teaching" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Teaching (CT, B.Ed, OTET, OSSTET)</span>
                </Link>
              </li>
              <li>
                <Link href="/exams#defence" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#D97706]" />
                  <span>Defence & Uniform Services</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Directory (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#1E2D4A] pb-2">
              Directory
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Institute
                </Link>
              </li>
              <li>
                <Link href="/why-oci" className="hover:text-white transition-colors">
                  Methodology Dossier
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-white transition-colors">
                  Academic Prospectus
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Mobile Application
                </Link>
              </li>
              <li>
                <Link href="/success" className="hover:text-white transition-colors">
                  Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Admissions & Center Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Student Resources & Official Channels (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#1E2D4A] pb-2">
              Student Resources & Connect
            </h3>

            <div className="p-3.5 rounded-xl bg-[#15253F] border border-[#1E2D4A] space-y-2">
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Download className="w-4 h-4 text-[#F59E0B]" />
                <span>Official Android APK v1.0.0</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Offline study notes, daily CBT mock tests & institute notices on your phone.
              </p>
              <Link
                href="/download"
                className="inline-block text-xs font-bold text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
              >
                Go to Download Terminal →
              </Link>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-[#64748B] block mb-2 font-medium">Official Social Channels:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#15253F] hover:bg-[#1E2D4A] text-white flex items-center justify-between transition-colors"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 text-[#64748B]" />
                </a>
                <a
                  href={siteConfig.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#15253F] hover:bg-[#1E2D4A] text-white flex items-center justify-between transition-colors"
                >
                  <span>Telegram</span>
                  <ExternalLink className="w-3 h-3 text-[#64748B]" />
                </a>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#15253F] hover:bg-[#1E2D4A] text-white flex items-center justify-between transition-colors"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-[#64748B]" />
                </a>
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#15253F] hover:bg-[#1E2D4A] text-white flex items-center justify-between transition-colors"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 text-[#64748B]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar: Bilingual Recognition & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {currentYear} Odisha Competitive Institute (OCI). All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#94A3B8] font-serif italic">
              ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷା ପ୍ରସ୍ତୁତିର ବିଶ୍ୱସନୀୟ ଅନୁଷ୍ଠାନ
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('openCookieBanner'))
                }
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-left"
            >
              <Cookie className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Cookie Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { Phone, MessageCircle, Download } from 'lucide-react'

export function MobileQuickActionBar() {
  return (
    <aside
      aria-label="Quick Contact and Download Actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E2D8] px-3 py-2 shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        <a
          href="tel:7205021878"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-white border border-[#E6E2D8] text-[#0F172A] hover:bg-[#F3F0EA] transition-colors min-h-[44px]"
        >
          <Phone className="w-4 h-4 text-[#1D4ED8]" />
          <span className="text-[11px] font-bold mt-0.5">Call Office</span>
        </a>

        <a
          href="https://wa.me/917655004403?text=Hello%20OCI%20Admissions%2C%20I%20want%20to%20enquire%20about%20upcoming%20batches."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] transition-colors min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 text-[#059669]" />
          <span className="text-[11px] font-bold mt-0.5">WhatsApp</span>
        </a>

        <Link
          href="/download"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#0C192E] text-white hover:bg-[#15253F] transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[11px] font-bold mt-0.5">Get APK v1.0</span>
        </Link>
      </div>
    </aside>
  )
}

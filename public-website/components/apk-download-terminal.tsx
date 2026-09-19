'use client'

import { useState } from 'react'
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Smartphone,
  Sparkles,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApkTerminalProps {
  release: {
    latestVersion: string
    versionCode: number
    apkUrl: string
    releaseNotes: string[]
    fileSize: number
    checksum: string
    releasedAt: string
  }
}

export function ApkDownloadTerminal({ release }: ApkTerminalProps) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const fileSizeMb = (release.fileSize / (1024 * 1024)).toFixed(1)

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(release.checksum)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <div className="space-y-12 relative">
      {/* Maintenance / Coming Soon Modal Dialog */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="maintenance-modal-title"
          className="fixed inset-0 z-50 bg-[#0C192E]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-w-lg w-full bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E6E2D8] text-[#0F172A] space-y-6 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F3F0EA] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon & Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-bold uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Launching Shortly • Final Server Sync</span>
              </div>

              <h3
                id="maintenance-modal-title"
                className="text-2xl font-bold font-serif text-[#0F172A] leading-snug"
              >
                OCI Mobile v{release.latestVersion} is Under Final Optimization
              </h3>
            </div>

            {/* Modal Explanatory Content */}
            <div className="space-y-3 text-xs sm:text-sm text-[#475569] leading-relaxed">
              <p>
                The official OCI Android application is currently undergoing final infrastructure deployment and CBT test engine synchronization before public release.
              </p>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-1.5 text-xs text-[#334155]">
                <span className="font-bold text-[#0F172A] block">What this means for aspirants:</span>
                <p>• The direct APK download link will be officially unlocked as soon as synchronization completes.</p>
                <p>• Enrolled classroom students in Bhadrak can obtain early access builds directly from the administrative desk.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                href="https://wa.me/917655004403?text=Hello%20OCI%2C%20I%20want%20to%20inquire%20about%20the%20OCI%20Mobile%20App%20release%20and%20early%20access."
                target="_blank"
                variant="primary"
                size="default"
                className="flex-1 justify-center bg-[#059669] hover:bg-[#047857] text-white border-0 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </Button>

              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
                size="default"
                className="justify-center border-[#CBD5E1]"
              >
                <span>Understood</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Terminal Card */}
      <div className="p-8 sm:p-12 rounded-2xl bg-[#0C192E] text-white border border-[#1E2D4A] shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Download CTA & Specs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#15253F] text-[#F59E0B] border border-[#1E2D4A]">
                ANDROID APK v{release.latestVersion}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FEF3C7]/15 text-[#FBBF24] border border-[#F59E0B]/30 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Launching Shortly • Final Server Sync</span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
                OCI Mobile v{release.latestVersion}
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Direct distribution for enrolled students and competitive exam aspirants across Odisha. Real-time CBT testing, instant scorecards, and offline syllabus notes.
              </p>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#15253F] border border-[#1E2D4A] text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Build Number</span>
                <span className="font-bold text-white font-mono">Build {release.versionCode}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Binary Size</span>
                <span className="font-bold text-white font-mono">~{fileSizeMb} MB</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[11px]">Platform</span>
                <span className="font-bold text-white font-mono">Android 8.0+</span>
              </div>
            </div>

            {/* Direct Download Button with OnClick Handler */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleDownloadClick}
                variant="amber"
                size="lg"
                className="w-full sm:w-auto shadow-md cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Official APK (v{release.latestVersion})</span>
              </Button>
              <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                <span>App is undergoing scheduled server synchronization. Tap to view release notice.</span>
              </p>
            </div>
          </div>

          {/* Right: Release Notes & Checksum Verification (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-[#15253F] border border-[#1E2D4A] space-y-4">
            <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>What&apos;s Included in v{release.latestVersion}</span>
            </div>

            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              {release.releaseNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>

            {/* SHA-256 Checksum Box */}
            <div className="pt-3 border-t border-[#1E2D4A] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="font-mono uppercase">SHA-256 Checksum:</span>
                <button
                  onClick={handleCopyChecksum}
                  className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[10px] text-[#94A3B8] break-all select-all bg-[#0C192E] p-2.5 rounded-lg border border-[#1E2D4A]">
                {release.checksum}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual 4-Step Android Installation Walkthrough */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E6E2D8] shadow-sm space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
            INSTALLATION GUIDE
          </span>
          <h3 className="text-2xl font-bold font-serif text-[#0F172A]">
            How to Install OCI on Your Android Device
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-2xl">
            Because OCI distributes its official binary directly to students without third-party app store delays, follow these 4 straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F3F0EA] text-[#0F172A] font-bold font-serif flex items-center justify-center text-sm border border-[#CBD5E1]">
              01
            </span>
            <h4 className="text-sm font-bold text-[#0F172A]">Download the APK</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Tap the &quot;Download Official APK&quot; button above to begin direct high-speed download to your phone.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F3F0EA] text-[#0F172A] font-bold font-serif flex items-center justify-center text-sm border border-[#CBD5E1]">
              02
            </span>
            <h4 className="text-sm font-bold text-[#0F172A]">Open Download Alert</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              When the file finishes downloading, pull down your notification tray and tap the completed file, or open it in your Files app.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F3F0EA] text-[#0F172A] font-bold font-serif flex items-center justify-center text-sm border border-[#CBD5E1]">
              03
            </span>
            <h4 className="text-sm font-bold text-[#0F172A]">Permit Installation</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              If prompted by Android security (&quot;Unknown Source&quot;), tap Settings and enable &quot;Allow from this source&quot; for your browser.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#F3F0EA] text-[#0F172A] font-bold font-serif flex items-center justify-center text-sm border border-[#CBD5E1]">
              04
            </span>
            <h4 className="text-sm font-bold text-[#0F172A]">Launch & Sign In</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Open OCI Mobile and sign in with your registered student credentials to start taking daily CBT mock drills immediately.
            </p>
          </div>
        </div>

        {/* WhatsApp Helpline Fallback */}
        <div className="pt-4 border-t border-[#E6E2D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#059669]" />
            <span>Need help or early access on Xiaomi, Realme, Vivo, or Samsung?</span>
          </div>

          <Button
            href="https://wa.me/917655004403?text=Hello%20OCI%20Support%2C%20I%20need%20assistance%20regarding%20the%20Android%20APK%20download."
            variant="outline"
            size="sm"
            className="border-[#CBD5E1]"
          >
            <span>Chat With App Support</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

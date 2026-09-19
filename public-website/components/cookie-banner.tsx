'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Check } from 'lucide-react'

const STORAGE_KEY = 'oci_cookie_consent_v1'

interface ConsentSettings {
  essential: boolean
  analytics: boolean
  functional: boolean
  timestamp: string
}

export function CookieBanner() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [functional, setFunctional] = useState(true)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        // Subtle entrance after brief initial page rendering
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        const parsed: ConsentSettings = JSON.parse(stored)
        setAnalytics(parsed.analytics ?? true)
        setFunctional(parsed.functional ?? true)
      }
    } catch {
      // Fallback if localStorage is unavailable
    }
  }, [])

  // Listen for manual trigger from Footer "Cookie Preferences" link
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setShowCustomizer(true)
    }
    window.addEventListener('openCookieBanner', handleOpen)
    return () => window.removeEventListener('openCookieBanner', handleOpen)
  }, [])

  const saveConsent = (settings: Omit<ConsentSettings, 'timestamp'>) => {
    try {
      const payload: ConsentSettings = {
        ...settings,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Silently proceed
    }
    setIsOpen(false)
  }

  const handleAcceptAll = () => {
    setAnalytics(true)
    setFunctional(true)
    saveConsent({ essential: true, analytics: true, functional: true })
  }

  const handleAcceptEssential = () => {
    setAnalytics(false)
    setFunctional(false)
    saveConsent({ essential: true, analytics: false, functional: false })
  }

  const handleSaveCustom = () => {
    saveConsent({ essential: true, analytics, functional })
  }

  if (!mounted || !isOpen) return null

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Cookie & Privacy Consent"
      className="fixed z-50 bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-[#0C192E]/95 backdrop-blur-xl border border-[#233554] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-[#D97706]/25 rounded-2xl p-5 md:p-6 text-white text-xs">
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Cookie & Privacy Notice</span>
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-[#D97706] font-semibold block">
                Odisha Competitive Institute
              </span>
            </div>
          </div>

          <button
            onClick={handleAcceptEssential}
            aria-label="Close and continue with essential cookies only"
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Description */}
        <div className="pt-3 pb-3 space-y-2 text-[#CBD5E1] text-[12px] leading-relaxed">
          <p>
            We use essential cookies to maintain secure sessions and page navigation. With your consent, we also utilize anonymized analytics to measure exam syllabus interest and improve our CBT mock test materials.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>
              Your personal data is never sold. Review our{' '}
              <Link
                href="/privacy-policy"
                className="text-[#F59E0B] underline hover:text-[#FBBF24] transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </div>
        </div>

        {/* Expandable Preferences Customizer */}
        {showCustomizer && (
          <div className="my-3 pt-3 pb-2 border-t border-[#1E2D4A] space-y-2.5 bg-[#081220]/60 p-3 rounded-xl border border-[#162235]">
            {/* Essential (Always On) */}
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <div>
                <span className="font-semibold text-white block">Strictly Necessary</span>
                <span className="text-[#94A3B8] text-[10px] block">
                  Core security, admissions enquiry integrity, and session token routing.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] text-[10px] font-bold uppercase tracking-wider shrink-0 border border-[#10B981]/30">
                Always Active
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
              <div>
                <span className="font-semibold text-white block">Analytics & Performance</span>
                <span className="text-[#94A3B8] text-[10px] block">
                  Aggregated page traffic and mock test download telemetry.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                  analytics ? 'bg-[#D97706]' : 'bg-[#334155]'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    analytics ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
              <div>
                <span className="font-semibold text-white block">Functional Preferences</span>
                <span className="text-[#94A3B8] text-[10px] block">
                  Remembers your exam stream filter (SSC, State Govt, Railway).
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={functional}
                onClick={() => setFunctional(!functional)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                  functional ? 'bg-[#D97706]' : 'bg-[#334155]'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    functional ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="text-[11px] text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1 py-1"
          >
            <span>{showCustomizer ? 'Hide Options' : 'Customize Options'}</span>
            {showCustomizer ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {showCustomizer ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] border border-white/15 transition-colors"
              >
                Save Choices
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] border border-white/15 transition-colors"
              >
                Essential Only
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-[11px] transition-all shadow-md shadow-[#D97706]/20 active:scale-95 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight, Download, PhoneCall } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OciLogo } from '@/components/oci-logo'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Examinations', href: '/exams' },
  { label: 'Methodology', href: '/why-oci' },
  { label: 'Mobile App', href: '/app' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E2D8] shadow-sm py-2.5'
            : 'bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#E6E2D8]/80 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-xl"
            aria-label="Odisha Competitive Institute Homepage"
          >
            <OciLogo size={42} showText={false} />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors leading-tight">
                <span className="hidden sm:inline">Odisha Competitive Institute</span>
                <span className="sm:hidden">OCI BHADRAK</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide text-[#D97706] uppercase">
                Bhadrak, Odisha • Estd. 2017
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center space-x-1"
          >
            {NAV_ITEMS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive
                      ? 'text-[#0F172A] font-bold'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F3F0EA]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D97706] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <Button
              href="/download"
              variant="outline"
              size="sm"
              className="border-[#CBD5E1] text-[#0F172A] hover:bg-[#F3F0EA]"
            >
              <Download className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Download App</span>
            </Button>

            <Button
              href="/contact"
              variant="primary"
              size="sm"
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Enquire Now</span>
            </Button>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-[#0F172A] hover:bg-[#F3F0EA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-xl lg:hidden flex flex-col pt-24 px-6 pb-20 justify-between overflow-y-auto"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#D97706] uppercase block mb-3">
                INSTITUTE NAVIGATION
              </span>
              {NAV_ITEMS.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3.5 px-4 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                        : 'text-[#0F172A] hover:bg-[#F3F0EA]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#64748B]" />
                  </Link>
                )
              })}
            </div>

            <div className="pt-6 border-t border-[#E6E2D8] space-y-3">
              <Button
                href="/download"
                variant="dark"
                size="lg"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download className="w-4 h-4 text-[#F59E0B]" />
                <span>Get Official Android APK (v1.0.0)</span>
              </Button>

              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Admissions Enquiry</span>
              </Button>

              <div className="text-center pt-3 text-xs text-[#64748B]">
                <p className="font-semibold text-[#0F172A]">Nayabazar, Bhadrak, Odisha — 756100</p>
                <p className="mt-0.5">Established 17 January 2017</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

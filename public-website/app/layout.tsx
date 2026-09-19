import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MobileQuickActionBar } from '@/components/mobile-quick-action-bar'
import { CookieBanner } from '@/components/cookie-banner'

export const metadata: Metadata = {
  title: {
    default: 'Odisha Competitive Institute | Your Success, Our Tradition',
    template: '%s | Odisha Competitive Institute',
  },
  description:
    'Odisha Competitive Institute (OCI) in Bhadrak, Odisha provides rigorous, concept-grounded classroom coaching and digital CBT mock test series for SSC, Odisha Govt, Railway, Banking, Defence, and Teaching exams. Established 17 January 2017.',
  keywords: [
    'Odisha Competitive Institute',
    'OCI Bhadrak',
    'Competitive Exam Coaching Odisha',
    'SSC CGL Coaching Bhadrak',
    'OSSC OSSSC Preparation',
    'Odisha Police Constable SI Coaching',
    'Railway Recruitment RRB Bhadrak',
    'Banking Coaching Bhadrak',
  ],
  authors: [{ name: 'Odisha Competitive Institute' }],
  creator: 'Odisha Competitive Institute',
  icons: {
    icon: '/oci-logo.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0C192E',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#FAF8F5] text-[#0F172A] scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#D97706]/20 selection:text-[#0F172A] pb-16 md:pb-0">
        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1D4ED8] focus:text-white focus:font-semibold focus:rounded-xl focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <Navbar />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
        <MobileQuickActionBar />
        <CookieBanner />
      </body>
    </html>
  )
}

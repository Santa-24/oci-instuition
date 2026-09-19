import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  breadcrumbLabel: string
}

export function PageHeader({ eyebrow, title, description, breadcrumbLabel }: PageHeaderProps) {
  return (
    <section className="bg-[#F3F0EA] border-b border-[#E6E2D8] py-12 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center space-x-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#0F172A] font-semibold">{breadcrumbLabel}</span>
        </nav>

        {/* Typographic Kicker */}
        <div className="text-xs font-bold tracking-widest text-[#D97706] uppercase mb-2">
          {eyebrow}
        </div>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-serif leading-tight max-w-4xl">
          {title}
        </h1>

        {/* Supporting Description */}
        {description && (
          <p className="mt-3 text-base sm:text-lg text-[#475569] max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}

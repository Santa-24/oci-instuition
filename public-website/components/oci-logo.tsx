import React from 'react'

interface OciLogoProps {
  size?: number
  className?: string
  showText?: boolean
  textColor?: string
}

export function OciLogo({
  size = 44,
  className = '',
  showText = false,
  textColor = 'text-white',
}: OciLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        aria-label="Odisha Competitive Institute Logo"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="pageRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          <linearGradient id="pageGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="pageCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>

          <linearGradient id="handBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle cx="100" cy="100" r="92" stroke="url(#ringGrad)" strokeWidth="10" fill="white" />
        <circle cx="100" cy="100" r="76" stroke="#2563EB" strokeWidth="3" fill="none" opacity="0.4" />

        {/* Circular Curved Text Path */}
        <path id="textPathTop" d="M 28,100 A 72,72 0 1,1 172,100" fill="none" />
        <path id="textPathBottom" d="M 160,110 A 68,68 0 0,1 40,110" fill="none" />

        <text fill="#0F172A" fontSize="11.5" fontWeight="800" fontFamily="sans-serif" letterSpacing="1.2">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            ODISHA COMPETITIVE INSTITUTE
          </textPath>
        </text>

        <text fill="#0284C7" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
            BHADRAK
          </textPath>
        </text>

        {/* Inner Graphic Elements */}
        {/* Book Left Page (Red) */}
        <path d="M 58 75 Q 75 60 98 75 L 98 122 Q 75 110 58 122 Z" fill="url(#pageRed)" />
        {/* Book Left Inner Page (Gold) */}
        <path d="M 70 73 Q 83 62 98 75 L 98 122 Q 83 112 70 122 Z" fill="url(#goldGrad)" />

        {/* Book Right Page (Cyan) */}
        <path d="M 142 75 Q 125 60 102 75 L 102 122 Q 125 110 142 122 Z" fill="url(#pageCyan)" />
        {/* Book Right Inner Page (Green) */}
        <path d="M 130 73 Q 117 62 102 75 L 102 122 Q 117 112 130 122 Z" fill="url(#pageGreen)" />

        {/* Central Rising Student Figure */}
        <circle cx="100" cy="58" r="7" fill="#1D4ED8" />
        <path d="M 100 68 C 92 82 82 92 78 112 C 92 105 100 88 100 68 Z" fill="#2563EB" />
        <path d="M 100 68 C 108 82 118 92 122 112 C 108 105 100 88 100 68 Z" fill="#0284C7" />

        {/* Supporting Hand at Bottom */}
        <path
          d="M 52 132 C 70 126 90 134 110 138 C 130 142 148 132 152 128 C 145 142 125 152 98 152 C 75 152 58 142 52 132 Z"
          fill="url(#handBlue)"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-wider text-sm leading-tight uppercase ${textColor}`}>
            Odisha Competitive Institute
          </span>
          <span className="text-[10px] tracking-widest font-mono text-amber-400 uppercase">
            Bhadrak, Odisha • Estd. 2017
          </span>
        </div>
      )}
    </div>
  )
}

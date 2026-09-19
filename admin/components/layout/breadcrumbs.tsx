'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
      <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </Link>
      {segments.slice(1).map((seg, idx) => {
        const href = `/${segments.slice(0, idx + 2).join('/')}`;
        const isLast = idx === segments.length - 2;
        const formatted = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            {isLast ? (
              <span className="font-semibold text-slate-200">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

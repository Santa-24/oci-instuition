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
    <nav className="flex items-center space-x-2 text-xs text-muted-foreground select-none">
      <Link
        href="/admin/dashboard"
        className="hover:text-foreground flex items-center gap-1 transition-colors font-medium"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Command Center</span>
      </Link>
      {segments.slice(1).map((seg, idx) => {
        const href = `/${segments.slice(0, idx + 2).join('/')}`;
        const isLast = idx === segments.length - 2;
        const formatted = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="font-bold text-foreground truncate">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors font-medium truncate">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

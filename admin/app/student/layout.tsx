'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 text-xs text-slate-400">
      Redirecting to Admin Command Center...
    </div>
  );
}

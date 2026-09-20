'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Breadcrumbs } from './breadcrumbs';
import { supabase } from '@/lib/supabase/client';
import { Loader2, X } from 'lucide-react';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/login');
          return;
        }

        // Authoritatively verify admin role
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        let role = roleRow?.role?.toLowerCase();
        if (!role) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          role = profile?.role?.toLowerCase();
        }

        if (role !== 'admin' && role !== 'superadmin') {
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('[AdminShell] Auth verification error:', err);
        router.replace('/login');
      }
    }

    checkAdminAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen bg-canvas items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold tracking-widest uppercase text-foreground">
            Verifying OCI Administrator Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas text-foreground">
      {/* Desktop Persistent Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex max-w-full z-50">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute right-3 top-3.5 z-10 p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

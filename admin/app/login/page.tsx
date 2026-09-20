'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data?.user) {
        setErrorMessage(error?.message || 'Invalid administrator email or password.');
        setIsLoading(false);
        return;
      }

      // 2. Authoritatively verify admin role
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      let role = roleRow?.role?.toLowerCase();

      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        role = profile?.role?.toLowerCase();
      }

      if (role !== 'admin' && role !== 'superadmin') {
        await supabase.auth.signOut();
        setErrorMessage('Access denied: Account does not have verified administrator privileges.');
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-500/20 text-white font-black text-2xl">
            OCI
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">OCI Master Admin Console</h1>
          <p className="text-xs text-slate-400">
            Odisha Competitive Institute • Secured Command Center for Administrators Only
          </p>
        </div>

        {/* Login Form Card */}
        <Card glow className="p-8 border-slate-800 bg-slate-900/90">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Administrator Email Address"
              type="email"
              placeholder="admin@oci.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Master Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to Command Center
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Admin console access is strictly restricted by Role-Based Access Control (RBAC). Public registration is disabled.
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Protected with Supabase Auth & Role-Based Access Control (RBAC)</span>
        </p>
      </div>
    </div>
  );
}

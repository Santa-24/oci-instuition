'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { AcademicService } from '@/lib/services/academic-service';
import { Save, CheckCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';

const DEFAULT_CONTACT = {
  phonePrimary: '+91 94370 00000',
  phoneSecondary: '+91 70080 00000',
  whatsappNumber: '+91 94370 00000',
  officialEmail: 'contact@oci.edu.in',
  supportEmail: 'admissions@oci.edu.in',
  officeAddress: 'OCI Campus, Nayabazar, Near Medical Square, Bhadrak, Odisha — 756100',
  officeHours: 'Monday – Saturday: 07:00 AM – 08:30 PM | Sunday: 08:00 AM – 01:00 PM',
  mapsUrl: 'https://maps.google.com/?q=Nayabazar+Bhadrak+Odisha+Competitive+Institute',
};

export default function ContactSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(DEFAULT_CONTACT);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await AcademicService.getSettings('settings_contact', DEFAULT_CONTACT);
        if (data) {
          setContact({ ...DEFAULT_CONTACT, ...data });
        }
      } catch (err) {
        console.error('Failed to load contact settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AcademicService.saveSettings('settings_contact', contact);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Information & Campus Locations"
        description="Centralized contact numbers, helpdesk routing, and campus address synced to website and mobile app."
        statusPill={<StatusBadge status="live" label="DATABASE SYNCED" size="sm" />}
        actions={
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          >
            {isSaved ? 'Contact Info Saved!' : 'Save Contact Info'}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Communications Card */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
          <CardHeader className="px-0 pt-0 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <CardTitle>Official Communications &amp; Helpdesk</CardTitle>
            </div>
            <CardDescription>Primary hotline, student WhatsApp support, and inquiry email inboxes</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Primary Helpdesk Phone"
                value={contact.phonePrimary}
                onChange={(e) => setContact({ ...contact, phonePrimary: e.target.value })}
              />
              <Input
                label="Secondary Hotline"
                value={contact.phoneSecondary}
                onChange={(e) => setContact({ ...contact, phoneSecondary: e.target.value })}
              />
              <Input
                label="WhatsApp Student Support"
                value={contact.whatsappNumber}
                onChange={(e) => setContact({ ...contact, whatsappNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Admissions Email"
                value={contact.supportEmail}
                onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
              />
              <Input
                label="Official Institute Email"
                value={contact.officialEmail}
                onChange={(e) => setContact({ ...contact, officialEmail: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Physical Campus Location */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
          <CardHeader className="px-0 pt-0 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <CardTitle>Campus Location &amp; Visiting Hours</CardTitle>
            </div>
            <CardDescription>Physical address at Nayabazar, Bhadrak and Google Maps navigation route</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <Input
              label="Physical Campus Address"
              value={contact.officeAddress}
              onChange={(e) => setContact({ ...contact, officeAddress: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Operating Hours"
                value={contact.officeHours}
                onChange={(e) => setContact({ ...contact, officeHours: e.target.value })}
              />
              <Input
                label="Google Maps Navigation URL"
                value={contact.mapsUrl}
                onChange={(e) => setContact({ ...contact, mapsUrl: e.target.value })}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

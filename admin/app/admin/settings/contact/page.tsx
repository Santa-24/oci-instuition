'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, MapPin, Phone, Mail } from 'lucide-react';

export default function ContactSettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [contact, setContact] = useState({
    phonePrimary: '+91 94370 12345',
    phoneSecondary: '+91 98610 67890',
    whatsappNumber: '+91 94370 12345',
    officialEmail: 'admissions@oci-institute.edu',
    supportEmail: 'support@oci-institute.edu',
    officeAddress: 'Plot No. 142/A, Saheed Nagar, Near Maharishi College, Bhubaneswar, Odisha — 751007',
    officeHours: 'Monday – Saturday: 08:00 AM – 08:00 PM | Sunday: 09:00 AM – 02:00 PM',
    mapsCoordinates: '20.2961° N, 85.8245° E',
    mapsUrl: 'https://maps.google.com/?q=Saheed+Nagar+Bhubaneswar+OCI',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Contact Information & Locations</h1>
          <p className="text-xs text-slate-400 mt-1">Centralized contact settings synced to the website footer, contact page, and mobile app.</p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
        >
          {isSaved ? 'Saved Contact Info!' : 'Save Contact Info'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-indigo-400" />
            <span>Official Communications</span>
          </CardTitle>
          <CardDescription>Phone numbers, WhatsApp helpdesk, and email inboxes</CardDescription>
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
              label="WhatsApp Support Number"
              value={contact.whatsappNumber}
              onChange={(e) => setContact({ ...contact, whatsappNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admissions Email"
              value={contact.officialEmail}
              onChange={(e) => setContact({ ...contact, officialEmail: e.target.value })}
            />
            <Input
              label="Support / Grievance Email"
              value={contact.supportEmail}
              onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-400" />
            <span>Campus Location & Maps</span>
          </CardTitle>
          <CardDescription>Physical address and Google Maps navigation links</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="Physical Campus Address"
            value={contact.officeAddress}
            onChange={(e) => setContact({ ...contact, officeAddress: e.target.value })}
          />
          <Input
            label="Office Working Hours"
            value={contact.officeHours}
            onChange={(e) => setContact({ ...contact, officeHours: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GPS Coordinates"
              value={contact.mapsCoordinates}
              onChange={(e) => setContact({ ...contact, mapsCoordinates: e.target.value })}
            />
            <Input
              label="Google Maps Direction URL"
              value={contact.mapsUrl}
              onChange={(e) => setContact({ ...contact, mapsUrl: e.target.value })}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

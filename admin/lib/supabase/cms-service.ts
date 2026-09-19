import { supabase } from './client';

export interface CmsResponse<T> {
  data: T | null;
  error: string | null;
  fromFallback?: boolean;
}

/**
 * Fetch a specific CMS section from Supabase `website_content` table.
 */
export async function getCmsSection<T>(key: string, fallbackDefault: T): Promise<CmsResponse<T>> {
  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return { data: fallbackDefault, error: error?.message || null, fromFallback: true };
    }

    return { data: { ...fallbackDefault, ...(data.value as any) }, error: null };
  } catch (err: any) {
    return { data: fallbackDefault, error: err.message, fromFallback: true };
  }
}

/**
 * Save/Upsert a CMS section into Supabase `website_content` table.
 */
export async function saveCmsSection<T>(key: string, value: T): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch('/api/admin/website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    const json = await res.json();
    return { success: json.success, error: json.error || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all enquiries from Supabase with status sorting via Admin API.
 */
export async function getEnquiriesFromDb() {
  try {
    const res = await fetch('/api/admin/enquiries', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.enquiries || [];
  } catch {
    return [];
  }
}

/**
 * Update status of an enquiry in Supabase via Admin API.
 */
export async function updateEnquiryStatusInDb(id: string, status: string, internalNotes?: string) {
  try {
    const res = await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, internalNotes }),
    });
    const json = await res.json();
    return { success: json.success, error: json.error || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete an enquiry in Supabase via Admin API.
 */
export async function deleteEnquiryFromDb(id: string) {
  try {
    const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return { success: json.success, error: json.error || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

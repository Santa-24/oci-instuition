# OCI Platform — Storage Architecture & Supabase Buckets

## 1. Storage Overview

The OCI platform uses **Supabase Storage** exclusively for all binary assets, student profile pictures, PDFs, homework solutions, and promotional graphics.

> [!NOTE]
> Per the master architectural rules, **Cloudflare R2 is NOT used**. All binary objects reside in Supabase Storage buckets, backed by Supabase's global edge CDN and access-controlled through PostgreSQL storage policies.

---

## 2. Storage Buckets Catalog

| Bucket Identifier | Access Level | Max File Size | Permitted MIME Types | Usage & Contents |
|---|---|---|---|---|
| `avatars` | **Public Read** | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Student, Faculty, and Admin profile avatar images. |
| `course-thumbnails` | **Public Read** | 10 MB | `image/jpeg`, `image/png`, `image/webp` | Promotional graphics for courses and mock test banners. |
| `media-library` | **Public Read** | 50 MB | Images, SVGs, institute brochures, campus gallery photos. | Public website CMS media assets. |
| `study-materials` | **Restricted / Authenticated** | 100 MB | `application/pdf`, `image/*`, Word docs | Faculty handouts, DPPs, and formula sheets. |
| `assignments` | **Restricted / Authenticated** | 50 MB | `application/pdf`, `image/*` | Student homework solution submissions. |

---

## 3. Storage Security & Access Control (RLS)

Storage policies are defined in PostgreSQL via `storage.objects`:

```sql
-- 1. Public Read for Public Asset Buckets
CREATE POLICY "Public read for public buckets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('avatars', 'course-thumbnails', 'media-library'));

-- 2. Authenticated Upload for User Avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Faculty / Admin Upload for Study Materials
CREATE POLICY "Teachers and admins can upload study materials" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('study-materials', 'course-thumbnails', 'media-library') 
        AND (public.is_teacher() OR public.is_admin() OR auth.role() = 'service_role')
    );

-- 4. Student Upload for Homework Submissions
CREATE POLICY "Students can upload assignment submissions" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');
```

---

## 4. File Upload & Retrieval Flow

1. **Client-Side Upload**:
   - The authenticated client uploads directly to Supabase via `@supabase/supabase-js`:
     ```ts
     const { data, error } = await supabase.storage
       .from('study-materials')
       .upload(`${batchId}/${fileName}`, fileBlob);
     ```
2. **CDN Delivery**:
   - For public assets, the URL is retrieved using `getPublicUrl`:
     ```ts
     const { data } = supabase.storage.from('avatars').getPublicUrl(path);
     ```
   - For protected materials, a signed URL (`createSignedUrl`) is issued with a short-lived token (e.g., 60 minutes) to prevent unauthorized redistribution.

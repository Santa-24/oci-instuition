-- ==============================================================================
-- INTUITION COACHING INSTITUTE — DEPRECATE PAYMENTS & FEES MIGRATION
-- ==============================================================================
-- Safely removes payment and fee ledger dependencies from the database schema.

-- 1. Drop fee-related RLS policies if any
DROP POLICY IF EXISTS "Allow student read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow admin full payments" ON public.payments;
DROP POLICY IF EXISTS "Allow student read fees" ON public.student_fees;
DROP POLICY IF EXISTS "Allow admin full fees" ON public.student_fees;

-- 2. Drop payment and fee tables safely if existing
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.student_fees CASCADE;
DROP TABLE IF EXISTS public.fee_installments CASCADE;

-- 3. Remove total_fee column from courses if desired or keep as zero/informational
ALTER TABLE IF EXISTS public.courses DROP COLUMN IF EXISTS total_fee;

-- 4. Record audit log entry for migration
INSERT INTO public.audit_logs (action, entity_type, details)
VALUES ('MIGRATION', 'SYSTEM', 'Payment & fee ledger functionality deprecated and removed across all platform modules.')
ON CONFLICT DO NOTHING;

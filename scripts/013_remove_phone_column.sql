-- Drop the phone column from the users table
ALTER TABLE public.users DROP COLUMN IF EXISTS phone;

-- Force a schema refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Clear the PostgREST cache
NOTIFY pgrst, 'reload schema';
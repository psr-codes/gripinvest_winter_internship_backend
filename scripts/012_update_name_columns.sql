-- First, drop the existing name column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'name') THEN
        ALTER TABLE public.users DROP COLUMN name;
    END IF;
END $$;

-- Add first_name and last_name columns
ALTER TABLE public.users 
ADD COLUMN first_name varchar(255),
ADD COLUMN last_name varchar(255);

-- Force a schema refresh
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';
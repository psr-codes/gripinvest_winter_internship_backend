-- First, drop the existing age column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'age') THEN
        ALTER TABLE public.users DROP COLUMN age;
    END IF;
END $$;

-- Now add the columns
ALTER TABLE public.users 
ADD COLUMN age INT DEFAULT 0,
ADD COLUMN total_balance decimal(15,2) DEFAULT 0.00;

-- Add constraints
ALTER TABLE public.users
ADD CONSTRAINT total_balance_non_negative CHECK (total_balance >= 0);

-- Force a schema refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Clear the PostgREST cache
NOTIFY pgrst, 'reload schema';

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_age ON public.users(age);
CREATE INDEX IF NOT EXISTS idx_users_total_balance ON public.users(total_balance);
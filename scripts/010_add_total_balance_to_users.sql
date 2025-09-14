-- Add total_balance column to users table
DO $$ 
BEGIN 
    -- Add total_balance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'total_balance') THEN
        ALTER TABLE public.users 
        ADD COLUMN total_balance decimal(15,2) DEFAULT 0.00 NOT NULL,
        -- Add a check constraint to ensure balance doesn't go below 0
        ADD CONSTRAINT total_balance_non_negative CHECK (total_balance >= 0);
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
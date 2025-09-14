-- Add age column to users table
ALTER TABLE users 
ADD COLUMN age text,
ADD COLUMN phone text,
ADD COLUMN risk_appetite text DEFAULT 'moderate',
ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
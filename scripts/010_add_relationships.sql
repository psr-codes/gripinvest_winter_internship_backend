-- First, ensure the user_investments table exists
CREATE TABLE IF NOT EXISTS user_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    product_id UUID,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the foreign key relationship
ALTER TABLE user_investments 
ADD CONSTRAINT fk_product_id 
FOREIGN KEY (product_id) 
REFERENCES investment_products(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_investments_product_id ON user_investments(product_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
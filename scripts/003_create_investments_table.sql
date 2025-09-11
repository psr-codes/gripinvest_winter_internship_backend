-- Create investments table following the exact schema specification
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('active','matured','cancelled')) DEFAULT 'active',
    expected_return DECIMAL(12,2),
    maturity_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own investments" ON investments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own investments" ON investments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own investments" ON investments
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Admin can view all investments
CREATE POLICY "Admin can view all investments" ON investments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.email = 'prakash.rawat.dev@gmail.com'
        )
    );

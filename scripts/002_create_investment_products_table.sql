-- Create investment_products table following the exact schema specification
CREATE TABLE IF NOT EXISTS investment_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    investment_type VARCHAR(20) CHECK (investment_type IN ('bond','fd','mf','etf','other')) NOT NULL,
    tenure_months INTEGER NOT NULL,
    annual_yield DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low','moderate','high')) NOT NULL,
    min_investment DECIMAL(12,2) DEFAULT 1000.00,
    max_investment DECIMAL(12,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_investment_products_updated_at 
    BEFORE UPDATE ON investment_products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE investment_products ENABLE ROW LEVEL SECURITY;

-- Create policies - all users can view products
CREATE POLICY "Anyone can view investment products" ON investment_products
    FOR SELECT USING (true);

-- Only admin can manage products
CREATE POLICY "Admin can manage products" ON investment_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.email = 'prakash.rawat.dev@gmail.com'
        )
    );

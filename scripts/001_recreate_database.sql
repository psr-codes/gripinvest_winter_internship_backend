-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS transaction_logs CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS investment_products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing ENUMs if they exist
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS investment_type CASCADE;
DROP TYPE IF EXISTS http_method CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;

-- Create enum types
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE investment_type AS ENUM ('bond', 'fd', 'mf', 'etf', 'other');
CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE');
CREATE TYPE investment_status AS ENUM ('active', 'matured', 'cancelled');

-- Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    risk_appetite risk_level DEFAULT 'moderate',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for users updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create Investment Products Table
CREATE TABLE investment_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    investment_type investment_type NOT NULL,
    tenure_months INTEGER NOT NULL,
    annual_yield DECIMAL(5,2) NOT NULL,
    risk_level risk_level NOT NULL,
    min_investment DECIMAL(12,2) DEFAULT 1000.00,
    max_investment DECIMAL(12,2),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_investment_products_updated_at
    BEFORE UPDATE ON investment_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create Investments Table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES investment_products(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    invested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status investment_status DEFAULT 'active',
    expected_return DECIMAL(12,2),
    maturity_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create Transaction Logs Table
CREATE TABLE transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    email VARCHAR(255),
    endpoint VARCHAR(255) NOT NULL,
    http_method http_method NOT NULL,
    status_code INTEGER NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for investment_products
CREATE POLICY "Anyone can view investment products"
    ON investment_products FOR SELECT
    USING (true);

CREATE POLICY "Only admin can manage products"
    ON investment_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email = 'prakash.rawat.dev@gmail.com'
        )
    );

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments"
    ON investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
    ON investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transaction_logs
CREATE POLICY "Admin can view all logs"
    ON transaction_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email = 'prakash.rawat.dev@gmail.com'
        )
    );

CREATE POLICY "System can create logs"
    ON transaction_logs FOR INSERT
    WITH CHECK (true);
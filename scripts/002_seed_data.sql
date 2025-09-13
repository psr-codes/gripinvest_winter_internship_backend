-- Seed data for testing

-- Sample Investment Products
INSERT INTO investment_products (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES
('Fixed Deposit Plus', 'fd', 12, 8.50, 'low', 10000.00, 1000000.00, 'A safe fixed deposit investment with guaranteed returns'),
('Equity Growth Fund', 'mf', 36, 12.75, 'high', 5000.00, NULL, 'High-growth equity mutual fund focused on large-cap stocks'),
('Government Bond 2024', 'bond', 24, 7.25, 'low', 25000.00, 500000.00, 'Government-backed bonds with assured returns'),
('Tech Sector ETF', 'etf', 0, 15.50, 'high', 1000.00, NULL, 'ETF tracking top technology companies'),
('Corporate Bond AAA', 'bond', 18, 9.00, 'moderate', 50000.00, 2000000.00, 'High-rated corporate bonds with stable returns');

-- Note: Users will be created through authentication system
-- Note: Investments will be created through the application
-- Note: Transaction logs will be generated automatically
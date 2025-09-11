-- Seed investment products with realistic data
INSERT INTO investment_products (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES
-- Fixed Deposits
('SBI Fixed Deposit Plus', 'fd', 12, 7.50, 'low', 5000.00, 1000000.00, 'Secure fixed deposit with competitive returns and flexible tenure options.'),
('HDFC Fixed Deposit', 'fd', 24, 7.25, 'low', 10000.00, 500000.00, 'Traditional fixed deposit scheme with guaranteed returns.'),
('ICICI Bank FD', 'fd', 18, 7.00, 'low', 5000.00, 2000000.00, 'Fixed deposit with auto-renewal facility and premature withdrawal options.'),

-- Mutual Funds
('HDFC Large Cap Fund', 'mf', 36, 12.30, 'moderate', 1000.00, NULL, 'Diversified equity mutual fund focusing on large-cap stocks for stable growth.'),
('SBI Small Cap Growth Fund', 'mf', 60, 18.50, 'high', 2000.00, NULL, 'High-growth potential fund investing in small-cap companies.'),
('Axis Bluechip Fund', 'mf', 24, 14.20, 'moderate', 1500.00, NULL, 'Large-cap equity fund with consistent performance track record.'),

-- Bonds
('Government Bond Series', 'bond', 60, 6.80, 'low', 10000.00, 5000000.00, 'Government-backed bonds offering steady returns with minimal risk.'),
('Corporate Bond Fund', 'bond', 36, 8.20, 'moderate', 15000.00, 1000000.00, 'Corporate bonds offering higher yields than government securities.'),

-- ETFs
('Nifty 50 ETF', 'etf', 24, 14.20, 'moderate', 500.00, NULL, 'Exchange-traded fund tracking the Nifty 50 index for market returns.'),
('Gold ETF', 'etf', 12, 8.50, 'low', 1000.00, NULL, 'Gold-backed ETF providing exposure to precious metals.'),

-- Other investments
('Real Estate Investment Trust', 'other', 48, 11.50, 'moderate', 25000.00, 10000000.00, 'REIT offering exposure to commercial real estate with regular dividends.'),
('Infrastructure Bonds', 'other', 84, 9.20, 'moderate', 50000.00, 2000000.00, 'Long-term infrastructure bonds with tax benefits and steady returns.');

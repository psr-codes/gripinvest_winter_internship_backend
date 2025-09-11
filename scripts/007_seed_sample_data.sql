-- Insert sample users (for testing - in production, users are created via auth)
INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Prakash', 'Rawat', 'prakash.rawat.dev@gmail.com', '$2a$10$dummy_hash_for_admin', 'moderate'),
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Doe', 'john.doe@example.com', '$2a$10$dummy_hash_for_user', 'low'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane', 'Smith', 'jane.smith@example.com', '$2a$10$dummy_hash_for_user2', 'high')
ON CONFLICT (email) DO NOTHING;

-- Insert sample investments for testing
INSERT INTO investments (user_id, product_id, amount, expected_return, maturity_date, status) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    ip.id,
    CASE 
        WHEN ip.name = 'SBI Fixed Deposit Plus' THEN 50000.00
        WHEN ip.name = 'HDFC Large Cap Fund' THEN 30000.00
        WHEN ip.name = 'Government Bond Series' THEN 20000.00
        ELSE 10000.00
    END as amount,
    CASE 
        WHEN ip.name = 'SBI Fixed Deposit Plus' THEN 53750.00
        WHEN ip.name = 'HDFC Large Cap Fund' THEN 37500.00
        WHEN ip.name = 'Government Bond Series' THEN 22000.00
        ELSE 11000.00
    END as expected_return,
    CASE 
        WHEN ip.name = 'SBI Fixed Deposit Plus' THEN CURRENT_DATE + INTERVAL '12 months'
        WHEN ip.name = 'HDFC Large Cap Fund' THEN CURRENT_DATE + INTERVAL '36 months'
        WHEN ip.name = 'Government Bond Series' THEN CURRENT_DATE + INTERVAL '60 months'
        ELSE CURRENT_DATE + INTERVAL '24 months'
    END as maturity_date,
    'active'
FROM investment_products ip
WHERE ip.name IN ('SBI Fixed Deposit Plus', 'HDFC Large Cap Fund', 'Government Bond Series')
ON CONFLICT DO NOTHING;

-- Insert sample transaction logs
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '/api/investments', 'POST', 200, NULL),
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '/api/portfolio', 'GET', 200, NULL),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '/api/products', 'GET', 200, NULL),
(NULL, 'anonymous@example.com', '/api/auth/login', 'POST', 401, 'Invalid credentials'),
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '/api/investments/invalid', 'GET', 404, 'Investment not found')
ON CONFLICT DO NOTHING;

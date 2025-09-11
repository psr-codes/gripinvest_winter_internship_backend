-- Insert sample transaction logs for testing
INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message, created_at) VALUES
-- Successful operations
(gen_random_uuid(), 'user@example.com', '/api/investments', 'POST', 200, NULL, NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'user@example.com', '/api/products', 'GET', 200, NULL, NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'prakash.rawat.dev@gmail.com', '/api/products', 'POST', 201, NULL, NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 'user2@example.com', '/api/investments', 'POST', 200, NULL, NOW() - INTERVAL '4 hours'),

-- Error operations
(gen_random_uuid(), 'user@example.com', '/api/investments', 'POST', 400, 'Missing required fields', NOW() - INTERVAL '5 hours'),
(NULL, NULL, '/api/investments', 'POST', 401, 'Unauthorized', NOW() - INTERVAL '6 hours'),
(gen_random_uuid(), 'user@example.com', '/api/products', 'POST', 403, 'Forbidden - Admin access required', NOW() - INTERVAL '7 hours'),
(gen_random_uuid(), 'user@example.com', '/api/investments', 'POST', 500, 'Database connection failed', NOW() - INTERVAL '8 hours'),

-- More recent logs
(gen_random_uuid(), 'prakash.rawat.dev@gmail.com', '/api/products', 'GET', 200, NULL, NOW() - INTERVAL '30 minutes'),
(gen_random_uuid(), 'user3@example.com', '/api/investments', 'POST', 200, NULL, NOW() - INTERVAL '15 minutes');

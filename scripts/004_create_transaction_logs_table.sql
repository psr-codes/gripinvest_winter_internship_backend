-- Create transaction_logs table following the exact schema specification
CREATE TABLE IF NOT EXISTS transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    email VARCHAR(255),
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) CHECK (http_method IN ('GET','POST','PUT','DELETE')) NOT NULL,
    status_code INTEGER NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- Create policies - only admin can view transaction logs
CREATE POLICY "Admin can view all transaction logs" ON transaction_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.email = 'prakash.rawat.dev@gmail.com'
        )
    );

-- System can insert transaction logs
CREATE POLICY "System can insert transaction logs" ON transaction_logs
    FOR INSERT WITH CHECK (true);

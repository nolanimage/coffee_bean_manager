-- Add password reset fields to users table
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;

-- Create index for reset token expiry for cleanup queries
CREATE INDEX IF NOT EXISTS idx_users_reset_token_expiry ON users(reset_token_expiry); 
-- Enhanced Security Migration
-- Add user status and security fields

-- Add is_active column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add last_login column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add failed_login_attempts column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add account_locked_until column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_locked_until') THEN
        ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_table_name VARCHAR(100) DEFAULT NULL,
    p_record_id INTEGER DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update last login
CREATE OR REPLACE FUNCTION update_last_login(p_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET last_login = NOW(), 
        failed_login_attempts = 0,
        account_locked_until = NULL
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login(p_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        account_locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE account_locked_until
        END
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for coffee_beans
DROP POLICY IF EXISTS "Allow public read access to coffee_beans" ON coffee_beans;
DROP POLICY IF EXISTS "Allow public insert access to coffee_beans" ON coffee_beans;
DROP POLICY IF EXISTS "Allow public update access to coffee_beans" ON coffee_beans;
DROP POLICY IF EXISTS "Allow public delete access to coffee_beans" ON coffee_beans;

-- Create user-specific policies for coffee_beans
CREATE POLICY "Allow users to read their own coffee beans" ON coffee_beans 
    FOR SELECT USING (auth.uid()::text = created_by::text);

CREATE POLICY "Allow users to insert their own coffee beans" ON coffee_beans 
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Allow users to update their own coffee beans" ON coffee_beans 
    FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Allow users to delete their own coffee beans" ON coffee_beans 
    FOR DELETE USING (auth.uid()::text = created_by::text);

-- Enhanced RLS policies for inventory
DROP POLICY IF EXISTS "Allow public read access to inventory" ON inventory;
DROP POLICY IF EXISTS "Allow public insert access to inventory" ON inventory;
DROP POLICY IF EXISTS "Allow public update access to inventory" ON inventory;
DROP POLICY IF EXISTS "Allow public delete access to inventory" ON inventory;

-- Create user-specific policies for inventory
CREATE POLICY "Allow users to read their own inventory" ON inventory 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = inventory.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to insert their own inventory" ON inventory 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = inventory.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to update their own inventory" ON inventory 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = inventory.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to delete their own inventory" ON inventory 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = inventory.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

-- Enhanced RLS policies for tasting_notes
DROP POLICY IF EXISTS "Allow public read access to tasting_notes" ON tasting_notes;
DROP POLICY IF EXISTS "Allow public insert access to tasting_notes" ON tasting_notes;
DROP POLICY IF EXISTS "Allow public update access to tasting_notes" ON tasting_notes;
DROP POLICY IF EXISTS "Allow public delete access to tasting_notes" ON tasting_notes;

-- Create user-specific policies for tasting_notes
CREATE POLICY "Allow users to read their own tasting notes" ON tasting_notes 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = tasting_notes.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to insert their own tasting notes" ON tasting_notes 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = tasting_notes.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to update their own tasting notes" ON tasting_notes 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = tasting_notes.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

CREATE POLICY "Allow users to delete their own tasting notes" ON tasting_notes 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM coffee_beans 
            WHERE coffee_beans.id = tasting_notes.coffee_bean_id 
            AND coffee_beans.created_by = auth.uid()::text
        )
    );

-- Add created_by column to coffee_beans if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coffee_beans' AND column_name = 'created_by') THEN
        ALTER TABLE coffee_beans ADD COLUMN created_by VARCHAR(255);
    END IF;
END $$;

-- Create trigger to automatically set created_by
CREATE OR REPLACE FUNCTION set_created_by() RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid()::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for coffee_beans
DROP TRIGGER IF EXISTS set_coffee_beans_created_by ON coffee_beans;
CREATE TRIGGER set_coffee_beans_created_by
    BEFORE INSERT ON coffee_beans
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

-- Create function to clean up old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old audit logs (if using pg_cron)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 
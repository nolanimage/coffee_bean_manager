-- Create brewing_schedule table
CREATE TABLE IF NOT EXISTS brewing_schedule (
    id SERIAL PRIMARY KEY,
    coffee_bean_id INTEGER REFERENCES coffee_beans(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    brew_method VARCHAR(100),
    grind_size VARCHAR(50),
    water_temp INTEGER,
    brew_time INTEGER,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled', 'skipped')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brewing_schedule_date ON brewing_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_brewing_schedule_status ON brewing_schedule(status);
CREATE INDEX IF NOT EXISTS idx_brewing_schedule_coffee_bean_id ON brewing_schedule(coffee_bean_id); 
-- Add roasting date tracking and cost analysis fields to coffee_beans table
ALTER TABLE coffee_beans ADD COLUMN roast_date DATE;
ALTER TABLE coffee_beans ADD COLUMN best_by_date DATE;
ALTER TABLE coffee_beans ADD COLUMN total_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE coffee_beans ADD COLUMN cups_brewed INTEGER DEFAULT 0;
ALTER TABLE coffee_beans ADD COLUMN cost_per_cup DECIMAL(10,4) DEFAULT 0;

-- Add index for freshness tracking
CREATE INDEX idx_coffee_beans_roast_date ON coffee_beans(roast_date);
CREATE INDEX idx_coffee_beans_best_by_date ON coffee_beans(best_by_date);

-- Add cost tracking table for monthly spending
CREATE TABLE cost_tracking (
    id SERIAL PRIMARY KEY,
    coffee_bean_id INTEGER REFERENCES coffee_beans(id) ON DELETE CASCADE,
    purchase_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    quantity_grams INTEGER NOT NULL,
    cost_per_gram DECIMAL(10,6) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for cost analysis
CREATE INDEX idx_cost_tracking_purchase_date ON cost_tracking(purchase_date);
CREATE INDEX idx_cost_tracking_coffee_bean_id ON cost_tracking(coffee_bean_id);

-- Add brewing log table for cost per cup tracking
CREATE TABLE brewing_log (
    id SERIAL PRIMARY KEY,
    coffee_bean_id INTEGER REFERENCES coffee_beans(id) ON DELETE CASCADE,
    brew_date DATE NOT NULL,
    brew_method VARCHAR(100),
    grams_used INTEGER NOT NULL,
    cups_made INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for brewing analysis
CREATE INDEX idx_brewing_log_brew_date ON brewing_log(brew_date);
CREATE INDEX idx_brewing_log_coffee_bean_id ON brewing_log(coffee_bean_id); 
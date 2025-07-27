-- Create coffee_beans table
CREATE TABLE IF NOT EXISTS coffee_beans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(255),
    roast_level VARCHAR(50) CHECK (roast_level IN ('Light', 'Medium', 'Medium-Dark', 'Dark')),
    process_method VARCHAR(100),
    altitude VARCHAR(100),
    varietal VARCHAR(100),
    description TEXT,
    price_per_lb DECIMAL(10,2),
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    coffee_bean_id INTEGER REFERENCES coffee_beans(id) ON DELETE CASCADE,
    quantity_lbs DECIMAL(8,2) NOT NULL,
    storage_location VARCHAR(255),
    purchase_date DATE,
    roast_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasting_notes table
CREATE TABLE IF NOT EXISTS tasting_notes (
    id SERIAL PRIMARY KEY,
    coffee_bean_id INTEGER REFERENCES coffee_beans(id) ON DELETE CASCADE,
    brew_method VARCHAR(100),
    grind_size VARCHAR(50),
    water_temp INTEGER,
    brew_time INTEGER,
    aroma_rating INTEGER CHECK (aroma_rating >= 1 AND aroma_rating <= 10),
    acidity_rating INTEGER CHECK (acidity_rating >= 1 AND acidity_rating <= 10),
    body_rating INTEGER CHECK (body_rating >= 1 AND body_rating <= 10),
    flavor_rating INTEGER CHECK (flavor_rating >= 1 AND flavor_rating <= 10),
    aftertaste_rating INTEGER CHECK (aftertaste_rating >= 1 AND aftertaste_rating <= 10),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
    notes TEXT,
    tasting_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coffee_beans_roast_level ON coffee_beans(roast_level);
CREATE INDEX IF NOT EXISTS idx_coffee_beans_origin ON coffee_beans(origin);
CREATE INDEX IF NOT EXISTS idx_inventory_coffee_bean_id ON inventory(coffee_bean_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity_lbs);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_coffee_bean_id ON tasting_notes(coffee_bean_id);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_tasting_date ON tasting_notes(tasting_date);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_overall_rating ON tasting_notes(overall_rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_coffee_beans_updated_at BEFORE UPDATE ON coffee_beans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasting_notes_updated_at BEFORE UPDATE ON tasting_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE coffee_beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Allow public read access to coffee_beans" ON coffee_beans FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to coffee_beans" ON coffee_beans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to coffee_beans" ON coffee_beans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to coffee_beans" ON coffee_beans FOR DELETE USING (true);

CREATE POLICY "Allow public read access to inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to inventory" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to inventory" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to inventory" ON inventory FOR DELETE USING (true);

CREATE POLICY "Allow public read access to tasting_notes" ON tasting_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tasting_notes" ON tasting_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tasting_notes" ON tasting_notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to tasting_notes" ON tasting_notes FOR DELETE USING (true); 
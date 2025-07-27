-- Add buying information fields to coffee_beans table
ALTER TABLE coffee_beans ADD COLUMN buying_date DATE;
ALTER TABLE coffee_beans ADD COLUMN buying_place VARCHAR(255);
ALTER TABLE coffee_beans ADD COLUMN buying_price DECIMAL(10,2);
ALTER TABLE coffee_beans ADD COLUMN amount_grams DECIMAL(8,2);
ALTER TABLE coffee_beans ADD COLUMN photo_url TEXT;

-- Add comments to explain the new fields
COMMENT ON COLUMN coffee_beans.buying_date IS 'Date when the coffee bean was purchased';
COMMENT ON COLUMN coffee_beans.buying_place IS 'Place/store where the coffee bean was purchased';
COMMENT ON COLUMN coffee_beans.buying_price IS 'Price paid for the coffee bean (total price, not per lb)';
COMMENT ON COLUMN coffee_beans.amount_grams IS 'Amount purchased in grams';
COMMENT ON COLUMN coffee_beans.photo_url IS 'URL or path to photo of the coffee bean';

-- Create index for buying_date for better query performance
CREATE INDEX IF NOT EXISTS idx_coffee_beans_buying_date ON coffee_beans(buying_date);
CREATE INDEX IF NOT EXISTS idx_coffee_beans_buying_place ON coffee_beans(buying_place); 
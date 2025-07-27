-- Convert inventory table from pounds to grams
-- Add a new column for grams
ALTER TABLE inventory ADD COLUMN quantity_grams DECIMAL(10,2);

-- Update existing data: convert pounds to grams (1 lb = 453.592 g)
UPDATE inventory SET quantity_grams = quantity_lbs * 453.592 WHERE quantity_lbs IS NOT NULL;

-- Create index for the new grams column
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_grams ON inventory(quantity_grams);

-- Add comment to explain the unit
COMMENT ON COLUMN inventory.quantity_grams IS 'Quantity in grams'; 
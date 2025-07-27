-- Convert existing pounds data to grams
UPDATE inventory SET quantity_grams = quantity_lbs * 453.592 WHERE quantity_lbs IS NOT NULL AND quantity_grams IS NULL;

-- Drop the old pounds column
ALTER TABLE inventory DROP COLUMN quantity_lbs;

-- Update the index
DROP INDEX IF EXISTS idx_inventory_quantity_grams;
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_grams ON inventory(quantity_grams); 
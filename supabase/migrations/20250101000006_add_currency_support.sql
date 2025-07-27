-- Add currency support to coffee_beans table
ALTER TABLE coffee_beans ADD COLUMN buying_price_currency VARCHAR(3);

-- Add constraint to ensure valid currency codes
ALTER TABLE coffee_beans ADD CONSTRAINT check_valid_currency 
CHECK (buying_price_currency IN ('USD', 'HKD', 'JPY'));

-- Add comment to explain the new field
COMMENT ON COLUMN coffee_beans.buying_price_currency IS 'Currency code for the buying price (USD, HKD, JPY)';

-- Create index for currency for better query performance
CREATE INDEX IF NOT EXISTS idx_coffee_beans_currency ON coffee_beans(buying_price_currency); 
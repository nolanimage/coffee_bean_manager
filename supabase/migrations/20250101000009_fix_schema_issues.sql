-- Fix Database Schema Issues
-- Migration to resolve tasting notes rating type and coffee bean currency column

-- 1. Fix tasting_notes table - change overall_rating to DECIMAL to support decimal ratings
ALTER TABLE tasting_notes 
ALTER COLUMN overall_rating TYPE DECIMAL(3,1);

-- Add constraint to ensure rating is between 0 and 10
ALTER TABLE tasting_notes 
ADD CONSTRAINT check_rating_range 
CHECK (overall_rating >= 0 AND overall_rating <= 10);

-- 2. Ensure coffee_beans table has buying_price_currency column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coffee_beans' 
        AND column_name = 'buying_price_currency'
    ) THEN
        ALTER TABLE coffee_beans ADD COLUMN buying_price_currency VARCHAR(3) DEFAULT 'USD';
    END IF;
END $$;

-- Add constraint for valid currency codes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_valid_currency'
    ) THEN
        ALTER TABLE coffee_beans ADD CONSTRAINT check_valid_currency 
        CHECK (buying_price_currency IN ('USD', 'HKD', 'JPY'));
    END IF;
END $$;

-- 3. Fix roast_level validation - ensure it accepts string values
ALTER TABLE coffee_beans 
ALTER COLUMN roast_level TYPE VARCHAR(20);

-- 4. Fix date columns to be more flexible
ALTER TABLE coffee_beans 
ALTER COLUMN buying_date DROP NOT NULL,
ALTER COLUMN roast_date DROP NOT NULL;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coffee_beans_roast_level ON coffee_beans(roast_level);
CREATE INDEX IF NOT EXISTS idx_coffee_beans_buying_date ON coffee_beans(buying_date);
CREATE INDEX IF NOT EXISTS idx_coffee_beans_roast_date ON coffee_beans(roast_date);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_rating ON tasting_notes(overall_rating);
CREATE INDEX IF NOT EXISTS idx_tasting_notes_date ON tasting_notes(tasting_date);

-- 6. Add comments for better documentation
COMMENT ON COLUMN tasting_notes.overall_rating IS 'Overall rating from 0.0 to 10.0 (supports decimal values)';
COMMENT ON COLUMN coffee_beans.roast_level IS 'Roast level (Light, Medium, Dark, etc.)';
COMMENT ON COLUMN coffee_beans.buying_date IS 'Date when coffee was purchased (YYYY-MM-DD format)';
COMMENT ON COLUMN coffee_beans.roast_date IS 'Date when coffee was roasted (YYYY-MM-DD format)';

-- 7. Update any existing invalid data
-- Convert any existing integer ratings to decimal
UPDATE tasting_notes 
SET overall_rating = overall_rating::DECIMAL(3,1) 
WHERE overall_rating IS NOT NULL;

-- Ensure all coffee beans have a default currency
UPDATE coffee_beans 
SET buying_price_currency = 'USD' 
WHERE buying_price_currency IS NULL;

-- 8. Create a view for better data access
CREATE OR REPLACE VIEW coffee_beans_with_ratings AS
SELECT 
    cb.*,
    COALESCE(AVG(tn.overall_rating), 0) as average_rating,
    COUNT(tn.id) as rating_count
FROM coffee_beans cb
LEFT JOIN tasting_notes tn ON cb.id = tn.coffee_bean_id
GROUP BY cb.id;

-- 9. Add helpful functions
CREATE OR REPLACE FUNCTION get_freshness_status(coffee_bean_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    roast_date DATE;
    days_old INTEGER;
BEGIN
    SELECT cb.roast_date INTO roast_date
    FROM coffee_beans cb
    WHERE cb.id = coffee_bean_id;
    
    IF roast_date IS NULL THEN
        RETURN 'Unknown';
    END IF;
    
    days_old = CURRENT_DATE - roast_date;
    
    CASE 
        WHEN days_old <= 7 THEN RETURN 'Very Fresh';
        WHEN days_old <= 14 THEN RETURN 'Fresh';
        WHEN days_old <= 30 THEN RETURN 'Good';
        WHEN days_old <= 60 THEN RETURN 'Acceptable';
        ELSE RETURN 'Stale';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 10. Grant necessary permissions
GRANT SELECT ON coffee_beans_with_ratings TO authenticated;
GRANT EXECUTE ON FUNCTION get_freshness_status(INTEGER) TO authenticated;

-- Success message
SELECT 'Database schema fixes completed successfully!' as status; 
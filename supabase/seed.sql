-- Insert sample coffee beans
INSERT INTO coffee_beans (name, origin, roast_level, process_method, altitude, varietal, description, price_per_lb, supplier) VALUES
('Ethiopian Yirgacheffe', 'Ethiopia', 'Light', 'Washed', '1750-2200m', 'Heirloom', 'Bright and floral with citrus notes and jasmine aroma', 18.50, 'Local Roaster'),
('Colombian Supremo', 'Colombia', 'Medium', 'Washed', '1200-2000m', 'Arabica', 'Balanced with caramel sweetness and nutty undertones', 16.75, 'Coffee Co.'),
('Sumatra Mandheling', 'Indonesia', 'Dark', 'Semi-washed', '1100-1300m', 'Typica', 'Full-bodied with earthy notes and low acidity', 17.25, 'Bean Source'),
('Guatemala Antigua', 'Guatemala', 'Medium-Dark', 'Washed', '1500-1700m', 'Bourbon', 'Rich with chocolate notes and bright acidity', 19.00, 'Artisan Coffee'),
('Kenya AA', 'Kenya', 'Medium', 'Washed', '1400-2000m', 'SL-28, SL-34', 'Bright and complex with berry notes and wine-like acidity', 20.50, 'Premium Imports');

-- Insert sample inventory (converted to grams: 1 lb = 453.592g)
INSERT INTO inventory (coffee_bean_id, quantity_grams, storage_location, purchase_date, roast_date, expiry_date) VALUES
(1, 1134, 'Pantry Shelf A', '2024-01-15', '2024-01-10', '2024-04-10'),
(2, 454, 'Freezer', '2024-01-20', '2024-01-18', '2024-04-18'),
(3, 1361, 'Pantry Shelf B', '2024-01-25', '2024-01-22', '2024-04-22'),
(4, 680, 'Pantry Shelf A', '2024-02-01', '2024-01-28', '2024-04-28'),
(5, 907, 'Freezer', '2024-02-05', '2024-02-01', '2024-05-01');

-- Insert sample tasting notes
INSERT INTO tasting_notes (coffee_bean_id, brew_method, grind_size, water_temp, brew_time, aroma_rating, acidity_rating, body_rating, flavor_rating, aftertaste_rating, overall_rating, notes, tasting_date) VALUES
(1, 'Pour Over', 'Medium-Fine', 200, 240, 8, 7, 6, 8, 7, 8, 'Excellent brightness and floral notes. Very clean finish.', '2024-01-20'),
(2, 'French Press', 'Coarse', 195, 300, 7, 6, 7, 7, 6, 7, 'Good balance of sweetness and body. Classic Colombian profile.', '2024-01-25'),
(3, 'Espresso', 'Fine', 200, 30, 6, 4, 8, 7, 6, 7, 'Full-bodied with earthy notes. Low acidity as expected.', '2024-01-30'),
(4, 'Pour Over', 'Medium', 200, 240, 8, 7, 7, 8, 7, 8, 'Rich chocolate notes with bright acidity. Excellent complexity.', '2024-02-05'),
(5, 'Pour Over', 'Medium-Fine', 200, 240, 9, 8, 6, 9, 8, 9, 'Exceptional brightness and berry notes. Wine-like acidity.', '2024-02-10');

-- Insert sample brewing schedules
INSERT INTO brewing_schedule (coffee_bean_id, scheduled_date, scheduled_time, brew_method, grind_size, water_temp, brew_time, notes, status) VALUES
(1, CURRENT_DATE, '08:00', 'Pour Over', 'Medium-Fine', 200, 240, 'Morning coffee - try with slightly cooler water', 'planned'),
(2, CURRENT_DATE, '14:00', 'French Press', 'Coarse', 195, 300, 'Afternoon pick-me-up', 'planned'),
(3, CURRENT_DATE + 1, '09:00', 'Espresso', 'Fine', 200, 30, 'Weekend espresso session', 'planned'),
(4, CURRENT_DATE + 2, '07:30', 'Pour Over', 'Medium', 200, 240, 'Early morning brew', 'planned'),
(5, CURRENT_DATE - 1, '10:00', 'Pour Over', 'Medium-Fine', 200, 240, 'Yesterday brew - completed', 'completed'); 
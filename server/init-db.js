const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'coffee.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Initializing Coffee Bean Database...');

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Coffee Beans table
      db.run(`
        CREATE TABLE IF NOT EXISTS coffee_beans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          origin TEXT,
          roast_level TEXT CHECK(roast_level IN ('Light', 'Medium', 'Medium-Dark', 'Dark')),
          process_method TEXT,
          altitude TEXT,
          varietal TEXT,
          description TEXT,
          price_per_lb REAL,
          supplier TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inventory table
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coffee_bean_id INTEGER,
          quantity_lbs REAL DEFAULT 0,
          purchase_date DATE,
          roast_date DATE,
          expiry_date DATE,
          storage_location TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (coffee_bean_id) REFERENCES coffee_beans (id)
        )
      `);

      // Tasting Notes table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasting_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coffee_bean_id INTEGER,
          brew_method TEXT,
          grind_size TEXT,
          water_temp REAL,
          brew_time INTEGER,
          aroma_rating INTEGER CHECK(aroma_rating BETWEEN 1 AND 10),
          acidity_rating INTEGER CHECK(acidity_rating BETWEEN 1 AND 10),
          body_rating INTEGER CHECK(body_rating BETWEEN 1 AND 10),
          flavor_rating INTEGER CHECK(flavor_rating BETWEEN 1 AND 10),
          aftertaste_rating INTEGER CHECK(aftertaste_rating BETWEEN 1 AND 10),
          overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 10),
          notes TEXT,
          tasting_date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (coffee_bean_id) REFERENCES coffee_beans (id)
        )
      `);

      // Sample data
      db.run(`
        INSERT OR IGNORE INTO coffee_beans (name, origin, roast_level, process_method, altitude, varietal, description, price_per_lb, supplier) VALUES
        ('Ethiopian Yirgacheffe', 'Ethiopia', 'Light', 'Washed', '1750-2200m', 'Heirloom', 'Bright and floral with citrus notes and jasmine aroma', 18.50, 'Local Roaster'),
        ('Colombian Supremo', 'Colombia', 'Medium', 'Washed', '1200-2000m', 'Arabica', 'Balanced with caramel sweetness and nutty undertones', 16.75, 'Coffee Co.'),
        ('Sumatra Mandheling', 'Indonesia', 'Dark', 'Semi-washed', '1100-1300m', 'Typica', 'Full-bodied with earthy notes and low acidity', 17.25, 'Bean Source')
      `, (err) => {
        if (err) {
          console.error('Error inserting sample data:', err);
          reject(err);
        } else {
          console.log('✅ Sample coffee beans added');
        }
      });

      db.run(`
        INSERT OR IGNORE INTO inventory (coffee_bean_id, quantity_lbs, purchase_date, roast_date, storage_location) VALUES
        (1, 2.5, '2024-01-15', '2024-01-10', 'Pantry'),
        (2, 1.0, '2024-01-20', '2024-01-18', 'Freezer'),
        (3, 3.0, '2024-01-25', '2024-01-22', 'Pantry')
      `, (err) => {
        if (err) {
          console.error('Error inserting inventory data:', err);
          reject(err);
        } else {
          console.log('✅ Sample inventory added');
        }
      });

      db.run(`
        INSERT OR IGNORE INTO tasting_notes (coffee_bean_id, brew_method, grind_size, water_temp, brew_time, aroma_rating, acidity_rating, body_rating, flavor_rating, aftertaste_rating, overall_rating, notes) VALUES
        (1, 'Pour Over', 'Medium-Fine', 200, 240, 9, 8, 6, 9, 8, 8, 'Excellent floral aroma, bright citrus acidity, clean finish'),
        (2, 'French Press', 'Coarse', 195, 300, 7, 6, 8, 7, 7, 7, 'Good body, balanced acidity, nutty notes'),
        (3, 'Espresso', 'Fine', 200, 30, 6, 4, 9, 8, 7, 7, 'Full-bodied, earthy, low acidity, good for espresso')
      `, (err) => {
        if (err) {
          console.error('Error inserting tasting data:', err);
          reject(err);
        } else {
          console.log('✅ Sample tasting notes added');
          resolve();
        }
      });
    });
  });
};

createTables()
  .then(() => {
    console.log('🎉 Database initialization complete!');
    console.log('📊 Tables created: coffee_beans, inventory, tasting_notes');
    console.log('🌱 Sample data inserted');
    db.close();
  })
  .catch((err) => {
    console.error('❌ Database initialization failed:', err);
    db.close();
    process.exit(1);
  }); 
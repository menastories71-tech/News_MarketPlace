const fs = require('fs');
const path = require('path');

// Use the same migration runner logic but run only our specific migration
require('dotenv').config();
const { Pool } = require('pg');

const migrationPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const migrationQuery = async (text, params) => {
  const start = Date.now();
  try {
    const res = await migrationPool.query(text, params);
    const duration = Date.now() - start;
    console.log('Migration query executed', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Migration query error', { text: text.substring(0, 100) + '...', err: err.message });
    throw err;
  }
};

async function runSpecificMigration() {
  try {
    const filename = '055_add_radio_image_description.sql';
    const migrationsPath = path.join(__dirname, 'database/migrations');
    const filePath = path.join(migrationsPath, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`Migration file not found: ${filePath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${filename}`);

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await migrationQuery(statement.trim());
          console.log('✅ Statement executed successfully');
        } catch (error) {
          // If it's an "already exists" error, continue
          if (error.code === '42710' || error.code === '42P07') {
            console.log(`⚠️  Skipping duplicate: ${error.message.split('"')[1] || 'unknown'}`);
            continue;
          }
          console.error('❌ Statement failed:', error.message);
          throw error;
        }
      }
    }

    console.log(`✅ Migration ${filename} completed successfully`);
    
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    process.exit(1);
  } finally {
    await migrationPool.end();
  }
}

runSpecificMigration()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
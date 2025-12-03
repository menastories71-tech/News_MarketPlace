const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function runSpecificMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: 055_add_radio_image_description.sql');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database/migrations/055_add_radio_image_description.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim());
        await client.query(statement.trim());
      }
    }
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSpecificMigration()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
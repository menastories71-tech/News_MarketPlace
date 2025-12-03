require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function runMigration056() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration: 056_create_paparazzi_creations_table.sql');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database/migrations/056_create_paparazzi_creations_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL loaded successfully');
    console.log('Executing migration...');
    
    // Execute the entire migration as a single transaction
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration 056 completed successfully');
    console.log('📋 paparazzi_creations table created with:');
    console.log('   - id (SERIAL PRIMARY KEY)');
    console.log('   - instagram_page_name (VARCHAR(255))');
    console.log('   - no_of_followers (INTEGER)');
    console.log('   - region_focused (VARCHAR(255))');
    console.log('   - category (VARCHAR(255) with CHECK constraint)');
    console.log('   - instagram_url (VARCHAR(500))');
    console.log('   - profile_dp_logo (VARCHAR(500))');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    console.log('   - Trigger: update_paparazzi_creations_updated_at');
    console.log('   - Indexes: idx_paparazzi_creations_category, idx_paparazzi_creations_created_at');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration056()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function runSpecificMigration() {
  const migrationNumber = process.argv[2];
  if (!migrationNumber) {
    console.error('Usage: node run_specific_migration.js <migration_number>');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    const migrationFileName = `${migrationNumber.padStart(3, '0')}_*.sql`;
    const migrationDir = path.join(__dirname, 'database/migrations');

    // Find the migration file
    const files = fs.readdirSync(migrationDir);
    const migrationFile = files.find(file => file.startsWith(`${migrationNumber}_`));

    if (!migrationFile) {
      console.error(`Migration file for ${migrationNumber} not found`);
      process.exit(1);
    }

    console.log(`Running migration: ${migrationFile}`);

    // Read the migration file
    const migrationPath = path.join(migrationDir, migrationFile);
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
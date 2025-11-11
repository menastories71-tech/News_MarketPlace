const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function createPublicationsTable() {
  // Remote database configuration
  const pool = new Pool({
    host: '72.60.108.85',
    port: 5432,
    database: 'newsmarketplace',
    user: 'newsmarketplace',
    password: 'Advocate@vandan@28'
  });

  try {
    console.log('Connecting to remote PostgreSQL database...');
    await pool.connect();
    console.log('✅ Connected successfully');

    // Read the publications table migration file
    const migrationPath = path.join(__dirname, 'database/migrations/007_create_publications_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // First create the update_updated_at_column function if it doesn't exist
    const functionSql = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    await pool.query(functionSql);
    console.log('✅ update_updated_at_column function created/updated');

    console.log('Running publications table migration...');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await pool.query(statement);
      }
    }

    console.log('✅ Publications table created successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the script
createPublicationsTable()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
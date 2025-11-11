require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a separate pool for migrations to avoid conflicts
const migrationPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5, // Smaller pool for migrations
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Migration query helper
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

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../database/migrations');
  }

  // Get all migration files
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort by filename (001, 002, etc.)
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      return [];
    }
  }

  // Run a single migration
  async runMigration(filename) {
    const filePath = path.join(this.migrationsPath, filename);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Running migration: ${filename}`);

      // Split by semicolon but handle multi-line statements properly
      const statements = [];
      let currentStatement = '';
      let inDollarQuote = false;
      let dollarQuoteStart = '';

      const lines = sql.split('\n');

      for (const line of lines) {
        currentStatement += line + '\n';

        // Check for dollar quoting
        if (line.includes('$$')) {
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarQuoteStart = '$$';
          } else if (line.includes('$$')) {
            inDollarQuote = false;
          }
        }

        // If we hit a semicolon and we're not in a dollar-quoted string, this is a complete statement
        if (line.trim().endsWith(';') && !inDollarQuote) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      }

      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await migrationQuery(statement);
          } catch (error) {
            // If it's an "already exists" error, continue (idempotent migrations)
            if (error.code === '42710' || error.code === '42P07') { // 42710 = duplicate object, 42P07 = duplicate table
              console.log(`⚠️  Skipping duplicate object: ${error.message.split('"')[1] || 'unknown'}`);
              continue;
            }
            throw error;
          }
        }
      }

      console.log(`✅ Migration ${filename} completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Migration ${filename} failed:`, error);
      throw error;
    }
  }

  // Run all migrations
  async runAllMigrations() {
    const migrationFiles = this.getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration(s) to run`);

    for (const filename of migrationFiles) {
      try {
        await this.runMigration(filename);
      } catch (error) {
        console.error(`Migration failed at ${filename}, stopping...`);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  }

  // Create migration table to track applied migrations (optional enhancement)
  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await migrationQuery(sql);
  }

  // Cleanup migration pool
  async close() {
    await migrationPool.end();
  }
}

module.exports = new MigrationRunner();
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration: Create orders table');

    const sql = `
      -- Create orders table for call booking requests
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        publication_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        customer_message TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
        admin_notes TEXT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index on status for faster queries
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

      -- Create index on publication_id for faster queries
      CREATE INDEX IF NOT EXISTS idx_orders_publication_id ON orders(publication_id);

      -- Create index on created_at for faster queries
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `;

    await client.query(sql);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
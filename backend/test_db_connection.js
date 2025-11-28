require('dotenv').config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    
    const db = require('./src/config/database');
    
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const testResult = await db.query('SELECT NOW() as current_time');
    console.log('✅ Basic connection successful:', testResult.rows[0]);
    
    // Test groups table
    console.log('\n2. Testing groups table...');
    const groupsResult = await db.query('SELECT COUNT(*) as count FROM groups');
    console.log('✅ Groups table accessible, count:', groupsResult.rows[0].count);
    
    // Test publications table
    console.log('\n3. Testing publications table...');
    const pubsResult = await db.query('SELECT COUNT(*) as count FROM publications');
    console.log('✅ Publications table accessible, count:', pubsResult.rows[0].count);
    
    // Show table structure
    console.log('\n4. Checking groups table structure...');
    const groupsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'groups' 
      ORDER BY ordinal_position
    `);
    console.log('Groups columns:', groupsSchema.rows);
    
    console.log('\n5. Checking publications table structure...');
    const pubsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'publications' 
      ORDER BY ordinal_position
    `);
    console.log('Publications columns:', pubsSchema.rows);
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
}

testDatabaseConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

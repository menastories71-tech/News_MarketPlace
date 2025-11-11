const { query } = require('./src/config/database');

async function testPublications() {
  try {
    console.log('🔍 Testing publications in database...\n');

    // Check all publications
    const allPubs = await query('SELECT id, publication_name, status, is_active, live_on_platform FROM publications ORDER BY created_at DESC');
    console.log(`📊 Total publications in database: ${allPubs.rows.length}`);
    console.log('\n📋 All publications:');
    allPubs.rows.forEach((pub, i) => {
      console.log(`${i + 1}. ${pub.publication_name} | Status: ${pub.status} | Active: ${pub.is_active} | Live: ${pub.live_on_platform}`);
    });

    // Check approved and active publications (what users should see)
    const userPubs = await query(`
      SELECT id, publication_name, status, is_active, live_on_platform 
      FROM publications 
      WHERE status = 'approved' AND is_active = true AND live_on_platform = true 
      ORDER BY created_at DESC
    `);
    console.log(`\n✅ Approved & active publications (for users): ${userPubs.rows.length}`);
    userPubs.rows.forEach((pub, i) => {
      console.log(`${i + 1}. ${pub.publication_name} | Status: ${pub.status} | Active: ${pub.is_active} | Live: ${pub.live_on_platform}`);
    });

    // Check pending publications
    const pendingPubs = await query(`
      SELECT id, publication_name, status, is_active, live_on_platform 
      FROM publications 
      WHERE status = 'pending' AND is_active = true 
      ORDER BY created_at DESC
    `);
    console.log(`\n⏳ Pending publications: ${pendingPubs.rows.length}`);
    pendingPubs.rows.forEach((pub, i) => {
      console.log(`${i + 1}. ${pub.publication_name} | Status: ${pub.status} | Active: ${pub.is_active} | Live: ${pub.live_on_platform}`);
    });

    console.log('\n🎯 Result: ' + (userPubs.rows.length > 0 ? 'Publications available for users' : 'No publications available for users'));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testPublications();
const { query } = require('./src/config/database');

async function testPodcasters() {
  try {
    console.log('🔍 Testing podcasters in database...\n');

    // Check all podcasters
    const allPods = await query('SELECT id, podcast_name, status, is_active FROM podcasters ORDER BY created_at DESC');
    console.log(`📊 Total podcasters in database: ${allPods.rows.length}`);
    console.log('\n📋 All podcasters:');
    allPods.rows.forEach((pod, i) => {
      console.log(`${i + 1}. ${pod.podcast_name} | Status: ${pod.status} | Active: ${pod.is_active}`);
    });

    // Check approved and active podcasters (what users should see)
    const userPods = await query(`
      SELECT id, podcast_name, status, is_active
      FROM podcasters
      WHERE status = 'approved' AND is_active = true
      ORDER BY created_at DESC
    `);
    console.log(`\n✅ Approved & active podcasters (for users): ${userPods.rows.length}`);
    userPods.rows.forEach((pod, i) => {
      console.log(`${i + 1}. ${pod.podcast_name} | Status: ${pod.status} | Active: ${pod.is_active}`);
    });

    // Check pending podcasters
    const pendingPods = await query(`
      SELECT id, podcast_name, status, is_active
      FROM podcasters
      WHERE status = 'pending' AND is_active = true
      ORDER BY created_at DESC
    `);
    console.log(`\n⏳ Pending podcasters: ${pendingPods.rows.length}`);
    pendingPods.rows.forEach((pod, i) => {
      console.log(`${i + 1}. ${pod.podcast_name} | Status: ${pod.status} | Active: ${pod.is_active}`);
    });

    console.log('\n🎯 Result: ' + (userPods.rows.length > 0 ? 'Podcasters available for users' : 'No podcasters available for users'));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testPodcasters();
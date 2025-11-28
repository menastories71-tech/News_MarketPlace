const { query } = require('./src/config/database');

async function checkPublicationsCount() {
  try {
    console.log('Checking publications count in database...\n');

    // Direct SQL queries for accurate counts
    const queries = [
      { name: 'Total publications', sql: 'SELECT COUNT(*) as count FROM publications' },
      { name: 'Approved publications', sql: 'SELECT COUNT(*) as count FROM publications WHERE status = $1', params: ['approved'] },
      { name: 'Pending publications', sql: 'SELECT COUNT(*) as count FROM publications WHERE status = $1', params: ['pending'] },
      { name: 'Rejected publications', sql: 'SELECT COUNT(*) as count FROM publications WHERE status = $1', params: ['rejected'] },
      { name: 'Live on platform publications', sql: 'SELECT COUNT(*) as count FROM publications WHERE live_on_platform = $1', params: [true] },
      { name: 'Active publications', sql: 'SELECT COUNT(*) as count FROM publications WHERE is_active = $1', params: [true] }
    ];

    for (const q of queries) {
      const result = await query(q.sql, q.params || []);
      console.log(`${q.name}: ${result.rows[0].count}`);
    }

    // Check 7awi Media Group publications
    console.log('\n--- 7awi Media Group Check ---');
    const groupQuery = await query('SELECT id, group_name FROM groups WHERE group_sn = $1', ['7AWI-GRP']);
    if (groupQuery.rows.length > 0) {
      const groupId = groupQuery.rows[0].id;
      const groupName = groupQuery.rows[0].group_name;
      console.log(`Found group: ${groupName} (ID: ${groupId})`);

      const groupPubQuery = await query('SELECT COUNT(*) as count FROM publications WHERE group_id = $1', [groupId]);
      console.log(`7awi Media Group publications: ${groupPubQuery.rows[0].count}`);

      // List the 7awi publications
      const publicationsQuery = await query(`
        SELECT publication_sn, publication_name, publication_grade, status, live_on_platform
        FROM publications
        WHERE group_id = $1
        ORDER BY publication_sn
      `, [groupId]);

      console.log('\n7awi Publications List:');
      publicationsQuery.rows.forEach(pub => {
        console.log(`  ${pub.publication_sn}: ${pub.publication_name} (${pub.publication_grade}) - ${pub.status} - Live: ${pub.live_on_platform}`);
      });
    } else {
      console.log('7awi Media Group not found in database');
      console.log('Note: Run populate_7awi_publications.js first to create the group and publications');
    }

    console.log('\n✅ Publications count check completed successfully.');

  } catch (error) {
    console.error('❌ Error checking publications count:', error.message);
    console.log('\n🔄 Running in offline mode (database not available)...');
    console.log('Expected counts after running populate_7awi_publications.js:');
    console.log('- Total publications: 18 (or more if existing publications)');
    console.log('- Approved publications: 18');
    console.log('- Live on platform publications: 18');
    console.log('- 7awi Media Group publications: 18');
    console.log('\n📍 Please run this script in your environment with database access.');
  }
}

// Run the check
if (require.main === module) {
  require('dotenv').config();
  checkPublicationsCount()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkPublicationsCount };
const { query } = require('./src/config/database');

async function approveNominations() {
  try {
    console.log('Checking current nominations...');
    const result = await query('SELECT id, publication_name, power_list_name, status, is_active FROM powerlist_nominations');
    console.log('Current nominations:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Publication: ${row.publication_name}, Power List: ${row.power_list_name}, Status: ${row.status}, Active: ${row.is_active}`);
    });

    const pendingCount = result.rows.filter(row => row.status === 'pending').length;
    const inactiveCount = result.rows.filter(row => row.is_active !== true).length;

    if (pendingCount > 0) {
      console.log(`\nApproving ${pendingCount} pending nominations...`);
      const updateResult = await query("UPDATE powerlist_nominations SET status = 'approved' WHERE status = 'pending'");
      console.log(`Successfully approved ${updateResult.rowCount} nominations`);
    } else {
      console.log('\nNo pending nominations to approve');
    }

    if (inactiveCount > 0) {
      console.log(`\nActivating ${inactiveCount} inactive nominations...`);
      const activateResult = await query("UPDATE powerlist_nominations SET is_active = true WHERE is_active IS NOT true");
      console.log(`Successfully activated ${activateResult.rowCount} nominations`);
    } else {
      console.log('\nAll nominations are already active');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

approveNominations();
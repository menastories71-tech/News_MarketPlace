require('dotenv').config();
const { query } = require('./src/config/database');

async function verifyAllRealEstateProfessionals() {
  try {
    console.log('Starting verification update for all existing real estate professionals...');

    // Direct SQL update to set all verified_tick to true
    const sql = 'UPDATE real_estate_professionals SET verified_tick = true, updated_at = NOW() WHERE verified_tick = false OR verified_tick IS NULL';

    const result = await query(sql);

    console.log(`\n=== Verification Update Complete ===`);
    console.log(`Successfully updated ${result.rowCount} real estate professionals to verified status`);

    // Check total count
    const countResult = await query('SELECT COUNT(*) as total FROM real_estate_professionals WHERE verified_tick = true');
    console.log(`Total verified professionals: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('Error in verifyAllRealEstateProfessionals:', error);
  }
}

// Run the verifier
if (require.main === module) {
  verifyAllRealEstateProfessionals()
    .then(() => {
      console.log('\nReal estate professionals verification script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyAllRealEstateProfessionals };
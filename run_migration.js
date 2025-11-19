const migrationRunner = require('./backend/src/utils/migrationRunner');

async function runMigration() {
  try {
    await migrationRunner.runMigration('044_add_enable_columns_to_events.sql');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await migrationRunner.close();
  }
}

runMigration();
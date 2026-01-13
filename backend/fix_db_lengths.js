require('dotenv').config();
const db = require('./src/config/database');

async function fixLengths() {
    try {
        console.log('Updating column lengths...');
        await db.query(`
            ALTER TABLE publication_managements
            ALTER COLUMN instagram TYPE VARCHAR(1000),
            ALTER COLUMN facebook TYPE VARCHAR(1000),
            ALTER COLUMN twitter TYPE VARCHAR(1000),
            ALTER COLUMN linkedin TYPE VARCHAR(1000)
        `);
        console.log('Columns updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating columns:', err.message);
        process.exit(1);
    }
}
fixLengths();

require('dotenv').config();
const PublicationManagement = require('./src/models/PublicationManagement');

async function updateWordLimits() {
  try {
    console.log('Starting word limit update for existing publication management records...');

    // Get all existing records
    const allRecords = await PublicationManagement.findAll();

    console.log(`Found ${allRecords.length} records to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const record of allRecords) {
      try {
        // Set word limits based on publication type and name
        let wordLimit = 1000; // default

        const name = record.publication_name.toLowerCase();
        const focus = (record.publication_primary_focus || '').toLowerCase();

        // Newspapers - shorter articles
        if (name.includes('times') || name.includes('daily') || name.includes('tribune') ||
            name.includes('news') || name.includes('gazette') || name.includes('herald') ||
            name.includes('post') || name.includes('chronicle') || name.includes('bulletin')) {
          wordLimit = 600;
        }
        // Business/Finance publications
        else if (focus.includes('business') || focus.includes('finance') || focus.includes('trade') ||
                 focus.includes('economy') || name.includes('business') || name.includes('finance')) {
          wordLimit = 1200;
        }
        // Tech publications
        else if (focus.includes('tech') || name.includes('tech') || name.includes('cio') ||
                 name.includes('digital') || name.includes('technology')) {
          wordLimit = 1500;
        }
        // Lifestyle/Magazine publications
        else if (focus.includes('lifestyle') || name.includes('magazine') || name.includes('about') ||
                 name.includes('list') || name.includes('lovin')) {
          wordLimit = 1300;
        }
        // Healthcare publications
        else if (focus.includes('healthcare') || focus.includes('health') || name.includes('health')) {
          wordLimit = 1100;
        }
        // Construction/Real Estate
        else if (focus.includes('construction') || focus.includes('real estate') || name.includes('construction')) {
          wordLimit = 1000;
        }
        // High-profile publications (Al Jazeera, Al Arabiya, etc.)
        else if (name.includes('al jazeera') || name.includes('al arabiya') || name.includes('the national') ||
                 name.includes('arab news') || name.includes('ashraq al awsat')) {
          wordLimit = 1400;
        }
        // Premium publications with higher prices
        else if (record.price_usd > 5000) {
          wordLimit = 1600;
        }
        // Mid-range publications
        else if (record.price_usd > 2000) {
          wordLimit = 1200;
        }
        // Lower cost publications
        else if (record.price_usd < 1000) {
          wordLimit = 800;
        }

        await record.update({ word_limit: wordLimit });
        updatedCount++;
        console.log(`Updated ${record.publication_name}: word_limit = ${wordLimit}`);
      } catch (error) {
        console.error(`Error updating ${record.publication_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== Update Complete ===`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error in updateWordLimits:', error);
  }
}

// Run the updater
if (require.main === module) {
  updateWordLimits()
    .then(() => {
      console.log('\nWord limit update script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateWordLimits };
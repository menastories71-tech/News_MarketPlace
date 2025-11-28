// Load environment variables first
require('dotenv').config();

const { Pool } = require('pg');

// Create direct database connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Override the database query function to use our pool
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error', { text: text.substring(0, 50) + '...', err: err.message });
    throw err;
  }
};

const Publication = require('./src/models/Publication');
const Group = require('./src/models/Group');

// 7awi Media Group publications data
const PUBLICATIONS_DATA = [
  {
    publication_sn: 1,
    publication_grade: 'A+',
    publication_name: 'Arabs Turbo',
    publication_website: 'https://www.arabsturbo.com/',
    publication_price: 100,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: 'Automobile',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: 500,
    no_of_images: null,
    do_follow_link: true,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 2,
    publication_grade: 'A',
    publication_name: 'RA2EJ',
    publication_website: 'https://www.ra2ej.com/',
    publication_price: 200,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 3,
    publication_grade: 'B+',
    publication_name: 'Babonej',
    publication_website: 'https://www.babonej.com/',
    publication_price: 300,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 4,
    publication_grade: 'B',
    publication_name: 'Al Qiyady',
    publication_website: 'https://www.alqiyady.com/',
    publication_price: 400,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 5,
    publication_grade: 'C+',
    publication_name: 'Layalina',
    publication_website: 'https://www.layalina.com/',
    publication_price: 500,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 6,
    publication_grade: 'C',
    publication_name: 'INC Arabia',
    publication_website: 'https://en.incarabia.com/',
    publication_price: 600,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 7,
    publication_grade: 'D',
    publication_name: 'INC Arabia',
    publication_website: 'https://www.incarabia.com/',
    publication_price: 700,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 8,
    publication_grade: 'D',
    publication_name: 'Tajuki',
    publication_website: 'https://www.tajuki.com/',
    publication_price: 800,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 9,
    publication_grade: 'D',
    publication_name: 'Sa2eh',
    publication_website: 'https://www.sa2eh.com/',
    publication_price: 900,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 10,
    publication_grade: 'D',
    publication_name: 'Yummy Layalina',
    publication_website: 'https://yummy.layalina.com/',
    publication_price: 1000,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 11,
    publication_grade: 'D',
    publication_name: 'Layalina Privee',
    publication_website: 'https://layalinaprivee.com/',
    publication_price: 1100,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 12,
    publication_grade: 'D',
    publication_name: 'Arab Gamerz',
    publication_website: 'https://arabgamerz.com/',
    publication_price: 1200,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'Arabic',
    publication_region: 'Middle East',
    publication_primary_industry: '',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 13,
    publication_grade: 'D',
    publication_name: 'UAE Moments',
    publication_website: 'https://www.uaemoments.com/',
    publication_price: 1300,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 14,
    publication_grade: 'D',
    publication_name: 'Oman Moments',
    publication_website: 'https://www.omanmoments.com/',
    publication_price: 1400,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 15,
    publication_grade: 'D',
    publication_name: 'Bahrain Moments',
    publication_website: 'https://www.bahrainmoments.com/',
    publication_price: 1500,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 16,
    publication_grade: 'D',
    publication_name: 'Saudi Moments',
    publication_website: 'https://www.saudimoments.com/',
    publication_price: 1600,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East / GCC / Saudi',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 17,
    publication_grade: 'D',
    publication_name: 'Kuwait Moments',
    publication_website: 'https://www.kuwaitmoments.com/',
    publication_price: 1700,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East / GCC / Kuwait',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  },
  {
    publication_sn: 18,
    publication_grade: 'D',
    publication_name: 'Qatar Moments',
    publication_website: 'https://www.qatarmoments.com/',
    publication_price: 1800,
    agreement_tat: 10,
    practical_tat: 5,
    publication_socials_icons: '',
    publication_language: 'English',
    publication_region: 'Middle East / GCC / Qatar',
    publication_primary_industry: 'Local News and Guide',
    website_news_index: '',
    da: null,
    dr: null,
    sponsored_or_not: false,
    words_limit: null,
    no_of_images: null,
    do_follow_link: false,
    example_link: '',
    excluding_categories: '',
    other_remarks: '',
    hot_deals: '',
    live_on_platform: true,
    status: 'approved'
  }
];

// First create group, then publications
async function populate7awiPublications() {
  try {
    console.log('Starting 7awi Media Group population...');

    // Test database connection
    console.log('Testing database connection...');
    console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    const testResult = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', testResult.rows[0]);

    let successCount = 0;
    let errorCount = 0;

    // Step 1: Create or find the group
    console.log('\nStep 1: Creating/finding 7awi Media Group...');
    let group = await findGroupBySN('7AWI-GRP');
    
    if (!group) {
      console.log('7awi Media Group not found, creating it...');
      group = await createGroup({
        group_sn: '7AWI-GRP',
        group_name: '7awi Media Group',
        group_location: 'Dubai, UAE',
        group_website: 'https://7awi.com/',
        group_linkedin: 'https://www.linkedin.com/company/7awimediagroup/',
        group_instagram: 'https://www.instagram.com/7awimediagroup/'
      });
      console.log(`✅ Created group: ${group.group_name} (ID: ${group.id})`);
    } else {
      console.log(`✅ Found existing group: ${group.group_name} (ID: ${group.id})`);
    }

    // Step 2: Create publications
    console.log('\nStep 2: Creating publications...');

    for (const [index, publicationData] of PUBLICATIONS_DATA.entries()) {
      try {
        console.log(`\n[${index + 1}/${PUBLICATIONS_DATA.length}] Processing: ${publicationData.publication_name}`);

        // Check if publication already exists
        const existing = await findPublicationBySN(`7AWI-${String(publicationData.publication_sn).padStart(3, '0')}`);
        if (existing) {
          console.log(`   Publication already exists, skipping...`);
          continue;
        }

        // Create publication
        const createdPub = await createPublication({
          group_id: group.id,
          publication_sn: `7AWI-${String(publicationData.publication_sn).padStart(3, '0')}`,
          publication_grade: publicationData.publication_grade,
          publication_name: publicationData.publication_name,
          publication_website: publicationData.publication_website,
          publication_price: publicationData.publication_price,
          agreement_tat: publicationData.agreement_tat,
          practical_tat: publicationData.practical_tat,
          publication_socials_icons: publicationData.publication_socials_icons || '',
          publication_language: publicationData.publication_language,
          publication_region: publicationData.publication_region,
          publication_primary_industry: publicationData.publication_primary_industry || '',
          website_news_index: publicationData.website_news_index || '',
          da: publicationData.da,
          dr: publicationData.dr,
          sponsored_or_not: publicationData.sponsored_or_not || false,
          words_limit: publicationData.words_limit,
          word_limit: publicationData.words_limit || 500,
          number_of_images: publicationData.no_of_images,
          do_follow_link: publicationData.do_follow_link || false,
          example_link: publicationData.example_link || '',
          excluding_categories: publicationData.excluding_categories || '',
          other_remarks: publicationData.other_remarks || '',
          tags_badges: publicationData.hot_deals || '',
          live_on_platform: publicationData.live_on_platform || false,
          status: publicationData.status || 'approved'
        });

        successCount++;
        console.log(`   ✅ Created: ${publicationData.publication_name} (ID: ${createdPub.id})`);
        
      } catch (error) {
        console.error(`   ❌ Error creating ${publicationData.publication_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Population complete. Success: ${successCount}, Errors: ${errorCount}`);
    
    // Display final summary
    console.log('\n📊 Final Summary:');
    console.log(`- Group: ${group.group_name} (SN: ${group.group_sn}, ID: ${group.id})`);
    console.log(`- Publications created: ${successCount}`);
    console.log(`- Publications failed: ${errorCount}`);
    console.log(`- Total publications attempted: ${PUBLICATIONS_DATA.length}`);

  } catch (error) {
    console.error('❌ Population failed:', error.message);
    console.error('Full error details:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Helper functions using direct database queries
async function findGroupBySN(group_sn) {
  try {
    const sql = 'SELECT * FROM groups WHERE group_sn = $1';
    const result = await query(sql, [group_sn]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding group:', error.message);
    return null;
  }
}

async function createGroup(groupData) {
  try {
    const sql = `
      INSERT INTO groups (group_sn, group_name, group_location, group_website, group_linkedin, group_instagram, status, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 'approved', true)
      RETURNING *
    `;
    const values = [
      groupData.group_sn,
      groupData.group_name,
      groupData.group_location,
      groupData.group_website,
      groupData.group_linkedin,
      groupData.group_instagram
    ];
    const result = await query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating group:', error.message);
    throw error;
  }
}

async function findPublicationBySN(publication_sn) {
  try {
    const sql = 'SELECT * FROM publications WHERE publication_sn = $1';
    const result = await query(sql, [publication_sn]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding publication:', error.message);
    return null;
  }
}

async function createPublication(publicationData) {
  try {
    const sql = `
      INSERT INTO publications (
        group_id, publication_sn, publication_grade, publication_name, publication_website,
        publication_price, agreement_tat, practical_tat, publication_socials_icons,
        publication_language, publication_region, publication_primary_industry,
        website_news_index, da, dr, sponsored_or_not, words_limit, word_limit, number_of_images,
        do_follow_link, example_link, excluding_categories, other_remarks,
        tags_badges, live_on_platform, status, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, true)
      RETURNING *
    `;
    
    const values = [
      publicationData.group_id,
      publicationData.publication_sn,
      publicationData.publication_grade,
      publicationData.publication_name,
      publicationData.publication_website,
      publicationData.publication_price,
      publicationData.agreement_tat,
      publicationData.practical_tat,
      publicationData.publication_socials_icons,
      publicationData.publication_language,
      publicationData.publication_region,
      publicationData.publication_primary_industry,
      publicationData.website_news_index,
      publicationData.da,
      publicationData.dr,
      publicationData.sponsored_or_not,
      publicationData.words_limit,
      publicationData.word_limit,
      publicationData.number_of_images,
      publicationData.do_follow_link,
      publicationData.example_link,
      publicationData.excluding_categories,
      publicationData.other_remarks,
      publicationData.tags_badges,
      publicationData.live_on_platform,
      publicationData.status
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating publication:', error.message);
    console.error('Publication data:', publicationData.publication_name);
    throw error;
  }
}

// Test mode function that doesn't require database
function testPopulate7awiPublications() {
  console.log('=== TEST MODE: 7awi Media Group Publications ===');
  console.log('⚠️  IMPORTANT: Create the group first via GroupManagement.jsx');
  console.log('');
  console.log('📝 Group Details (create in GroupManagement.jsx):');
  console.log('- Group SN: 1');
  console.log('- Group Name: 7awi Media Group');
  console.log('- Location: Dubai, UAE');
  console.log('- Website: https://7awi.com/');
  console.log('- LinkedIn: https://www.linkedin.com/company/7awimediagroup/');
  console.log('- Instagram: https://www.instagram.com/7awimediagroup/');
  console.log('');

  console.log('📊 Publications to be created (18 total):');
  PUBLICATIONS_DATA.forEach((pub, index) => {
    console.log(`${index + 1}. ${pub.publication_name}`);
    console.log(`   - SN: ${pub.publication_sn}`);
    console.log(`   - Grade: ${pub.publication_grade}`);
    console.log(`   - Website: ${pub.publication_website}`);
    console.log(`   - Price: $${pub.publication_price}`);
    console.log(`   - Language: ${pub.publication_language}`);
    console.log(`   - Region: ${pub.publication_region}`);
    console.log(`   - Status: ${pub.status}`);
    console.log('');
  });

  console.log('✅ Test completed - create group first, then run script for publications.');
}

// Run the populator
if (require.main === module) {
  console.log('🚀 Starting 7awi Media Group population script...');
  console.log('This will create the group first, then all publications.');
  
  populate7awiPublications()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      console.log('Group and publications have been populated.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { populate7awiPublications };
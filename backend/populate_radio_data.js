require('dotenv').config();
const db = require('./src/config/database');
const Radio = require('./src/models/Radio');
const Group = require('./src/models/Group');

const radioData = [
  {
    sn: '1',
    owners_group_name: 'Radio Asia Network',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Radio Asia',
    frequency: '94.7',
    radio_language: 'Malayalam',
    radio_website: 'http://www.suno1024.com/',
    radio_linkedin: 'https://www.linkedin.com/company/radio-asia-network/',
    radio_instagram: 'https://www.instagram.com/radioasia947fm',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Website of Owner not available'
  },
  {
    sn: '2',
    owners_group_name: 'ARN',
    owners_group_website: 'https://arn.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Hit FM',
    frequency: '96.7',
    radio_language: 'Malayalam',
    radio_website: 'https://www.hit967.ae/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/hit967fm/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'ARN'
  },
  {
    sn: '3',
    owners_group_name: 'Mathrubhumi Group',
    owners_group_website: 'https://media.mathrubhumi.com/static/AboutMathrubhumi.html',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Club FM',
    frequency: '99.6',
    radio_language: 'Malayalam',
    radio_website: 'https://clubfm.ae/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/clubfmuae/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE\nMathrubhumi Group\nPermamently Closed'
  },
  {
    sn: '4',
    owners_group_name: 'Chanel 4Radio Network',
    owners_group_website: 'https://www.ch4.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Gold FM',
    frequency: '101.3',
    radio_language: 'Malayalam',
    radio_website: 'https://www.gold1013fm.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/gold1013fm/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Chanel 4Radio Network\nhttps://www.almuradgroup.com/'
  },
  {
    sn: '5',
    owners_group_name: 'Chanel 4Radio Network',
    owners_group_website: 'https://www.ch4.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Radio4FM',
    frequency: '89.1',
    radio_language: 'Hindi',
    radio_website: 'https://www.radio4fm.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/891radio4',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Chanel 4Radio Network\nAjman Independent Studios LLC\nhttps://www.almuradgroup.com/'
  },
  {
    sn: '6',
    owners_group_name: 'Chanel 4Radio Network',
    owners_group_website: 'https://www.ch4.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Channel 4 FM',
    frequency: '104.8',
    radio_language: 'English',
    radio_website: 'https://www.channel4fm.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/channel4dubai/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Chanel 4Radio Network\nhttps://www.almuradgroup.com/'
  },
  {
    sn: '7',
    owners_group_name: 'Chanel 4Radio Network',
    owners_group_website: 'https://www.ch4.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Al Rabia FM',
    frequency: '107.8',
    radio_language: 'Arabic',
    radio_website: 'https://www.alrabiafm.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/alrabiafm/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Chanel 4Radio Network\nhttps://www.almuradgroup.com/'
  },
  {
    sn: '9',
    owners_group_name: 'Fun ASIA Network',
    owners_group_website: 'https://www.funasianetwork.com/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Talk FM',
    frequency: '100.3',
    radio_language: 'English and Hindi',
    radio_website: 'https://talk1003.ae/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/talk100.3uae/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Fun ASIA Network'
  },
  {
    sn: '10',
    owners_group_name: 'Fun ASIA Network',
    owners_group_website: 'https://www.funasianetwork.com/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Beat FM',
    frequency: '97.8',
    radio_language: 'English',
    radio_website: 'https://beat978.com/',
    radio_linkedin: '',
    radio_instagram: 'https://instagram.com/Beatuae',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Fun ASIA Network'
  },
  {
    sn: '11',
    owners_group_name: 'Fun ASIA Network',
    owners_group_website: 'https://www.funasianetwork.com/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Big FM',
    frequency: '106.2',
    radio_language: 'Hindi',
    radio_website: 'https://big1062.com/',
    radio_linkedin: '',
    radio_instagram: 'https://instagram.com/106.2bigfm',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Fun ASIA Network\tChannel 2 Group Corporation'
  },
  {
    sn: '12',
    owners_group_name: 'Fun ASIA Network',
    owners_group_website: 'https://www.funasianetwork.com/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Luv FM',
    frequency: '107.1',
    radio_language: 'English',
    radio_website: 'https://luv1071.com/',
    radio_linkedin: '',
    radio_instagram: 'https://instagram.com/Luvradiouae',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Fun ASIA Network'
  },
  {
    sn: '13',
    owners_group_name: 'Abu Dhabi Media Network',
    owners_group_website: 'https://www.admn.ae/en/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Kadak FM',
    frequency: '88.8',
    radio_language: 'Hindi',
    radio_website: 'https://www.mirchi.ae/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/mirchi_uae/?hl=en',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Earlier it was Mirchi FM\nDolphin Recording Studio / \nEntertainment Network (India) Limited\nhttps://www.gold1013fm.com/\nAbu Dhabi Media Network'
  },
  {
    sn: '14',
    owners_group_name: 'Abu Dhabi Media Network',
    owners_group_website: 'https://www.admn.ae/en/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Star FM',
    frequency: '99.9',
    radio_language: 'Multilingual',
    radio_website: 'NA',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/starfmuae/?hl=en',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'Abu Dhabi Media Network'
  },
  {
    sn: '20',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Radio Me FM',
    frequency: '100.3',
    radio_language: 'Malyalam',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '21',
    owners_group_name: 'ARN',
    owners_group_website: 'https://arn.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Virgin Radio Dubai',
    frequency: '',
    radio_language: 'English',
    radio_website: 'https://www.virginradiodubai.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/virginradiodxb/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'ARN'
  },
  {
    sn: '22',
    owners_group_name: 'ARN',
    owners_group_website: 'https://arn.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Dubai 92 FM Radio',
    frequency: '',
    radio_language: 'English',
    radio_website: 'https://www.dubai92.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/dubai92/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'ARN'
  },
  {
    sn: '23',
    owners_group_name: 'ARN',
    owners_group_website: 'https://arn.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Dubai Eye FM',
    frequency: '103.8',
    radio_language: 'English',
    radio_website: 'https://www.dubaieye1038.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/dubaieye1038fm/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'ARN\nStation for Business People & Decision Makers 35+'
  },
  {
    sn: '24',
    owners_group_name: 'ARN',
    owners_group_website: 'https://arn.ae/',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'City 101.6 FM',
    frequency: '',
    radio_language: 'Hindi',
    radio_website: 'https://www.city1016.ae/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/city1016/?hl=en',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'ARN'
  },
  {
    sn: '26',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Radio Spice FM',
    frequency: '105.4',
    radio_language: 'Hindi',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '30',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Josh',
    frequency: '97.8',
    radio_language: '',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '31',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Hum FM',
    frequency: '',
    radio_language: '',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '32',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Dilse FM',
    frequency: '90.8',
    radio_language: '',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/dilsefm/?hl=en',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '33',
    owners_group_name: 'Not available',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Ibiza Global Radio – FM',
    frequency: '95.3',
    radio_language: '',
    radio_website: 'https://www.ibizaglobalradio.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/ibizaglobalradio/',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: ''
  },
  {
    sn: '35',
    owners_group_name: 'Not available',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Vibe',
    frequency: '105.4',
    radio_language: '',
    radio_website: 'https://vibe1054.com/',
    radio_linkedin: '',
    radio_instagram: 'https://www.instagram.com/vibefm1054',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: ''
  },
  {
    sn: '36',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'ISHQ',
    frequency: '104.8',
    radio_language: '',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE'
  },
  {
    sn: '17',
    owners_group_name: '',
    owners_group_website: '',
    owners_group_linkedin: '',
    owners_group_instagram: '',
    radio_name: 'Suno FM',
    frequency: '1024',
    radio_language: 'Hindi',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: 'IGNORE - Pakistan'
  }
];

// Helper function to find or create group
async function findOrCreateGroup(groupName, groupWebsite, groupLinkedin, groupInstagram) {
  if (!groupName || groupName.trim() === '') {
    return null;
  }

  try {
    // Check if group exists by name
    const sql = 'SELECT * FROM groups WHERE group_name = $1';
    const result = await db.query(sql, [groupName]);
    if (result.rows[0]) {
      return result.rows[0].id;
    }

    // Create new group
    const groupData = {
      group_name: groupName,
      group_website: groupWebsite || null,
      group_linkedin: groupLinkedin || null,
      group_instagram: groupInstagram || null,
      group_location: 'UAE', // Default location
      submitted_by: null,
      submitted_by_admin: null
    };

    const savedGroup = await Group.create(groupData);
    console.log(`Created group: ${savedGroup.group_name}`);
    return savedGroup.id;
  } catch (error) {
    console.error(`Error creating/finding group ${groupName}:`, error.message);
    return null;
  }
}

async function populateRadioData() {
  try {
    console.log('Starting UAE radio data population...');

    let totalSuccess = 0;
    let totalError = 0;

    console.log(`Processing ${radioData.length} radio stations...`);

    for (const radio of radioData) {
      try {
        // Check if radio already exists by radio_name
        const existing = await findRadioByName(radio.radio_name);

        if (existing) {
          console.log(`Radio ${radio.radio_name} already exists, skipping...`);
          continue;
        }

        // Find or create group
        const groupId = await findOrCreateGroup(
          radio.owners_group_name,
          radio.owners_group_website,
          radio.owners_group_linkedin,
          radio.owners_group_instagram
        );

        // Map data to existing Radio model fields
        const radioDataForModel = {
          sn: radio.sn,
          group_id: groupId,
          radio_name: radio.radio_name,
          frequency: radio.frequency || null,
          radio_language: radio.radio_language || null,
          radio_website: radio.radio_website || null,
          radio_linkedin: radio.radio_linkedin || null,
          radio_instagram: radio.radio_instagram || null,
          emirate_state: radio.emirate_state || null,
          radio_popular_rj: radio.radio_popular_rj || null,
          remarks: radio.remarks || null
        };

        const savedRadio = await Radio.create(radioDataForModel);
        console.log(`Saved radio: ${savedRadio.radio_name}`);
        totalSuccess++;

      } catch (error) {
        console.error(`Error processing radio ${radio.radio_name}:`, error.message);
        totalError++;
      }
    }

    console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    // Get final counts
    try {
      const totalResult = await db.query('SELECT COUNT(*) as count FROM radios');

      console.log(`Total radios in database: ${totalResult.rows[0].count}`);
    } catch (countError) {
      console.log('Could not get final counts:', countError.message);
    }

  } catch (error) {
    console.error('Error in populateRadioData:', error);
  }
}

// Helper function to find radio by name
async function findRadioByName(name) {
  try {
    const sql = 'SELECT * FROM radios WHERE radio_name = $1';
    const result = await db.query(sql, [name]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error checking existing radio:', error);
    return null;
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();

  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);

  async function runPopulation() {
    try {
      console.log('Starting UAE radio data population...');

      let totalSuccess = 0;
      let totalError = 0;

      console.log(`Processing ${radioData.length} radio stations...`);

      for (const radio of radioData) {
        try {
          // Check if radio already exists by radio_name
          const existing = await findRadioByName(radio.radio_name);

          if (existing) {
            console.log(`Radio ${radio.radio_name} already exists, skipping...`);
            continue;
          }

          // Find or create group
          const groupId = await findOrCreateGroup(
            radio.owners_group_name,
            radio.owners_group_website,
            radio.owners_group_linkedin,
            radio.owners_group_instagram
          );

          // Map data to existing Radio model fields
          const radioDataForModel = {
            sn: radio.sn,
            group_id: groupId,
            radio_name: radio.radio_name,
            frequency: radio.frequency || null,
            radio_language: radio.radio_language || null,
            radio_website: radio.radio_website || null,
            radio_linkedin: radio.radio_linkedin || null,
            radio_instagram: radio.radio_instagram || null,
            emirate_state: radio.emirate_state || null,
            radio_popular_rj: radio.radio_popular_rj || null,
            remarks: radio.remarks || null
          };

          await Radio.create(radioDataForModel);
          console.log(`Saved radio: ${radio.radio_name}`);
          totalSuccess++;

        } catch (error) {
          console.error(`Error processing radio ${radio.radio_name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

      // Get final counts
      try {
        const totalResult = await db.query('SELECT COUNT(*) as count FROM radios');

        console.log(`Total radios in database: ${totalResult.rows[0].count}`);
      } catch (countError) {
        console.log('Could not get final counts:', countError.message);
      }

    } catch (error) {
      console.error('Error in populateRadioData:', error);
    }
  }

  runPopulation()
    .then(() => {
      console.log('UAE Radio data population script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateRadioData };
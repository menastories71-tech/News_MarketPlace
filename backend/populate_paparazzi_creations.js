require('dotenv').config();
const PaparazziCreation = require('./src/models/PaparazziCreation');
const { query } = require('./src/config/database');

const paparazziData = [
  {
    "instagram_page_name": "Viral Bhayani",
    "no_of_followers": "14.0M*",
    "region_focused": "India",
    "category": "Entertainment and Movies, Lifestyle",
    "instagram_url": "https://www.instagram.com/viralbhayani/",
    "profile_dp_logo_url": "https://instagram.com/viralbhayani/avatar/"
  },
  {
    "instagram_page_name": "Manav Manglani",
    "no_of_followers": "7.2M*",
    "region_focused": "India",
    "category": "Entertainment and Movies, Lifestyle",
    "instagram_url": "https://www.instagram.com/manav.manglani/",
    "profile_dp_logo_url": "https://instagram.com/manav.manglani/avatar/"
  },
  {
    "instagram_page_name": "Varinder Chawla",
    "no_of_followers": "7.2M*",
    "region_focused": "India",
    "category": "Entertainment and Movies, Lifestyle",
    "instagram_url": "https://www.instagram.com/varindertchawla/",
    "profile_dp_logo_url": "https://instagram.com/varindertchawla/avatar/"
  },
  {
    "instagram_page_name": "Yogen Shah",
    "no_of_followers": "9.5M*",
    "region_focused": "India",
    "category": "Entertainment and Movies, Paparazzi",
    "instagram_url": "https://www.instagram.com/yogenshah_s/",
    "profile_dp_logo_url": "https://instagram.com/yogenshah_s/avatar/"
  },
  {
    "instagram_page_name": "Filmygyan",
    "no_of_followers": "29.0M*",
    "region_focused": "India",
    "category": "Entertainment and Movies",
    "instagram_url": "https://www.instagram.com/filmygyan/",
    "profile_dp_logo_url": "https://instagram.com/filmygyan/avatar/"
  },
  {
    "instagram_page_name": "Pinkvilla",
    "no_of_followers": "7.3M*",
    "region_focused": "India/Global",
    "category": "Entertainment and Movies, Lifestyle",
    "instagram_url": "https://www.instagram.com/pinkvilla/",
    "profile_dp_logo_url": "https://instagram.com/pinkvilla/avatar/"
  },
  {
    "instagram_page_name": "Bollywood Society",
    "no_of_followers": "3.8M*",
    "region_focused": "India",
    "category": "Entertainment and Movies",
    "instagram_url": "https://www.instagram.com/bollywoodsocietyy/",
    "profile_dp_logo_url": "https://instagram.com/bollywoodsocietyy/avatar/"
  },
  {
    "instagram_page_name": "Snehkumar Zala",
    "no_of_followers": "1.0M*",
    "region_focused": "India",
    "category": "Lifestyle, Entertainment",
    "instagram_url": "https://www.instagram.com/sneyhzala/",
    "profile_dp_logo_url": "https://instagram.com/sneyhzala/avatar/"
  },
  {
    "instagram_page_name": "Filmygalaxy",
    "no_of_followers": "4.0M*",
    "region_focused": "India",
    "category": "Entertainment and Movies",
    "instagram_url": "https://www.instagram.com/filmygalaxy/",
    "profile_dp_logo_url": "https://instagram.com/filmygalaxy/avatar/"
  },
  {
    "instagram_page_name": "Instant Bollywood",
    "no_of_followers": "36.0M*",
    "region_focused": "India",
    "category": "Entertainment and Movies",
    "instagram_url": "https://www.instagram.com/instantbollywood/",
    "profile_dp_logo_url": "https://instagram.com/instantbollywood/avatar/"
  },
  {
    "instagram_page_name": "Voompla",
    "no_of_followers": "19.0M*",
    "region_focused": "India",
    "category": "Entertainment and Movies, Lifestyle",
    "instagram_url": "https://www.instagram.com/voompla/",
    "profile_dp_logo_url": "https://instagram.com/voompla/avatar/"
  },
  {
    "instagram_page_name": "Advice",
    "no_of_followers": "13.1M*",
    "region_focused": "Global",
    "category": "Lifestyle, Motivation",
    "instagram_url": "https://www.instagram.com/advice/",
    "profile_dp_logo_url": "https://instagram.com/advice/avatar/"
  },
  {
    "instagram_page_name": "Millionaire Mentor",
    "no_of_followers": "10.1M*",
    "region_focused": "Global",
    "category": "Lifestyle, Motivation",
    "instagram_url": "https://www.instagram.com/millionaire_mentor/",
    "profile_dp_logo_url": "https://instagram.com/millionaire_mentor/avatar/"
  },
  {
    "instagram_page_name": "The Billionaire Club",
    "no_of_followers": "6.1M*",
    "region_focused": "Global",
    "category": "Lifestyle, Luxury",
    "instagram_url": "https://www.instagram.com/thebillionaireclub/",
    "profile_dp_logo_url": "https://instagram.com/thebillionaireclub/avatar/"
  },
  {
    "instagram_page_name": "Wealth",
    "no_of_followers": "6.3M*",
    "region_focused": "Global",
    "category": "Lifestyle, Finance, Motivation",
    "instagram_url": "https://www.instagram.com/wealth/",
    "profile_dp_logo_url": "https://instagram.com/wealth/avatar/"
  },
  {
    "instagram_page_name": "Luxury Lifestyle Magazine",
    "no_of_followers": "1.4M*",
    "region_focused": "Global",
    "category": "Lifestyle, Luxury",
    "instagram_url": "https://www.instagram.com/luxurylifestylemagazine/",
    "profile_dp_logo_url": "https://instagram.com/luxurylifestylemagazine/avatar/"
  },
  {
    "instagram_page_name": "Millionaire Cartel",
    "no_of_followers": "1.1M*",
    "region_focused": "Global",
    "category": "Lifestyle, Luxury",
    "instagram_url": "https://www.instagram.com/millionairecartel/",
    "profile_dp_logo_url": "https://instagram.com/millionairecartel/avatar/"
  },
  {
    "instagram_page_name": "Billionaire Classy",
    "no_of_followers": "1.1M*",
    "region_focused": "Global",
    "category": "Lifestyle, Luxury",
    "instagram_url": "https://www.instagram.com/billionaireclassy/",
    "profile_dp_logo_url": "https://instagram.com/billionaireclassy/avatar/"
  }
];

// Function to convert follower string to number
function convertFollowers(followersStr) {
  if (typeof followersStr !== 'string') return followersStr;

  // Remove asterisk and convert M to million
  let cleaned = followersStr.replace('*', '');
  let multiplier = 1;

  if (cleaned.includes('M')) {
    multiplier = 1000000;
    cleaned = cleaned.replace('M', '');
  } else if (cleaned.includes('K')) {
    multiplier = 1000;
    cleaned = cleaned.replace('K', '');
  }

  const num = parseFloat(cleaned);
  return Math.round(num * multiplier);
}

async function populatePaparazziCreations() {
  console.log('Starting to populate paparazzi creations...');

  // Clear existing records
  try {
    await query('DELETE FROM paparazzi_creations');
    console.log('Cleared existing records');
  } catch (error) {
    console.error('Error clearing records:', error);
  }

  for (const item of paparazziData) {
    try {
      // Map category to single value
      let category = item.category;
      if (category.includes(',')) {
        // Take the first category
        category = category.split(',')[0].trim();
      }
      // Map to allowed values
      const allowedCategories = ['Entertainment and Movies', 'Lifestyle', 'Local Guide'];
      if (!allowedCategories.includes(category)) {
        // Try to map
        if (category === 'Entertainment') {
          category = 'Entertainment and Movies';
        } else if (category === 'Motivation') {
          category = 'Lifestyle';
        } else if (category === 'Luxury') {
          category = 'Lifestyle';
        } else if (category === 'Finance') {
          category = 'Lifestyle';
        } else if (category === 'Paparazzi') {
          category = 'Entertainment and Movies';
        } else {
          category = 'Lifestyle'; // default
        }
      }

      const recordData = {
        instagram_page_name: item.instagram_page_name,
        no_of_followers: convertFollowers(item.no_of_followers),
        region_focused: item.region_focused,
        category: category,
        instagram_url: item.instagram_url,
        profile_dp_logo: item.profile_dp_logo_url
      };

      await PaparazziCreation.create(recordData);
      console.log(`✓ Created record for: ${item.instagram_page_name}`);
    } catch (error) {
      console.error(`✗ Error creating record for ${item.instagram_page_name}:`, error.message);
    }
  }

  console.log('Population completed!');
}

populatePaparazziCreations()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
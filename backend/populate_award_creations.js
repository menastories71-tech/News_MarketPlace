require('dotenv').config();
const AwardCreation = require('./src/models/AwardCreation');

const awardData = [
  {
    "award_name": "UAE Realty Awards 2024",
    "organizer_name": "UAE Realty Awards Committee",
    "url": "https://www.uaerealtyawards.com",
    "tentative_month": "Annual",
    "industry": "Real Estate",
    "regional_focused": "UAE",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "Pillars of Real Estate Awards 2025",
    "organizer_name": "Pillars Events Management",
    "url": "https://www.pillarsawards.com",
    "tentative_month": "Q1 2025",
    "industry": "Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "World Real Estate Excellence Awards",
    "organizer_name": "World Realty Congress Org",
    "url": "https://www.worldrealestateawards.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "The Ultimate Realty Awards",
    "organizer_name": "Ultimate Realty Awards LLC",
    "url": "https://www.ultimaterealtyawards.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "Global Real Estate Brand Awards 2025",
    "organizer_name": "Global Brand Awards Council",
    "url": "https://www.globalrebrandawards.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Company"
  },
  {
    "award_name": "ACRES",
    "organizer_name": "ACRES Media Group",
    "url": "https://www.acresawards.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Asia/Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "Arab Property Award",
    "organizer_name": "Arabian Business",
    "url": "https://www.arabpropertyaward.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Arab Region",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "award_name": "Forbes Middle East Real Estate Power List",
    "organizer_name": "Forbes Middle East",
    "url": "https://www.forbesmiddleeast.com/list/",
    "tentative_month": "Q4 2025",
    "industry": "Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Construction Week Power List",
    "organizer_name": "Construction Week Online",
    "url": "https://www.constructionweekonline.com/power-lists",
    "tentative_month": "Q4 2025",
    "industry": "Construction/Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Hotelier Middle East Executive Power List",
    "organizer_name": "Hotelier Middle East",
    "url": "https://www.hoteliermiddleeast.com/executive-power-list-2025",
    "tentative_month": "Q1 2025",
    "industry": "Hospitality/Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Legal500 GC Powerlist Middle East",
    "organizer_name": "Legal500",
    "url": "https://www.legal500.com/gc-powerlist/?sfid=6023&_sft_powerlist=middle-east-2025",
    "tentative_month": "Q2 2025",
    "industry": "Legal/Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "GCS in the GCC Power List",
    "organizer_name": "Law Middle East",
    "url": "https://www.law-middle-east.com/gcs-in-the-gcc-power-list-2025-uae-edition/",
    "tentative_month": "Q1 2025",
    "industry": "Legal/Real Estate",
    "regional_focused": "GCC",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Ahlan Dubai Hot 100",
    "organizer_name": "Ahlan Dubai",
    "url": "https://www.ahlanlive.com/dubai/ahlan-hot-100-2026",
    "tentative_month": "Q4 2026",
    "industry": "Lifestyle/Real Estate",
    "regional_focused": "UAE",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Finance Middle East Power List",
    "organizer_name": "Finance Middle East",
    "url": "https://www.financemiddleeast.com/power-lists/",
    "tentative_month": "TBD 2025",
    "industry": "Finance/Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "award_name": "Arabian Business Power List",
    "organizer_name": "Arabian Business",
    "url": "https://www.arabianbusiness.com/powerlists",
    "tentative_month": "Q4 2025",
    "industry": "Business/Real Estate",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  }
];

async function populateAwardCreations() {
  console.log('Starting to populate award creations...');

  for (const item of awardData) {
    try {
      const recordData = {
        award_name: item.award_name,
        award_organiser_name: item.organizer_name,
        url: item.url,
        tentative_month: item.tentative_month,
        industry: item.industry,
        regional_focused: item.regional_focused,
        award_country: item.country,
        award_city: item.city,
        company_focused_individual_focused: item.focus_type,
        image: '/logo.png' // Use logo.png for all records as requested
      };

      await AwardCreation.create(recordData);
      console.log(`✓ Created award: ${item.award_name}`);
    } catch (error) {
      console.error(`✗ Error creating award ${item.award_name}:`, error.message);
    }
  }

  console.log('Award creation population completed!');
}

populateAwardCreations()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
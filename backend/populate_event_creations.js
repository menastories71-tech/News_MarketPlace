require('dotenv').config();
const EventCreation = require('./src/models/EventCreation');

const eventData = [
  {
    "event_name": "RISE",
    "organizer_name": "Clarion Events",
    "url": "https://www.rise-expo.com",
    "tentative_month": "13-15 Jan 2026",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "Real Estate Future Forum",
    "organizer_name": "RISE Expo",
    "url": "https://www.realestatefutureforum.com",
    "tentative_month": "January 2026",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "International Property Show (IPS)",
    "organizer_name": "Dubai Land Department",
    "url": "https://www.internationalpropertyshow.com",
    "tentative_month": "March 2025",
    "industry": "Real Estate",
    "regional_focused": "International",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Company"
  },
  {
    "event_name": "PropTech Connect",
    "organizer_name": "PropTech MENA Association",
    "url": "https://www.proptechconnect.com",
    "tentative_month": "TBD 2025",
    "industry": "PropTech",
    "regional_focused": "MENA",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "PropTech Week MENA",
    "organizer_name": "PropTech MENA Association",
    "url": "https://www.proptechweekmena.com",
    "tentative_month": "TBD 2025",
    "industry": "PropTech",
    "regional_focused": "MENA",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "Digital Construction Summit",
    "organizer_name": "Digital Construction Institute",
    "url": "https://www.digitalconstructionsummit.com",
    "tentative_month": "TBD 2025",
    "industry": "Digital Construction",
    "regional_focused": "Middle East",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "Forbes Building the Future Summit",
    "organizer_name": "Forbes Middle East",
    "url": "https://www.forbesmiddleeast.com/bfs",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "World Realty Congress",
    "organizer_name": "World Realty Congress Org",
    "url": "https://www.worldrealtycongress.com",
    "tentative_month": "TBD 2025",
    "industry": "Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  },
  {
    "event_name": "Construction Week Power List Forum",
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
    "event_name": "Campaign Middle East Power List Gala",
    "organizer_name": "Campaign Middle East",
    "url": "https://campaignme.com/campaign-middle-east-the-mena-power-list-2025/",
    "tentative_month": "Q1 2025",
    "industry": "Marketing/Media",
    "regional_focused": "MENA",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Individual"
  },
  {
    "event_name": "Hotelier Middle East Power List Event",
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
    "event_name": "Finance World Summit",
    "organizer_name": "Finance World",
    "url": "https://thefinanceworld.com/category/lists/",
    "tentative_month": "TBD 2025",
    "industry": "Finance/Real Estate",
    "regional_focused": "Global",
    "country": "UAE",
    "city": "Dubai",
    "focus_type": "Both"
  }
];

async function populateEventCreations() {
  console.log('Starting to populate event creations...');

  for (const item of eventData) {
    try {
      const recordData = {
        event_name: item.event_name,
        event_organiser_name: item.organizer_name,
        url: item.url,
        tentative_month: item.tentative_month,
        industry: item.industry,
        regional_focused: item.regional_focused,
        event_country: item.country,
        event_city: item.city,
        company_focused_individual_focused: item.focus_type,
        image: '/logo.png' // Use logo.png for all records as requested
      };

      await EventCreation.create(recordData);
      console.log(`✓ Created event: ${item.event_name}`);
    } catch (error) {
      console.error(`✗ Error creating event ${item.event_name}:`, error.message);
    }
  }

  console.log('Event creation population completed!');
}

populateEventCreations()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
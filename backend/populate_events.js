require('dotenv').config();
const Event = require('./src/models/Event');

const eventsData = [
  {
    "id": "evt-001-rise-2026",
    "title": "RISE - Real Estate Innovation & Summit Expo",
    "description": "The largest real estate exhibition and conference in the Middle East, featuring global property developers, investors, and technology providers. Includes networking sessions, project launches, and industry workshops.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2026-01-13",
    "end_date": "2026-01-15",
    "month": "January",
    "event_type": "Exhibition & Conference",
    "is_free": false,
    "organizer": "Clarion Events",
    "venue": "Dubai Exhibition Centre, Expo City Dubai",
    "capacity": 15000,
    "registration_deadline": "2026-01-10",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "company_type",
        "field_type": "dropdown",
        "required": true,
        "options": ["Developer", "Agent", "Investor", "Supplier", "Other"]
      },
      {
        "field_name": "interested_in",
        "field_type": "checkbox",
        "required": false,
        "options": ["Residential", "Commercial", "Industrial", "PropTech"]
      }
    ],
    "disclaimer_text": "Registration fees are non-refundable. Badge pickup requires valid government-issued ID. Photography and videography will occur at the event.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-001",
    "created_at": "2024-09-15T10:30:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-002-reff-2026",
    "title": "Real Estate Future Forum",
    "description": "Exclusive thought leadership conference focusing on future trends in real estate including AI, blockchain, sustainable development, and smart cities. C-level executive gathering.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2026-01-14",
    "end_date": "2026-01-15",
    "month": "January",
    "event_type": "Conference",
    "is_free": false,
    "organizer": "RISE Expo",
    "venue": "Dubai Exhibition Centre - Conference Hall A",
    "capacity": 500,
    "registration_deadline": "2025-12-31",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "job_title",
        "field_type": "text",
        "required": true
      },
      {
        "field_name": "years_experience",
        "field_type": "number",
        "required": true
      },
      {
        "field_name": "networking_interests",
        "field_type": "textarea",
        "required": false
      }
    ],
    "disclaimer_text": "This is an invite-verified event. All registrations are subject to approval. Business attire is mandatory.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": false,
    "created_by": "admin-002",
    "created_at": "2024-10-01T09:15:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-003-ips-2025",
    "title": "International Property Show (IPS)",
    "description": "Premier property investment exhibition connecting global developers with local and international investors. Features residential, commercial, and hospitality projects from 30+ countries.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-03-15",
    "end_date": "2025-03-17",
    "month": "March",
    "event_type": "Exhibition",
    "is_free": true,
    "organizer": "Dubai Land Department",
    "venue": "Dubai World Trade Centre",
    "capacity": 20000,
    "registration_deadline": "2025-03-14",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "investment_budget",
        "field_type": "dropdown",
        "required": false,
        "options": ["Under $500K", "$500K-1M", "$1M-5M", "Above $5M"]
      },
      {
        "field_name": "nationality",
        "field_type": "dropdown",
        "required": true,
        "options": ["UAE", "GCC", "Other Middle East", "Asia", "Europe", "Americas", "Africa"]
      }
    ],
    "disclaimer_text": "Free entry for pre-registered visitors. Onsite registration requires AED 50 fee. Investor lounge access is reserved for accredited investors only.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": false,
    "enable_guest": true,
    "created_by": "admin-003",
    "created_at": "2024-08-20T11:45:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-004-proptech-connect",
    "title": "PropTech Connect",
    "description": "Dedicated platform for property technology innovators and real estate industry leaders to connect, showcase solutions, and explore partnerships. Includes startup pitch competitions.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-05-20",
    "end_date": "2025-05-21",
    "month": "May",
    "event_type": "Networking Summit",
    "is_free": false,
    "organizer": "PropTech MENA Association",
    "venue": "Dubai Internet City - Innovation Hub",
    "capacity": 800,
    "registration_deadline": "2025-05-15",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "startup_stage",
        "field_type": "dropdown",
        "required": false,
        "options": ["Idea Stage", "Seed", "Series A", "Series B+", "Established Company"]
      },
      {
        "field_name": "demo_request",
        "field_type": "checkbox",
        "required": false,
        "options": ["Yes, I want to book a demo slot"]
      }
    ],
    "disclaimer_text": "Startup founders must provide company registration documents. Demo slots are limited and allocated on first-come basis.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-004",
    "created_at": "2024-11-10T13:20:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-005-proptech-week",
    "title": "PropTech Week MENA",
    "description": "Week-long celebration of property technology featuring workshops, hackathons, site visits to smart buildings, and thought leadership panels across multiple venues.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-09-08",
    "end_date": "2025-09-12",
    "month": "September",
    "event_type": "Festival",
    "is_free": false,
    "organizer": "PropTech MENA Association",
    "venue": "Multiple Venues - Dubai Design District",
    "capacity": 2500,
    "registration_deadline": "2025-09-01",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "attendance_days",
        "field_type": "multiselect",
        "required": true,
        "options": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      },
      {
        "field_name": "dietary_requirements",
        "field_type": "textarea",
        "required": false
      }
    ],
    "disclaimer_text": "Week pass holders get priority access to all sessions. Individual day tickets available but capacity limited per session.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-004",
    "created_at": "2024-11-10T13:25:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-006-digital-construction",
    "title": "Digital Construction Summit",
    "description": "Transforming construction through digital innovation. Focus on BIM, AI, robotics, and sustainable building practices. Hands-on technology demonstrations included.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-11-10",
    "end_date": "2025-11-11",
    "month": "November",
    "event_type": "Summit",
    "is_free": false,
    "organizer": "Digital Construction Institute",
    "venue": "Grand Hyatt Dubai - Conference Center",
    "capacity": 600,
    "registration_deadline": "2025-11-05",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "construction_sector",
        "field_type": "dropdown",
        "required": true,
        "options": ["Residential", "Commercial", "Infrastructure", "Industrial"]
      },
      {
        "field_name": "certifications",
        "field_type": "checkbox",
        "required": false,
        "options": ["BIM Certified", "PMP", "LEED AP", "Other"]
      }
    ],
    "disclaimer_text": "Technical workshops have limited seats allocated on first-registered basis. CPD certificates provided for accredited sessions.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-005",
    "created_at": "2024-07-15T14:30:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-007-forbes-future",
    "title": "Forbes Building the Future Summit",
    "description": "Executive summit by Forbes Middle East focusing on visionary real estate development, urban planning, and sustainable city building. Invitation-only networking dinners.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-10-18",
    "end_date": "2025-10-19",
    "month": "October",
    "event_type": "Executive Summit",
    "is_free": false,
    "organizer": "Forbes Middle East",
    "venue": "Palazzo Versace Dubai",
    "capacity": 300,
    "registration_deadline": "2025-10-01",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "company_revenue",
        "field_type": "dropdown",
        "required": true,
        "options": ["Under $10M", "$10-50M", "$50-100M", "Above $100M"]
      },
      {
        "field_name": "linkedin_profile",
        "field_type": "url",
        "required": true
      }
    ],
    "disclaimer_text": "Strictly invitation-only event. All registrations subject to Forbes editorial approval. No photography without prior consent.",
    "enable_sponsor": false,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": false,
    "created_by": "admin-006",
    "created_at": "2024-09-01T16:00:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-008-world-realty-congress",
    "title": "World Realty Congress",
    "description": "Global gathering of real estate industry associations, regulatory bodies, and professional organizations to discuss international standards, best practices, and cross-border investments.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-06-25",
    "end_date": "2025-06-27",
    "month": "June",
    "event_type": "Congress",
    "is_free": false,
    "organizer": "World Realty Congress Org",
    "venue": "Atlantis, The Palm",
    "capacity": 1200,
    "registration_deadline": "2025-06-20",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "professional_license",
        "field_type": "text",
        "required": false,
        "placeholder": "Enter your real estate license number"
      },
      {
        "field_name": "association_membership",
        "field_type": "dropdown",
        "required": false,
        "options": ["RICS", "FIABCI", "NAR", "None", "Other"]
      }
    ],
    "disclaimer_text": "Professional credentials required for certain sessions. Gala dinner included with VIP pass only.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-007",
    "created_at": "2024-08-10T12:00:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-009-cw-powerlist-forum",
    "title": "Construction Week Power List Forum",
    "description": "Recognition ceremony and leadership forum honoring the top 100 most influential people in Middle East construction and real estate development.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-12-08",
    "end_date": "2025-12-08",
    "month": "December",
    "event_type": "Awards Forum",
    "is_free": false,
    "organizer": "Construction Week Online",
    "venue": "Armani Hotel Dubai - Ballroom",
    "capacity": 400,
    "registration_deadline": "2025-11-30",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "award_nomination_category",
        "field_type": "dropdown",
        "required": false,
        "options": ["Contractor", "Developer", "Consultant", "Architect", "Engineer"]
      },
      {
        "field_name": "previous_awards",
        "field_type": "textarea",
        "required": false,
        "placeholder": "List any relevant industry awards received"
      }
    ],
    "disclaimer_text": "Power List nominations close 30 days before event date. Ticket includes awards ceremony and networking reception.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": false,
    "enable_guest": true,
    "created_by": "admin-008",
    "created_at": "2024-10-05T15:30:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-010-campaign-powerlist",
    "title": "Campaign Middle East Power List Gala",
    "description": "Celebrating the most influential marketing and communications leaders in MENA region, including real estate brand and development marketing professionals.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-03-25",
    "end_date": "2025-03-25",
    "month": "March",
    "event_type": "Gala Dinner",
    "is_free": false,
    "organizer": "Campaign Middle East",
    "venue": "One&Only Royal Mirage",
    "capacity": 250,
    "registration_deadline": "2025-03-20",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "marketing_specialization",
        "field_type": "dropdown",
        "required": true,
        "options": ["Digital", "Brand", "PR", "Content", "Strategy", "Real Estate"]
      },
      {
        "field_name": "team_size",
        "field_type": "dropdown",
        "required": false,
        "options": ["1-5", "6-20", "21-50", "51+"]
      }
    ],
    "disclaimer_text": "Black tie event. Media attendance requires prior approval. Valet parking included with ticket.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": false,
    "enable_guest": true,
    "created_by": "admin-009",
    "created_at": "2024-11-01T17:45:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-011-hotelier-powerlist",
    "title": "Hotelier Middle East Executive Power List Event",
    "description": "Recognizing leadership excellence in hospitality and hotel real estate development. Includes panels on hotel investment trends and F&B innovation.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-02-12",
    "end_date": "2025-02-12",
    "month": "February",
    "event_type": "Awards Luncheon",
    "is_free": false,
    "organizer": "Hotelier Middle East",
    "venue": "Jumeirah Emirates Towers Hotel",
    "capacity": 350,
    "registration_deadline": "2025-02-05",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "hotel_portfolio_size",
        "field_type": "dropdown",
        "required": false,
        "options": ["1-3", "4-10", "11-50", "50+"]
      },
      {
        "field_name": "hospitality_segment",
        "field_type": "checkbox",
        "required": true,
        "options": ["Luxury", "Mid-scale", "Budget", "Serviced Apartments", "Resorts"]
      }
    ],
    "disclaimer_text": "Hotel industry professionals only. Hotel ownership or management proof required. Dress code: Business formal.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": false,
    "created_by": "admin-010",
    "created_at": "2024-09-25T14:15:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  },
  {
    "id": "evt-012-finance-world-summit",
    "title": "Finance World Summit",
    "description": "Connecting real estate finance leaders with investment opportunities. Focus on REITs, real estate crowdfunding, and Islamic finance structures.",
    "country": "UAE",
    "city": "Dubai",
    "start_date": "2025-09-22",
    "end_date": "2025-09-23",
    "month": "September",
    "event_type": "Summit",
    "is_free": false,
    "organizer": "Finance World",
    "venue": "Dubai International Financial Centre (DIFC) - Gate Village",
    "capacity": 450,
    "registration_deadline": "2025-09-18",
    "status": "active",
    "custom_form_fields": [
      {
        "field_name": "aum_range",
        "field_type": "dropdown",
        "required": false,
        "options": ["Under $50M", "$50-250M", "$250M-1B", "Above $1B"]
      },
      {
        "field_name": "investor_type",
        "field_type": "dropdown",
        "required": true,
        "options": ["Institutional", "Family Office", "Private Equity", "Bank", "Individual"]
      }
    ],
    "disclaimer_text": "Accredited investors and finance professionals only. Proof of affiliation may be requested. Chatham House Rule applies to closed sessions.",
    "enable_sponsor": true,
    "enable_media_partner": true,
    "enable_speaker": true,
    "enable_guest": true,
    "created_by": "admin-011",
    "created_at": "2024-10-20T16:30:00Z",
    "updated_at": "2024-12-04T14:22:00Z"
  }
];

async function populateEvents() {
  console.log('Starting to populate events...');

  for (const eventData of eventsData) {
    try {
      // Remove id and created_by from data as it's auto-generated or not needed
      const { id, created_by, ...dataToInsert } = eventData;

      // Map event_type to allowed values
      const eventTypeMapping = {
        'Exhibition & Conference': 'Government Summit',
        'Conference': 'Government Summit',
        'Exhibition': 'Government Summit',
        'Networking Summit': 'Government Summit',
        'Festival': 'Leisure Events',
        'Summit': 'Government Summit',
        'Executive Summit': 'Government Summit',
        'Congress': 'Government Summit',
        'Awards Forum': 'Power List',
        'Gala Dinner': 'Leisure Events',
        'Awards Luncheon': 'Leisure Events'
      };

      if (eventTypeMapping[dataToInsert.event_type]) {
        dataToInsert.event_type = eventTypeMapping[dataToInsert.event_type];
      }

      // Convert custom_form_fields from array to object format
      if (dataToInsert.custom_form_fields && Array.isArray(dataToInsert.custom_form_fields)) {
        const customFieldsObject = {};
        dataToInsert.custom_form_fields.forEach(field => {
          if (field.field_name && field.field_name.trim()) {
            customFieldsObject[field.field_name] = {
              type: field.field_type,
              required: field.required,
              label: field.label || field.field_name
            };
            if (field.field_type === 'dropdown' && field.options && field.options.length > 0) {
              customFieldsObject[field.field_name].options = field.options;
            }
          }
        });
        dataToInsert.custom_form_fields = customFieldsObject;
      }

      await Event.create(dataToInsert);
      console.log(`✓ Created event: ${eventData.title}`);
    } catch (error) {
      console.error(`✗ Error creating event ${eventData.title}:`, error.message);
    }
  }

  console.log('Events population completed!');
}

populateEvents()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
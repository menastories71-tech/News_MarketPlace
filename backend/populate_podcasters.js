const axios = require('axios');
const Podcaster = require('./src/models/Podcaster');

class PodcasterPopulator {
  constructor() {
    this.processedPodcasters = new Set();
  }

  async populatePodcasters() {
    try {
      console.log('Starting podcaster population from Apple Podcasts...');

      // Fetch popular podcasts from Apple Podcasts API
      const podcasts = await this.fetchPodcastsFromApple();
      console.log(`Found ${podcasts.length} podcasts`);

      let totalSuccess = 0;
      let totalError = 0;

      for (const podcast of podcasts) {
        try {
          // Check if already processed
          if (this.processedPodcasters.has(podcast.collectionName.toLowerCase())) {
            continue;
          }

          const podcasterData = await this.buildPodcasterData(podcast);
          await this.savePodcaster(podcasterData);

          this.processedPodcasters.add(podcast.collectionName.toLowerCase());
          totalSuccess++;
          console.log(`Saved podcaster: ${podcast.collectionName}`);

          // Delay to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`Error processing podcast ${podcast.collectionName}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populatePodcasters:', error);
    }
  }

  async fetchPodcastsFromApple() {
    try {
      // Search for popular podcasts
      const searchTerms = ['business', 'technology', 'entertainment', 'news'];
      const allPodcasts = [];

      for (const term of searchTerms) {
        const response = await axios.get('https://itunes.apple.com/search', {
          params: {
            term: term,
            entity: 'podcast',
            limit: 5,
            country: 'US'
          },
          timeout: 10000
        });

        if (response.data.results) {
          allPodcasts.push(...response.data.results);
        }

        await this.delay(500);
      }

      // Remove duplicates and limit to 3
      const uniquePodcasts = allPodcasts.filter((podcast, index, self) =>
        index === self.findIndex(p => p.collectionId === podcast.collectionId)
      );

      return uniquePodcasts.slice(0, 3);

    } catch (error) {
      console.error('Error fetching podcasts from Apple:', error.message);
      return [];
    }
  }

  async buildPodcasterData(podcast) {
    // Generate random data for missing fields
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const nationalities = ['American', 'British', 'Canadian', 'Australian'];
    const regions = ['North America', 'Europe', 'Asia', 'Global'];
    const industries = ['Technology', 'Business', 'Entertainment', 'News', 'Health', 'Education'];

    const hostName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const igFollowers = Math.floor(Math.random() * 50000) + 10000;
    const engagementRate = (Math.random() * 5 + 1).toFixed(2);

    return {
      podcast_name: podcast.collectionName,
      podcast_host: hostName,
      podcast_focus_industry: industries[Math.floor(Math.random() * industries.length)],
      podcast_target_audience: 'General public',
      podcast_region: regions[Math.floor(Math.random() * regions.length)],
      podcast_website: podcast.collectionViewUrl,
      podcast_ig: `https://instagram.com/${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      podcast_linkedin: `https://linkedin.com/company/${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      podcast_facebook: `https://facebook.com/${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      podcast_ig_username: `@${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      podcast_ig_followers: igFollowers,
      podcast_ig_engagement_rate: parseFloat(engagementRate),
      podcast_ig_prominent_guests: 'Various industry experts',
      spotify_channel_name: podcast.collectionName,
      spotify_channel_url: `https://open.spotify.com/show/${podcast.collectionId}`,
      youtube_channel_name: `${podcast.collectionName} Official`,
      youtube_channel_url: `https://youtube.com/c/${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      tiktok: `https://tiktok.com/@${podcast.collectionName.toLowerCase().replace(/\s+/g, '')}`,
      cta: 'Subscribe to our podcast for the latest insights!',
      contact_us_to_be_on_podcast: 'Email us at contact@podcast.com',
      gender: Math.random() > 0.5 ? 'male' : 'female',
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      status: 'approved',
      submitted_by_admin: 1, // Assuming admin ID 1 exists
      is_active: true
    };
  }

  async savePodcaster(podcasterData) {
    // Check if podcaster already exists
    const existing = await this.findPodcasterByName(podcasterData.podcast_name);
    if (existing) {
      console.log(`Podcaster ${podcasterData.podcast_name} already exists, skipping...`);
      return;
    }

    await Podcaster.create(podcasterData);
  }

  async findPodcasterByName(name) {
    try {
      const sql = 'SELECT * FROM podcasters WHERE podcast_name = $1';
      const result = await require('./src/config/database').query(sql, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing podcaster:', error);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new PodcasterPopulator();
  populator.populatePodcasters()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = PodcasterPopulator;
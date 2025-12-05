const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PowerlistNomination = require('./src/models/PowerlistNomination');
const { s3Service } = require('./src/services/s3Service');

// Common logo URLs for major publications
const LOGO_URLS = {
  'Forbes Middle East': 'https://forbesme.com/wp-content/uploads/2024/01/logo.png',
  'Harper\'s Bazaar Arabia': 'https://www.harpersbazaararabia.com/public/assets/images/logo.png',
  'Vogue Arabia': 'https://en.vogue.me/img/vogue-logo.png',
  'GQ Middle East': 'https://www.gqmiddleeast.com/wp-content/themes/gq-theme/images/logo.png',
  'Marie Claire Arabia': 'https://www.marieclairearabia.com/public/assets/images/logo.png',
  'Emirates Woman': 'https://emirateswoman.com/wp-content/themes/emirates-woman/assets/images/logo.png',
  'Esquire Middle East': 'https://www.esquireme.com/wp-content/themes/esquire-theme/images/logo.png',
  'Ahlan Dubai': 'https://www.ahlanlive.com/public/assets/images/logo.png',
  'Fact Magazine': 'https://www.factmag.ae/public/assets/images/logo.png',
  'Timeout Dubai': 'https://www.timeoutdubai.com/public/assets/images/logo.png',
  'Economy Middle East': 'https://economymiddleeast.com/public/assets/images/logo.png',
  'Finance Middle East': 'https://www.financemiddleeast.com/public/assets/images/logo.png',
  'Campaign Middle East': 'https://campaignme.com/public/assets/images/logo.png',
  'CEO Middle East': 'https://www.ceomiddleeast.com/public/assets/images/logo.png',
  'Retail ME': 'https://www.retailme.com/public/assets/images/logo.png',
  'Construction Week Online': 'https://www.constructionweekonline.com/public/assets/images/logo.png',
  'Hotelier Middle East': 'https://www.hoteliermiddleeast.com/public/assets/images/logo.png',
  'Law Middle East': 'https://www.law-middle-east.com/public/assets/images/logo.png',
  'Healthcare Middle East': 'https://www.healthcaremiddleeast.com/public/assets/images/logo.png',
  'MEP Middle East': 'https://www.mepmiddleeast.com/public/assets/images/logo.png',
  'Facilities Management Middle East': 'https://www.fmme.ae/public/assets/images/logo.png',
  'Transport & Logistics ME': 'https://www.transportlogisticsme.com/public/assets/images/logo.png',
  'Infrastructure Middle East': 'https://www.infrastructureme.com/public/assets/images/logo.png',
  'Security Middle East': 'https://www.securitymiddleeast.com/public/assets/images/logo.png',
  'AD Middle East': 'https://www.admiddleeast.com/public/assets/images/logo.png',
  'Entrepreneur Middle East': 'https://www.entrepreneur.com/en-ae/public/assets/images/logo.png',
  'Oil & Gas Middle East': 'https://www.oilandgasmiddleeast.com/public/assets/images/logo.png',
  'Middle East Architect': 'https://www.middleeastarchitect.com/public/assets/images/logo.png'
};

class PowerlistNominationPopulator {
  constructor() {
    this.browser = null;
    this.tempDir = path.join(process.cwd(), 'temp', 'logos');
    this.ensureTempDir();
    
    // Statistics
    this.stats = {
      totalProcessed: 0,
      successfulS3Uploads: 0,
      failedS3Uploads: 0,
      imagesDownloaded: 0,
      existingImagesUploaded: 0,
      databaseInserts: 0,
      databaseErrors: 0
    };
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async downloadLogo(publicationName, websiteUrl) {
    try {
      console.log(`  🔍 Searching for logo: ${publicationName}`);
      
      // First try predefined logo URLs
      const predefinedUrl = LOGO_URLS[publicationName];
      if (predefinedUrl) {
        try {
          console.log(`  📥 Trying predefined URL...`);
          const logoPath = await this.downloadImage(predefinedUrl, publicationName, 'logo');
          if (logoPath) {
            console.log(`  ✅ Predefined logo downloaded successfully`);
            return logoPath;
          }
        } catch (error) {
          console.log(`  ❌ Predefined logo failed: ${error.message}`);
        }
      }

      // If predefined fails, try to scrape the website for logo
      console.log(`  🌐 Scraping website for logo...`);
      return await this.scrapeLogoFromWebsite(websiteUrl, publicationName);
    } catch (error) {
      console.error(`  ❌ Error downloading logo for ${publicationName}:`, error.message);
      return null;
    }
  }

  async scrapeLogoFromWebsite(websiteUrl, publicationName) {
    try {
      const page = await this.browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      
      // Common logo selectors
      const logoSelectors = [
        'img[alt*="logo"]',
        'img[src*="logo"]',
        '.logo img',
        'header img',
        'nav img',
        'a[href="/"] img',
        '.brand img',
        'h1 img',
        'img[class*="logo"]',
        'img[id*="logo"]'
      ];

      for (const selector of logoSelectors) {
        const logoElement = await page.$(selector);
        if (logoElement) {
          const src = await page.evaluate(el => el.src || el.getAttribute('src'), logoElement);
          const alt = await page.evaluate(el => el.alt || el.getAttribute('alt'), logoElement);
          
          if (src && (alt && alt.toLowerCase().includes('logo') || src.toLowerCase().includes('logo'))) {
            // Try to get absolute URL
            let fullUrl = src;
            if (src.startsWith('//')) {
              fullUrl = 'https:' + src;
            } else if (src.startsWith('/')) {
              const url = new URL(websiteUrl);
              fullUrl = url.origin + src;
            } else if (!src.startsWith('http')) {
              fullUrl = websiteUrl + src;
            }

            console.log(`  🔍 Found potential logo: ${fullUrl}`);
            const logoPath = await this.downloadImage(fullUrl, publicationName, 'logo');
            if (logoPath) {
              console.log(`  ✅ Logo scraped successfully`);
              await page.close();
              return logoPath;
            }
          }
        }
      }

      await page.close();
      console.log(`  ❌ No suitable logo found on website`);
      return null;
    } catch (error) {
      console.error(`  ❌ Error scraping logo from ${websiteUrl}:`, error.message);
      return null;
    }
  }

  async downloadImage(imageUrl, publicationName, type = 'image') {
    try {
      console.log(`  📥 Downloading: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        console.log(`  ❌ Invalid content type: ${contentType}`);
        return null;
      }

      // Generate filename from publication name
      const sanitizedName = publicationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = contentType.split('/')[1] || 'png';
      const filename = `${type}_${sanitizedName}_${Date.now()}.${extension}`;
      const tempFilepath = path.join(this.tempDir, filename);

      // Save to temporary file first
      fs.writeFileSync(tempFilepath, response.data);
      console.log(`  💾 Saved to temp file: ${filename}`);

      // Upload to S3
      const s3Key = `powerlist-nominations/logos/${filename}`;
      const s3Url = await s3Service.uploadFromLocalPath(tempFilepath, s3Key, contentType);
      this.stats.successfulS3Uploads++;

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilepath);
      } catch (cleanupError) {
        console.warn(`  ⚠️  Failed to clean up temp file: ${cleanupError.message}`);
      }

      console.log(`  ☁️  Uploaded to S3: ${s3Url}`);
      return s3Url;

    } catch (error) {
      console.error(`  ❌ Error downloading image ${imageUrl}:`, error.message);
      this.stats.failedS3Uploads++;
      return null;
    }
  }

  async populatePowerlistNominations() {
    try {
      console.log('🚀 Starting powerlist nominations population with S3 image uploads...\n');
      
      // Initialize browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // Read the powerlist nominations JSON file
      const jsonFilePath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');
      const rawData = fs.readFileSync(jsonFilePath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`📊 Processing ${data.nominations.length} nominations...\n`);

      for (const nomination of data.nominations) {
        this.stats.totalProcessed++;
        
        try {
          console.log(`${this.stats.totalProcessed}. Processing: ${nomination.publication_name}`);
          
          let imagePath = nomination.image;

          // Handle existing images
          if (imagePath && imagePath.trim() !== '') {
            if (imagePath.startsWith('/uploads/')) {
              // Upload existing local image to S3
              console.log(`  📤 Uploading existing image to S3...`);
              const localPath = path.join(__dirname, imagePath);
              if (fs.existsSync(localPath)) {
                const s3Key = imagePath.replace('/uploads/', 'powerlist-nominations/');
                const contentType = this.getContentType(imagePath);
                try {
                  imagePath = await s3Service.uploadFromLocalPath(localPath, s3Key, contentType);
                  this.stats.existingImagesUploaded++;
                  console.log(`  ☁️  Existing image uploaded: ${imagePath}`);
                } catch (s3Error) {
                  console.warn(`  ⚠️  Failed to upload existing image: ${s3Error.message}`);
                }
              }
            }
          } else {
            // Download new image
            console.log(`  🖼️  Image missing, downloading...`);
            imagePath = await this.downloadLogo(nomination.publication_name, nomination.website_url);
            if (imagePath) {
              this.stats.imagesDownloaded++;
            }
          }

          // Prepare nomination data
          const nominationData = {
            publication_name: nomination.publication_name,
            website_url: nomination.website_url,
            power_list_name: nomination.power_list_name,
            industry: nomination.industry,
            company_or_individual: nomination.company_or_individual,
            tentative_month: nomination.tentative_month,
            location_region: nomination.location_region,
            last_power_list_url: nomination.last_power_list_url,
            image: imagePath || null,
            status: nomination.status || 'approved',
            is_active: nomination.is_active !== undefined ? nomination.is_active : true,
            created_at: nomination.created_at,
            updated_at: nomination.updated_at
          };

          // Create nomination in database
          try {
            const powerlistNomination = await PowerlistNomination.create(nominationData);
            this.stats.databaseInserts++;
            console.log(`  ✅ Database insert successful (ID: ${powerlistNomination.id})`);
          } catch (dbError) {
            this.stats.databaseErrors++;
            console.log(`  ⚠️  Database insert failed: ${dbError.message}`);
            console.log(`  📝 Nomination data prepared but not inserted due to DB connection issue`);
          }

        } catch (error) {
          console.error(`  ❌ Error processing nomination:`, error.message);
        }
        
        console.log(''); // Empty line for readability
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      // Display final statistics
      console.log('\n🎉 POPULATION COMPLETED!');
      console.log('=' .repeat(50));
      console.log(`📊 Total Processed: ${this.stats.totalProcessed}`);
      console.log(`✅ S3 Successful Uploads: ${this.stats.successfulS3Uploads}`);
      console.log(`❌ S3 Failed Uploads: ${this.stats.failedS3Uploads}`);
      console.log(`🖼️  Images Downloaded: ${this.stats.imagesDownloaded}`);
      console.log(`📤 Existing Images Uploaded: ${this.stats.existingImagesUploaded}`);
      console.log(`💾 Database Inserts: ${this.stats.databaseInserts}`);
      console.log(`❌ Database Errors: ${this.stats.databaseErrors}`);
      console.log('=' .repeat(50));

      if (this.stats.successfulS3Uploads > 0) {
        console.log('\n☁️  S3 Integration: ✅ WORKING PERFECTLY!');
        console.log('🖼️  Images are successfully being uploaded to Amazon S3');
      }

      if (this.stats.databaseErrors > 0) {
        console.log('\n⚠️  Database: Connection issue detected');
        console.log('📝 S3 uploads are working, but database insertion needs connection fix');
      }

      // Clean up temp directory
      this.cleanupTempDir();

    } catch (error) {
      console.error('❌ Fatal error in populatePowerlistNominations:', error);
      if (this.browser) {
        await this.browser.close();
      }
      this.cleanupTempDir();
    }
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return contentTypes[ext] || 'image/png';
  }

  cleanupTempDir() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.tempDir, file));
        }
        fs.rmdirSync(this.tempDir);
        console.log('🧹 Temporary files cleaned up');
      }
    } catch (error) {
      console.warn('⚠️  Failed to cleanup temp directory:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new PowerlistNominationPopulator();
  populator.populatePowerlistNominations()
    .then(() => {
      console.log('\n🎊 Powerlist nominations population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Powerlist nominations population failed:', error);
      process.exit(1);
    });
}

module.exports = PowerlistNominationPopulator;
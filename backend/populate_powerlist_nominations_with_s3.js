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
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async downloadLogo(publicationName, websiteUrl) {
    try {
      // First try predefined logo URLs
      const predefinedUrl = LOGO_URLS[publicationName];
      if (predefinedUrl) {
        try {
          const logoPath = await this.downloadImage(predefinedUrl, publicationName, 'logo');
          if (logoPath) {
            return logoPath;
          }
        } catch (error) {
          console.log(`Failed to download predefined logo for ${publicationName}:`, error.message);
        }
      }

      // If predefined fails, try to scrape the website for logo
      return await this.scrapeLogoFromWebsite(websiteUrl, publicationName);
    } catch (error) {
      console.error(`Error downloading logo for ${publicationName}:`, error.message);
      return null;
    }
  }

  async scrapeLogoFromWebsite(websiteUrl, publicationName) {
    try {
      const page = await this.browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
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

            const logoPath = await this.downloadImage(fullUrl, publicationName, 'logo');
            if (logoPath) {
              await page.close();
              return logoPath;
            }
          }
        }
      }

      await page.close();
      return null;
    } catch (error) {
      console.error(`Error scraping logo from ${websiteUrl}:`, error.message);
      return null;
    }
  }

  async downloadImage(imageUrl, publicationName, type = 'image') {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return null;
      }

      // Generate filename from publication name
      const sanitizedName = publicationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = contentType.split('/')[1] || 'png';
      const filename = `${type}_${sanitizedName}_${Date.now()}.${extension}`;
      const tempFilepath = path.join(this.tempDir, filename);

      // Save to temporary file first
      fs.writeFileSync(tempFilepath, response.data);

      // Upload to S3
      const s3Key = `powerlist-nominations/logos/${filename}`;
      const s3Url = await s3Service.uploadFromLocalPath(tempFilepath, s3Key, contentType);

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilepath);
      } catch (cleanupError) {
        console.warn(`Failed to clean up temp file ${tempFilepath}:`, cleanupError.message);
      }

      return s3Url;

    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error.message);
      return null;
    }
  }

  async populatePowerlistNominations() {
    try {
      console.log('Starting powerlist nominations population with S3 image uploads...');
      
      // Initialize browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // Read the powerlist nominations JSON file
      const jsonFilePath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');
      const rawData = fs.readFileSync(jsonFilePath, 'utf8');
      const data = JSON.parse(rawData);
      
      let successCount = 0;
      let errorCount = 0;
      let imageDownloadCount = 0;
      let s3UploadCount = 0;

      for (const nomination of data.nominations) {
        try {
          let imagePath = nomination.image;

          // Download image if missing
          if (!imagePath || imagePath.trim() === '') {
            console.log(`Downloading image for ${nomination.publication_name}...`);
            imagePath = await this.downloadLogo(nomination.publication_name, nomination.website_url);
            if (imagePath) {
              imageDownloadCount++;
              s3UploadCount++;
              console.log(`Downloaded and uploaded to S3: ${imagePath}`);
            }
          } else if (imagePath.startsWith('/uploads/')) {
            // If there's already a local path, try to upload to S3
            console.log(`Uploading existing image for ${nomination.publication_name} to S3...`);
            const localPath = path.join(__dirname, imagePath);
            if (fs.existsSync(localPath)) {
              const s3Key = imagePath.replace('/uploads/', 'powerlist-nominations/');
              const contentType = this.getContentType(imagePath);
              try {
                imagePath = await s3Service.uploadFromLocalPath(localPath, s3Key, contentType);
                s3UploadCount++;
                console.log(`Uploaded to S3: ${imagePath}`);
              } catch (s3Error) {
                console.warn(`Failed to upload ${localPath} to S3:`, s3Error.message);
              }
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
          const powerlistNomination = await PowerlistNomination.create(nominationData);
          successCount++;
          console.log(`✅ Created nomination: ${powerlistNomination.publication_name}`);

        } catch (error) {
          console.error(`❌ Error processing nomination ${nomination.publication_name}:`, error.message);
          errorCount++;
        }
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      console.log(`\n🎉 Population completed!`);
      console.log(`📊 Total processed: ${data.nominations.length}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`🖼️  Images downloaded: ${imageDownloadCount}`);
      console.log(`☁️  Images uploaded to S3: ${s3UploadCount}`);

      // Clean up temp directory
      this.cleanupTempDir();

    } catch (error) {
      console.error('❌ Error in populatePowerlistNominations:', error);
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
      }
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error.message);
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
      console.log('Powerlist nominations population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Powerlist nominations population failed:', error);
      process.exit(1);
    });
}

module.exports = PowerlistNominationPopulator;
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

class BulkOperations {
  // Parse CSV file
  static parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Parse Excel file
  static parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  // Parse uploaded file (CSV or Excel)
  static async parseFile(filePath, mimetype) {
    try {
      if (mimetype === 'text/csv' || mimetype === 'application/csv') {
        return await this.parseCSV(filePath);
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 mimetype === 'application/vnd.ms-excel') {
        return this.parseExcel(filePath);
      } else {
        throw new Error('Unsupported file type. Only CSV and Excel files are supported.');
      }
    } catch (error) {
      throw new Error(`File parsing error: ${error.message}`);
    }
  }

  // Generate CSV template
  static generateCSVTemplate() {
    const headers = [
      'group_id',
      'publication_sn',
      'publication_grade',
      'publication_name',
      'publication_website',
      'publication_price',
      'agreement_tat',
      'practical_tat',
      'publication_socials_icons',
      'publication_language',
      'publication_region',
      'publication_primary_industry',
      'website_news_index',
      'da',
      'dr',
      'sponsored_or_not',
      'words_limit',
      'number_of_images',
      'do_follow_link',
      'example_link',
      'excluding_categories',
      'other_remarks',
      'tags_badges'
    ];

    const sampleData = [
      {
        group_id: '1',
        publication_sn: 'PUB001',
        publication_grade: 'A+',
        publication_name: 'Sample Publication',
        publication_website: 'https://example.com',
        publication_price: '100',
        agreement_tat: '10',
        practical_tat: '5',
        publication_socials_icons: '',
        publication_language: 'English',
        publication_region: 'Global',
        publication_primary_industry: 'Technology',
        website_news_index: '0',
        da: '50',
        dr: '45',
        sponsored_or_not: 'false',
        words_limit: '500',
        number_of_images: '1',
        do_follow_link: 'true',
        example_link: 'https://example.com/article',
        excluding_categories: '',
        other_remarks: '',
        tags_badges: 'Hot Deal'
      }
    ];

    return { headers, sampleData };
  }

  // Generate Excel template
  static generateExcelTemplate() {
    const headers = [
      'Group SN', 'Group Name', 'Group Location', 'Group Website', 'Group Linkedin', 'Group Instagram',
      'Publication SN', 'Publication Grade', 'Publication Name', 'Publication website', 'Publication Price',
      'Agreement TAT', 'Practical TAT', 'Publication Socials Icons', 'Publication Language', 'Publication region',
      'Publication Primary Industry / Focus', 'Website news index', 'DA', 'DR', 'Sponsored or not',
      'Words limit', 'no. of images', 'Do follow link', 'Example link', 'Exlucding categories',
      'Other remarks', 'Hot deals/ best seller/ top credible. Agency recommended / Fast TAT / East Approval',
      'Live on Platform'
    ];

    const sampleData = [
      {
        'Group SN': 1,
        'Group Name': '7awi Media Group',
        'Group Location': 'Dubai, UAE',
        'Group Website': 'https://7awi.com/',
        'Group Linkedin': 'https://www.linkedin.com/company/7awimediagroup/',
        'Group Instagram': 'https://www.instagram.com/7awimediagroup/',
        'Publication SN': 1,
        'Publication Grade': 'A+',
        'Publication Name': 'Arabs Turbo',
        'Publication website': 'https://www.arabsturbo.com/',
        'Publication Price': 100,
        'Agreement TAT': 10,
        'Practical TAT': 5,
        'Publication Socials Icons': '',
        'Publication Language': 'Arabic',
        'Publication region': 'Middle East',
        'Publication Primary Industry / Focus': 'Automobile',
        'Website news index': '',
        'DA': '',
        'DR': '',
        'Sponsored or not': 'No',
        'Words limit': 500,
        'no. of images': '',
        'Do follow link': 'Yes',
        'Example link': '',
        'Exlucding categories': '',
        'Other remarks': '',
        'Hot deals/ best seller/ top credible. Agency recommended / Fast TAT / East Approval': '',
        'Live on Platform': ''
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Publications');

    return workbook;
  }

  // Validate group data
  static validateGroupData(data) {
    const errors = [];
    const requiredFields = ['group_sn', 'group_name', 'group_location', 'group_website'];

    // Check required fields
    requiredFields.forEach(field => {
      const value = data[field];
      if (value === null || value === undefined || value === '') {
        errors.push(`${field} is required`);
      }
    });

    // Validate URL
    if (data.group_website) {
      try {
        new URL(data.group_website);
      } catch {
        errors.push('group_website must be a valid URL');
      }
    }

    return errors;
  }

  // Validate publication data
  static validatePublicationData(data) {
    const errors = [];
    const requiredFields = [
      'group_sn', 'publication_sn', 'publication_grade', 'publication_name',
      'publication_website', 'publication_price', 'agreement_tat', 'practical_tat',
      'publication_language', 'publication_region', 'publication_primary_industry',
      'da', 'dr', 'words_limit', 'number_of_images'
    ];

    // Check required fields - allow empty strings for optional fields but not for required ones
    requiredFields.forEach(field => {
      const value = data[field];
      // Allow null values for da, dr, and number_of_images as they can be optional
      if ((field === 'da' || field === 'dr' || field === 'number_of_images') && value === null) {
        return; // Skip validation for these optional numeric fields
      }
      if (value === null || value === undefined || value === '') {
        errors.push(`${field} is required`);
      }
    });

    // Validate data types and ranges - only validate if field is not empty
    if (data.publication_price !== undefined && data.publication_price !== null && data.publication_price !== '' && isNaN(parseFloat(data.publication_price))) {
      errors.push('publication_price must be a number');
    }

    if (data.agreement_tat !== undefined && data.agreement_tat !== null && data.agreement_tat !== '' && isNaN(parseInt(data.agreement_tat))) {
      errors.push('agreement_tat must be an integer');
    }

    if (data.practical_tat !== undefined && data.practical_tat !== null && data.practical_tat !== '' && isNaN(parseInt(data.practical_tat))) {
      errors.push('practical_tat must be an integer');
    }

    if (data.da !== undefined && data.da !== null && data.da !== '' && (isNaN(parseInt(data.da)) || parseInt(data.da) < 0 || parseInt(data.da) > 100)) {
      errors.push('da must be between 0 and 100');
    }

    if (data.dr !== undefined && data.dr !== null && data.dr !== '' && (isNaN(parseInt(data.dr)) || parseInt(data.dr) < 0 || parseInt(data.dr) > 100)) {
      errors.push('dr must be between 0 and 100');
    }

    if (data.words_limit !== undefined && data.words_limit !== null && data.words_limit !== '' && isNaN(parseInt(data.words_limit))) {
      errors.push('words_limit must be an integer');
    }

    if (data.number_of_images !== undefined && data.number_of_images !== null && data.number_of_images !== '' && isNaN(parseInt(data.number_of_images))) {
      errors.push('number_of_images must be an integer');
    }

    // Validate publication_grade length (VARCHAR(10))
    if (data.publication_grade && data.publication_grade.toString().length > 10) {
      errors.push('publication_grade must be 10 characters or less');
    }

    // Validate boolean fields
    if (data.sponsored_or_not !== undefined && data.sponsored_or_not !== null && data.sponsored_or_not !== '' && typeof data.sponsored_or_not === 'string' && !['true', 'false', 'yes', 'no', '1', '0'].includes(data.sponsored_or_not.toLowerCase())) {
      errors.push('sponsored_or_not must be true/false');
    }

    if (data.do_follow_link !== undefined && data.do_follow_link !== null && data.do_follow_link !== '' && typeof data.do_follow_link === 'string' && !['true', 'false', 'yes', 'no', '1', '0'].includes(data.do_follow_link.toLowerCase())) {
      errors.push('do_follow_link must be true/false');
    }

    // Validate URL
    if (data.publication_website) {
      try {
        new URL(data.publication_website);
      } catch {
        errors.push('publication_website must be a valid URL');
      }
    }

    return errors;
  }

  // Transform parsed data to group format
  static transformGroupData(rawData) {
    const groups = [];
    const groupMap = new Map();

    rawData.forEach(row => {
      const groupSn = (row.group_sn || row['Group SN'])?.toString().trim();
      if (!groupSn || groupMap.has(groupSn)) return;

      const group = {
        group_sn: groupSn,
        group_name: (row.group_name || row['Group Name'])?.toString().trim(),
        group_location: (row.group_location || row['Group Location'])?.toString().trim(),
        group_website: (row.group_website || row['Group Website'])?.toString().trim(),
        group_linkedin: (row.group_linkedin || row['Group Linkedin'])?.toString().trim(),
        group_instagram: (row.group_instagram || row['Group Instagram'])?.toString().trim()
      };

      groups.push(group);
      groupMap.set(groupSn, group);
    });

    return groups;
  }

  // Transform parsed data to publication format
  static transformPublicationData(rawData) {
    return rawData.map(row => {
      return {
        group_sn: (row.group_sn || row['Group SN'])?.toString().trim(),
        publication_sn: (row.publication_sn || row['Publication SN'])?.toString().trim(),
        publication_grade: (row.publication_grade || row['Publication Grade'])?.toString().trim(),
        publication_name: (row.publication_name || row['Publication Name'])?.toString().trim(),
        publication_website: (row.publication_website || row['Publication website'])?.toString().trim(),
        publication_price: parseFloat(row.publication_price || row['Publication Price']),
        agreement_tat: parseInt(row.agreement_tat || row['Agreement TAT']),
        practical_tat: parseInt(row.practical_tat || row['Practical TAT']),
        publication_socials_icons: (row.publication_socials_icons || row['Publication Socials Icons'])?.toString().trim() || null,
        publication_language: (row.publication_language || row['Publication Language'])?.toString().trim(),
        publication_region: (row.publication_region || row['Publication region'])?.toString().trim(),
        publication_primary_industry: (row.publication_primary_industry || row['Publication Primary Industry / Focus'])?.toString().trim(),
        website_news_index: (row.website_news_index || row['Website news index']) ? parseInt(row.website_news_index || row['Website news index']) : 0,
        da: (row.da || row['DA']) && !isNaN(parseInt(row.da || row['DA'])) ? parseInt(row.da || row['DA']) : null,
        dr: (row.dr || row['DR']) && !isNaN(parseInt(row.dr || row['DR'])) ? parseInt(row.dr || row['DR']) : null,
        sponsored_or_not: ['true', 'yes', '1'].includes((row.sponsored_or_not || row['Sponsored or not'])?.toString().toLowerCase()),
        words_limit: parseInt(row.words_limit || row['Words limit']),
        number_of_images: (row.number_of_images || row['no. of images']) && !isNaN(parseInt(row.number_of_images || row['no. of images'])) ? parseInt(row.number_of_images || row['no. of images']) : null,
        do_follow_link: ['true', 'yes', '1'].includes((row.do_follow_link || row['Do follow link'])?.toString().toLowerCase()),
        example_link: (row.example_link || row['Example link'])?.toString().trim() || null,
        excluding_categories: (row.excluding_categories || row['Exlucding categories'])?.toString().trim() || null,
        other_remarks: (row.other_remarks || row['Other remarks'])?.toString().trim() || null,
        tags_badges: (row.tags_badges || row['Hot deals/ best seller/ top credible. Agency recommended / Fast TAT / East Approval'])?.toString().trim() || null,
        live_on_platform: ['true', 'yes', '1'].includes((row.live_on_platform || row['Live on Platform'])?.toString().toLowerCase()) || false
      };
    });
  }

  // Clean up uploaded file
  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

module.exports = BulkOperations;
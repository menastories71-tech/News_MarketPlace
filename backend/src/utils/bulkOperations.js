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
    const { headers, sampleData } = this.generateCSVTemplate();

    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Publications Template');

    return workbook;
  }

  // Validate publication data
  static validatePublicationData(data) {
    const errors = [];
    const requiredFields = [
      'group_id', 'publication_sn', 'publication_grade', 'publication_name',
      'publication_website', 'publication_price', 'agreement_tat', 'practical_tat',
      'publication_language', 'publication_region', 'publication_primary_industry',
      'da', 'dr', 'words_limit', 'number_of_images'
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field] && data[field] !== 0) {
        errors.push(`${field} is required`);
      }
    });

    // Validate data types and ranges
    if (data.publication_price && isNaN(parseFloat(data.publication_price))) {
      errors.push('publication_price must be a number');
    }

    if (data.agreement_tat && isNaN(parseInt(data.agreement_tat))) {
      errors.push('agreement_tat must be an integer');
    }

    if (data.practical_tat && isNaN(parseInt(data.practical_tat))) {
      errors.push('practical_tat must be an integer');
    }

    if (data.da && (isNaN(parseInt(data.da)) || parseInt(data.da) < 0 || parseInt(data.da) > 100)) {
      errors.push('da must be between 0 and 100');
    }

    if (data.dr && (isNaN(parseInt(data.dr)) || parseInt(data.dr) < 0 || parseInt(data.dr) > 100)) {
      errors.push('dr must be between 0 and 100');
    }

    if (data.words_limit && isNaN(parseInt(data.words_limit))) {
      errors.push('words_limit must be an integer');
    }

    if (data.number_of_images && isNaN(parseInt(data.number_of_images))) {
      errors.push('number_of_images must be an integer');
    }

    // Validate boolean fields
    if (data.sponsored_or_not && !['true', 'false', 'yes', 'no', '1', '0'].includes(data.sponsored_or_not.toLowerCase())) {
      errors.push('sponsored_or_not must be true/false');
    }

    if (data.do_follow_link && !['true', 'false', 'yes', 'no', '1', '0'].includes(data.do_follow_link.toLowerCase())) {
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

  // Transform parsed data to publication format
  static transformPublicationData(rawData) {
    return rawData.map(row => ({
      group_id: parseInt(row.group_id),
      publication_sn: row.publication_sn?.toString().trim(),
      publication_grade: row.publication_grade?.toString().trim(),
      publication_name: row.publication_name?.toString().trim(),
      publication_website: row.publication_website?.toString().trim(),
      publication_price: parseFloat(row.publication_price),
      agreement_tat: parseInt(row.agreement_tat),
      practical_tat: parseInt(row.practical_tat),
      publication_socials_icons: row.publication_socials_icons?.toString().trim() || null,
      publication_language: row.publication_language?.toString().trim(),
      publication_region: row.publication_region?.toString().trim(),
      publication_primary_industry: row.publication_primary_industry?.toString().trim(),
      website_news_index: row.website_news_index ? parseInt(row.website_news_index) : 0,
      da: parseInt(row.da),
      dr: parseInt(row.dr),
      sponsored_or_not: ['true', 'yes', '1'].includes(row.sponsored_or_not?.toString().toLowerCase()),
      words_limit: parseInt(row.words_limit),
      number_of_images: parseInt(row.number_of_images),
      do_follow_link: ['true', 'yes', '1'].includes(row.do_follow_link?.toString().toLowerCase()),
      example_link: row.example_link?.toString().trim() || null,
      excluding_categories: row.excluding_categories?.toString().trim() || null,
      other_remarks: row.other_remarks?.toString().trim() || null,
      tags_badges: row.tags_badges?.toString().trim() || null
    }));
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
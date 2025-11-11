const BulkOperations = require('./src/utils/bulkOperations');
const xlsx = require('xlsx');

async function testValidation() {
  try {
    // Read the sample data file
    const workbook = xlsx.readFile('./bulk-upload-sample.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    console.log('=== RAW DATA SAMPLE ===');
    console.log('First row keys:', Object.keys(rawData[0]));
    console.log('First row values:', JSON.stringify(rawData[0], null, 2));

    console.log('\n=== TESTING GROUP TRANSFORMATION ===');
    const groups = BulkOperations.transformGroupData(rawData);
    console.log('Groups extracted:', groups.length);
    console.log('First group:', JSON.stringify(groups[0], null, 2));

    console.log('\n=== TESTING GROUP VALIDATION ===');
    if (groups.length > 0) {
      const groupErrors = BulkOperations.validateGroupData(groups[0]);
      console.log('First group validation errors:', groupErrors);
    }

    console.log('\n=== TESTING PUBLICATION TRANSFORMATION ===');
    const publications = BulkOperations.transformPublicationData(rawData);
    console.log('Publications extracted:', publications.length);
    console.log('First publication:', JSON.stringify(publications[0], null, 2));

    console.log('\n=== TESTING PUBLICATION VALIDATION ===');
    if (publications.length > 0) {
      const pubErrors = BulkOperations.validatePublicationData(publications[0]);
      console.log('First publication validation errors:', pubErrors);
    }

    console.log('\n=== TESTING SECOND PUBLICATION (HAS [object Object]) ===');
    if (publications.length > 1) {
      console.log('Second publication:', JSON.stringify(publications[1], null, 2));
      const pub2Errors = BulkOperations.validatePublicationData(publications[1]);
      console.log('Second publication validation errors:', pub2Errors);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testValidation();
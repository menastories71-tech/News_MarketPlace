const xlsx = require('xlsx');

// Create sample data for bulk upload
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
  },
  {
    'Group SN': 1,
    'Group Name': '7awi Media Group',
    'Group Location': 'Dubai, UAE',
    'Group Website': 'https://7awi.com/',
    'Group Linkedin': 'https://www.linkedin.com/company/7awimediagroup/',
    'Group Instagram': 'https://www.instagram.com/7awimediagroup/',
    'Publication SN': 2,
    'Publication Grade': 'A',
    'Publication Name': 'RA2EJ',
    'Publication website': 'https://www.ra2ej.com/',
    'Publication Price': 200,
    'Agreement TAT': 10,
    'Practical TAT': 5,
    'Publication Socials Icons': '',
    'Publication Language': 'Arabic',
    'Publication region': 'Middle East',
    'Publication Primary Industry / Focus': 'Technology',
    'Website news index': '',
    'DA': 50,
    'DR': 45,
    'Sponsored or not': 'No',
    'Words limit': 800,
    'no. of images': 2,
    'Do follow link': 'No',
    'Example link': '',
    'Exlucding categories': '',
    'Other remarks': '',
    'Hot deals/ best seller/ top credible. Agency recommended / Fast TAT / East Approval': '',
    'Live on Platform': ''
  },
  {
    'Group SN': 2,
    'Group Name': 'Tech News Group',
    'Group Location': 'New York, USA',
    'Group Website': 'https://technews.com/',
    'Group Linkedin': 'https://www.linkedin.com/company/technews/',
    'Group Instagram': 'https://www.instagram.com/technews/',
    'Publication SN': 3,
    'Publication Grade': 'A+',
    'Publication Name': 'Tech Daily',
    'Publication website': 'https://techdaily.com/',
    'Publication Price': 150,
    'Agreement TAT': 7,
    'Practical TAT': 3,
    'Publication Socials Icons': '',
    'Publication Language': 'English',
    'Publication region': 'Global',
    'Publication Primary Industry / Focus': 'Technology',
    'Website news index': '',
    'DA': 85,
    'DR': 78,
    'Sponsored or not': 'Yes',
    'Words limit': 800,
    'no. of images': 2,
    'Do follow link': 'Yes',
    'Example link': 'https://techdaily.com/sample-article',
    'Exlucding categories': 'Politics',
    'Other remarks': 'High quality publication',
    'Hot deals/ best seller/ top credible. Agency recommended / Fast TAT / East Approval': 'Hot Deal',
    'Live on Platform': 'Yes'
  }
];

// Create workbook and worksheet
const worksheet = xlsx.utils.json_to_sheet(sampleData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Publications');

// Write to file
xlsx.writeFile(workbook, './bulk-upload-sample.xlsx');

console.log('Sample Excel file created: bulk-upload-sample.xlsx');
console.log('File contains sample data for testing bulk upload functionality.');
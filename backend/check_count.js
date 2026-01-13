const fs = require('fs');
const content = fs.readFileSync('populate_publications_upload.js', 'utf8');
// Find where RAW_DATA starts and ends
const startMark = 'const RAW_DATA = [';
const endMark = '];';
const startIndex = content.indexOf(startMark);
const endIndex = content.indexOf(endMark, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
    const arrayContent = content.substring(startIndex + startMark.length - 1, endIndex + endMark.length - 1);
    const rawData = eval(arrayContent);
    console.log('Total records in RAW_DATA:', rawData.length);
    let countByRegion = {};
    rawData.forEach(r => {
        countByRegion[r[1]] = (countByRegion[r[1]] || 0) + 1;
    });
    console.log('Count by Region:', JSON.stringify(countByRegion, null, 2));
} else {
    console.log('Could not find RAW_DATA block');
}

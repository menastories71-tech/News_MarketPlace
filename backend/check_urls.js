const fs = require('fs');
const content = fs.readFileSync('populate_publications_upload.js', 'utf8');
const startMark = 'const RAW_DATA = [';
const endMark = '];';
const startIndex = content.indexOf(startMark);
const endIndex = content.indexOf(endMark, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
    const arrayContent = content.substring(startIndex + startMark.length - 1, endIndex + endMark.length - 1);
    const rawData = eval(arrayContent);
    rawData.forEach(r => {
        const sns = ['Instagram', r[8], 'Facebook', r[9], 'LinkedIn', r[10], 'Twitter', r[12], 'Image', r[11]];
        for (let i = 0; i < sns.length; i += 2) {
            const label = sns[i];
            const url = sns[i + 1];
            if (url && url.length > 255) {
                console.log(`Record ${r[0]} (${r[2]}): ${label} URL too long (${url.length} chars): ${url}`);
            }
        }
    });
}

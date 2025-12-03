require('dotenv').config();
const db = require('./src/config/database');
const PublicationManagement = require('./src/models/PublicationManagement');

// Publications data from spreadsheet
const publicationData = [
  {
    sn: '1',
    region: 'Oman',
    publicationName: 'The Arabian Stories',
    publicationUrl: 'https://www.thearabianstories.com/',
    da: '36',
    articleReferenceLink: 'https://www.thearabianstories.com/2025/09/03/bank-muscat-named-best-investment-bank-by-a-global-institution/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '2',
    priceUsd: '450',
    doFollow: 'Do Follow',
    dr: '36',
    remarks: 'Do follow at additional cost of USD 50'
  },
  {
    sn: '2',
    region: 'UAE',
    publicationName: 'WOW RAK',
    publicationUrl: 'https://wow-rak.com/',
    da: '24',
    articleReferenceLink: 'https://wow-rak.com/rakez-powers-up-global-ties-on-industrial-mission-to-russia/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '3',
    priceUsd: '500',
    doFollow: 'Do Follow',
    dr: '29',
    remarks: 'Do follow at additional cost of USD 50'
  },
  {
    sn: '3',
    region: 'Middle East',
    publicationName: 'Mid East Info',
    publicationUrl: 'https://mid-east.info/',
    da: '33',
    articleReferenceLink: 'https://mid-east.info/wetex-opens-broad-investment-horizons-for-international-companies/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '1',
    priceUsd: '500',
    doFollow: 'Do Follow',
    dr: '27',
    remarks: 'Do follow at extra cost of USD 50Do follow at additional cost of USD 50'
  },
  {
    sn: '4',
    region: 'Middle East',
    publicationName: 'the Finance 360',
    publicationUrl: 'https://www.thefinance360.com/',
    da: '22',
    articleReferenceLink: 'https://www.thefinance360.com/1-billion-followers-summit-announces-4th-edition-with-worlds-largest-ai-film-prize/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '2',
    priceUsd: '550',
    doFollow: 'Do Follow',
    dr: '22',
    remarks: 'Do follow at additional cost of USD 50'
  },
  {
    sn: '5',
    region: 'Middle East',
    publicationName: 'Health Magazine',
    publicationUrl: 'https://healthmagazine.ae/',
    da: '33',
    articleReferenceLink: 'https://healthmagazine.ae/mpcs-breakthrough-in-gene-therapy-distribution/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Healthcare',
    practicalTat: '2',
    priceUsd: '700',
    doFollow: 'Do Follow',
    dr: '26',
    remarks: ''
  },
  {
    sn: '6',
    region: 'Bahrain',
    publicationName: 'Trade Arabia',
    publicationUrl: 'https://www.tradearabia.com/',
    da: '70',
    articleReferenceLink: 'https://www.tradearabia.com/News/436273/Oris-introduces-the-Big-Crown-Calibre-113',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '3',
    priceUsd: '1,000',
    doFollow: 'Do Follow',
    dr: '30',
    remarks: ''
  },
  {
    sn: '7',
    region: 'Bahrain',
    publicationName: 'Gulf Digital News / GDN Online',
    publicationUrl: 'https://www.gdnonline.com/index.html',
    da: '63',
    articleReferenceLink: 'https://www.gdnonline.com/Details/1361259/ASB-Capital-launches-global-technology-fund-with-BlueBox-Asset-Management',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '3',
    priceUsd: '750',
    doFollow: 'Do Follow',
    dr: '40',
    remarks: ''
  },
  {
    sn: '8',
    region: 'Bahrain',
    publicationName: 'The Daily Tribune / News of Bahrain',
    publicationUrl: 'https://www.newsofbahrain.com/',
    da: '59',
    articleReferenceLink: 'https://www.newsofbahrain.com/business/118195.html',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '3',
    priceUsd: '750',
    doFollow: 'Do Follow',
    dr: '43',
    remarks: ''
  },
  {
    sn: '9',
    region: 'Bahrain',
    publicationName: 'Gulf Construction Online',
    publicationUrl: 'https://gulfconstructiononline.com/',
    da: '37',
    articleReferenceLink: 'https://gulfconstructiononline.com/Article/1629250/Kinetics_delivers_a_sound_solution_for_luxury_resort',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Real Estate and Construction',
    practicalTat: '3',
    priceUsd: '700',
    doFollow: 'Do Follow',
    dr: '25',
    remarks: ''
  },
  {
    sn: '10',
    region: 'Bahrain',
    publicationName: 'Gulf Industry Online',
    publicationUrl: 'https://gulfindustryonline.com/',
    da: '28',
    articleReferenceLink: 'https://gulfindustryonline.com/SectionTA/0',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Manufacturing',
    practicalTat: '3',
    priceUsd: '700',
    doFollow: 'Do Follow',
    dr: '22',
    remarks: ''
  },
  {
    sn: '11',
    region: 'Oman',
    publicationName: 'Times of Oman',
    publicationUrl: 'https://timesofoman.com/',
    da: '79',
    articleReferenceLink: 'https://timesofoman.com/article/162340-omans-technology-exhibition-comex-2025-to-begin-on-8-september',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '2',
    priceUsd: '750',
    doFollow: 'Do Follow',
    dr: '53',
    remarks: ''
  },
  {
    sn: '12',
    region: 'Oman',
    publicationName: 'Muscat Daily',
    publicationUrl: 'https://www.muscatdaily.com/',
    da: '59',
    articleReferenceLink: 'https://www.muscatdaily.com/2025/08/19/indian-expatriate-in-muscatto-launch-new-podcast-moving-with-mohit/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '2',
    priceUsd: '750',
    doFollow: 'Do Follow',
    dr: '42',
    remarks: ''
  },
  {
    sn: '13',
    region: 'Kuwait',
    publicationName: 'Arab Times Online',
    publicationUrl: 'https://www.arabtimesonline.com/',
    da: '64',
    articleReferenceLink: 'https://www.arabtimesonline.com/news/honor-magic-v5-officially-launches-in-kuwait-following-successful-pre-order-campaign/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '2',
    priceUsd: '800',
    doFollow: 'Do Follow',
    dr: '46',
    remarks: ''
  },
  {
    sn: '14',
    region: 'UAE',
    publicationName: 'Nukta',
    publicationUrl: 'https://nukta.com/',
    da: '23',
    articleReferenceLink: 'https://nukta.com/business',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '2',
    priceUsd: '900',
    doFollow: 'Do Follow',
    dr: '18',
    remarks: 'Do follow link approval based on link direction'
  },
  {
    sn: '15',
    region: 'UAE',
    publicationName: 'Eye of Dubai',
    publicationUrl: 'https://www.eyeofdubai.ae/',
    da: '32',
    articleReferenceLink: 'https://www.eyeofdubai.ae/news/details/the-future-of-sound-absorption-with-acoustic-plaster',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '3',
    priceUsd: '975',
    doFollow: 'Do Follow',
    dr: '26',
    remarks: 'Do follow link approval based on link direction'
  },
  {
    sn: '16',
    region: 'Saudi',
    publicationName: 'Eye of Riyadh',
    publicationUrl: 'https://www.eyeofriyadh.com/',
    da: '45',
    articleReferenceLink: 'https://www.eyeofriyadh.com/news/details/schneider-electric-accelerates-emobility-in-saudi-arabia-with-new-solutions-strategic-partnerships-and-local-empowerment',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '3',
    priceUsd: '975',
    doFollow: 'Do Follow',
    dr: '47',
    remarks: 'Do follow link approval based on link direction'
  },
  {
    sn: '17',
    region: 'Middle East',
    publicationName: 'The Finance World',
    publicationUrl: 'https://thefinanceworld.com/',
    da: '25',
    articleReferenceLink: 'https://thefinanceworld.com/exclusive-interview-with-kalpesh-khakhria-chairman-of-klay-group',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '2',
    priceUsd: '975',
    doFollow: 'Do Follow',
    dr: '29',
    remarks: ''
  },
  {
    sn: '18',
    region: 'Middle East',
    publicationName: 'Middle East Health',
    publicationUrl: 'https://middleeasthealth.com/',
    da: '17',
    articleReferenceLink: 'https://middleeasthealth.com/product-news/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Healthcare',
    practicalTat: '2',
    priceUsd: '975',
    doFollow: 'Do Follow',
    dr: '20',
    remarks: ''
  },
  {
    sn: '19',
    region: 'Saudi',
    publicationName: 'Al Riyadh Daily',
    publicationUrl: 'https://www.alriyadhdaily.com/',
    da: '37',
    articleReferenceLink: 'https://www.alriyadhdaily.com/article/84b5b605bcb5452c98cba023ae0d2dfd',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '3',
    priceUsd: '999',
    doFollow: 'Do Follow',
    dr: '31',
    remarks: ''
  },
  {
    sn: '20',
    region: 'Kuwait',
    publicationName: 'Kuwait Times',
    publicationUrl: 'https://kuwaittimes.com/',
    da: '60',
    articleReferenceLink: 'https://kuwaittimes.com/business/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newspaper',
    practicalTat: '2',
    priceUsd: '1,500',
    doFollow: 'Do Follow',
    dr: '43',
    remarks: ''
  },
  {
    sn: '21',
    region: 'Middle East',
    publicationName: 'About her',
    publicationUrl: 'https://www.abouther.com/',
    da: '47',
    articleReferenceLink: 'https://www.abouther.com/node/64856/lifestyle/travel-food/unveiling-%E2%80%9Cbahari%E2%80%9D-culinary-celebration-omani-heritage-and',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Lifestyle',
    practicalTat: '5',
    priceUsd: '2,500',
    doFollow: 'Do Follow',
    dr: '32',
    remarks: ''
  },
  {
    sn: '22',
    region: 'Middle East',
    publicationName: 'List Magazine',
    publicationUrl: 'https://www.listmag.com/en',
    da: '25',
    articleReferenceLink: 'https://www.listmag.com/en/sponsored/travel-stay/at-the-st-regis-red-sea-resort-each-moment-is-artfully-composed-3765',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Lifestyle',
    practicalTat: '5',
    priceUsd: '2,500',
    doFollow: 'Do Follow',
    dr: '30',
    remarks: ''
  },
  {
    sn: '23',
    region: 'Middle East',
    publicationName: 'Ashraq Al Awsat English',
    publicationUrl: 'https://english.aawsat.com/',
    da: '75',
    articleReferenceLink: 'https://english.aawsat.com/home/business/section/2531',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '5',
    priceUsd: '3,500',
    doFollow: 'Do Follow',
    dr: '66',
    remarks: ''
  },
  {
    sn: '24',
    region: 'Middle East',
    publicationName: 'Arab News',
    publicationUrl: 'https://www.arabnews.com/',
    da: '82',
    articleReferenceLink: 'https://www.arabnews.com/category/main-category/economy/corporate-news',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '5',
    priceUsd: '3,500',
    doFollow: 'Do Follow',
    dr: '62',
    remarks: ''
  },
  {
    sn: '25',
    region: 'UAE',
    publicationName: 'Al Ethiad English',
    publicationUrl: 'https://en.aletihad.ae/',
    da: '57',
    articleReferenceLink: 'https://en.aletihad.ae/news/business/4602985/lunate-launches-new-etf-tracking-quantum-stocks',
    committedDaysTat: '15',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '5',
    priceUsd: '4,000',
    doFollow: 'Do Follow',
    dr: '52',
    remarks: '"* at the discretion of the publications.\nDo follow link based on content approval"'
  },
  {
    sn: '26',
    region: 'UAE',
    publicationName: 'Emirates 247',
    publicationUrl: 'https://www.emirates247.com/',
    da: '76',
    articleReferenceLink: 'https://www.emirates247.com/business/corporate/space42-signs-strategic-mou-with-angola-2025-08-27-1.740885',
    committedDaysTat: '15',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '5',
    priceUsd: '3,500',
    doFollow: 'Do Follow',
    dr: '38',
    remarks: '"* at the discretion of the publications\nDo follow link based on content approval"'
  },
  {
    sn: '27',
    region: 'Middle East',
    publicationName: 'Gulf Business',
    publicationUrl: 'https://gulfbusiness.com/',
    da: '77',
    articleReferenceLink: 'https://gulfbusiness.com/why-mispricing-climate-risk-is-economic-suicide/',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '5',
    priceUsd: '4,500',
    doFollow: 'Do Follow',
    dr: '46',
    remarks: ''
  },
  {
    sn: '28',
    region: 'Middle East',
    publicationName: 'Arabian Gulf Business Insight',
    publicationUrl: 'https://www.agbi.com/',
    da: '45',
    articleReferenceLink: 'https://www.agbi.com/trade/2025/03/cib-egypt-special-report-bolstering-egypts-trade-with-africa/',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '5',
    priceUsd: '7,000',
    doFollow: 'Do Follow',
    dr: '38',
    remarks: ''
  },
  {
    sn: '29',
    region: 'UAE',
    publicationName: 'The National',
    publicationUrl: 'https://www.thenationalnews.com/uae/',
    da: '88',
    articleReferenceLink: 'https://www.thenationalnews.com/arts-culture/art-design/2024/11/25/hsbc-debuts-connective-works-from-its-global-collection-at-abu-dhabi-art/',
    committedDaysTat: '15',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '10',
    priceUsd: '9,500',
    doFollow: 'Do Follow',
    dr: '59',
    remarks: '"* at the discretion of the publications\nDo follow link approval based on link direction"'
  },
  {
    sn: '30',
    region: 'Middle East',
    publicationName: 'Al Arabiya',
    publicationUrl: 'https://english.alarabiya.net/',
    da: '90',
    articleReferenceLink: 'https://english.alarabiya.net/business/aviation-and-transport/2025/09/03/etihad-airways-ceo-sees-no-rush-for-ipo-with-ample-selffunding',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '5',
    priceUsd: '9,800',
    doFollow: 'Do Follow',
    dr: '77',
    remarks: ''
  },
  {
    sn: '31',
    region: 'Global',
    publicationName: 'Al Jazeera',
    publicationUrl: 'https://www.Aljazeera.com',
    da: '92',
    articleReferenceLink: 'https://www.aljazeera.com/news/2025/5/21/international-tea-day-spilling-the-tea-on-unusual-teas-around-the-world',
    committedDaysTat: '15',
    language: 'English',
    publicationPrimaryFocus: 'News Channel',
    practicalTat: '10',
    priceUsd: '16,000',
    doFollow: 'Do Follow',
    dr: '90',
    remarks: ''
  },
  {
    sn: '32',
    region: 'UAE',
    publicationName: 'Gulf Today',
    publicationUrl: 'https://www.gulftoday.ae/',
    da: '66',
    articleReferenceLink: 'https://www.gulftoday.ae/culture/2025/08/16/ratan-lal-jain-expands-bajao-gaanas-vision-for-global-music-lovers',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Newpaper',
    practicalTat: '2',
    priceUsd: '700',
    doFollow: 'Do Follow',
    dr: '34',
    remarks: ''
  },
  {
    sn: '33',
    region: 'Middle East',
    publicationName: 'MENA FN',
    publicationUrl: 'https://menafn.com/',
    da: '80',
    articleReferenceLink: 'https://menafn.com/1109746712/Blueberry-Launches-New-Brand-And-Website-Signalling-A-Focus-On-Clarity-Precision-And-Trader-Empowerment',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '3',
    priceUsd: '500',
    doFollow: 'No follow',
    dr: '41',
    remarks: ''
  },
  {
    sn: '34',
    region: 'Middle East',
    publicationName: 'Zawya',
    publicationUrl: 'https://www.zawya.com/en',
    da: '80',
    articleReferenceLink: 'https://www.zawya.com/en/business/real-estate/millennium-hotels-unveils-first-branded-homes-in-abu-dhabi-du9cdqel',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '8',
    priceUsd: '1,500',
    doFollow: 'NO Link',
    dr: '47',
    remarks: 'NO links allowed'
  },
  {
    sn: '35',
    region: 'Middle East',
    publicationName: 'Al Bawaba',
    publicationUrl: 'https://www.albawaba.com/',
    da: '83',
    articleReferenceLink: 'https://www.albawaba.com/business/pr/first-time-middle-east-festival-%E2%80%9Cmoscow-1610608',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '5',
    priceUsd: '800',
    doFollow: 'Do Follow',
    dr: '34',
    remarks: 'Do follow at additional cost of USD 150'
  },
  {
    sn: '36',
    region: 'Middle East',
    publicationName: 'Lovin',
    publicationUrl: 'https://lovin.co/',
    da: '57',
    articleReferenceLink: 'https://lovin.co/dubai/en/sponsored/splat-toothpaste-just-landed-in-saudi-arabia/',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'General',
    practicalTat: '9',
    priceUsd: '4,500',
    doFollow: 'Do Follow',
    dr: '37',
    remarks: ''
  },
  {
    sn: '37',
    region: 'UAE',
    publicationName: 'UAE Barq',
    publicationUrl: 'https://www.uaebarq.ae/en/',
    da: '26',
    articleReferenceLink: 'https://www.uaebarq.ae/en/category/economy/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'News',
    practicalTat: '5',
    priceUsd: '500',
    doFollow: 'Do Follow',
    dr: '',
    remarks: 'Do follow at additional cost of USD 50'
  },
  {
    sn: '38',
    region: 'Middle East',
    publicationName: 'Middle East Construction News',
    publicationUrl: 'https://meconstructionnews.com/',
    da: '46',
    articleReferenceLink: 'https://meconstructionnews.com/64698/centurion-properties-launches-burj-capital-business-bay',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Real Estate',
    practicalTat: '5',
    priceUsd: '2,000',
    doFollow: 'Do Follow',
    dr: '',
    remarks: ''
  },
  {
    sn: '39',
    region: 'Middle East',
    publicationName: 'Tech it UP Middle East',
    publicationUrl: 'https://techitupme.com/',
    da: '20',
    articleReferenceLink: 'https://techitupme.com/mtn-business-cloudflare-to-deliver-managed-security-services-in-south-africa/',
    committedDaysTat: '5',
    language: 'English',
    publicationPrimaryFocus: 'Tech',
    practicalTat: '5',
    priceUsd: '1,000',
    doFollow: 'Do Follow',
    dr: '',
    remarks: ''
  },
  {
    sn: '40',
    region: 'Middle East',
    publicationName: 'Intelligent CIO Middle East',
    publicationUrl: 'https://www.intelligentcio.com/me/',
    da: '',
    articleReferenceLink: 'https://www.intelligentcio.com/me/2025/07/14/joacademy-partners-with-truecaller-to-deliver-trusted-communication-experience-for-student-ecosystem-in-jordan/',
    committedDaysTat: '48',
    language: 'English',
    publicationPrimaryFocus: 'Tech',
    practicalTat: '10',
    priceUsd: '2,500',
    doFollow: 'Do Follow',
    dr: '',
    remarks: ''
  },
  {
    sn: '41',
    region: 'Middle East',
    publicationName: 'Tahawultech',
    publicationUrl: 'https://www.tahawultech.com/',
    da: '60',
    articleReferenceLink: 'https://www.tahawultech.com/channel/omnix-expands-matterport-powered-digital-twin-solutions-in-saudi-arabia/',
    committedDaysTat: '10',
    language: 'English',
    publicationPrimaryFocus: 'Tech',
    practicalTat: '5',
    priceUsd: '2,000',
    doFollow: 'Do Follow',
    dr: '',
    remarks: ''
  },
  {
    sn: '42',
    region: 'Middle East',
    publicationName: 'MEED',
    publicationUrl: 'https://www.meed.com/',
    da: '56',
    articleReferenceLink: 'https://www.meed.com/in-depth/market-talk',
    committedDaysTat: '15',
    language: 'English',
    publicationPrimaryFocus: 'Business, Trade, Economy, Finance, General',
    practicalTat: '15',
    priceUsd: '10,000',
    doFollow: 'Do Follow',
    dr: '45',
    remarks: 'Do follow link approval based on link direction'
  }
];

// Process a single publication management record
async function processPublicationManagement(pubData) {
  try {
    // Parse numeric fields
    const da = pubData.da ? parseInt(pubData.da) : null;
    const dr = pubData.dr ? parseInt(pubData.dr) : null;
    const committedTat = pubData.committedDaysTat ? parseInt(pubData.committedDaysTat) : null;
    const practicalTat = pubData.practicalTat ? parseInt(pubData.practicalTat) : null;
    const priceUsd = pubData.priceUsd ? parseFloat(pubData.priceUsd.replace(/,/g, '')) : null;

    // Parse do_follow
    const doFollow = pubData.doFollow && pubData.doFollow.toLowerCase().includes('do follow');

    // Map data to PublicationManagement model fields
    const publicationDataForModel = {
      region: pubData.region || null,
      publication_name: pubData.publicationName,
      publication_url: pubData.publicationUrl || null,
      da: da,
      article_reference_link: pubData.articleReferenceLink || null,
      committed_tat: committedTat,
      language: pubData.language || null,
      publication_primary_focus: pubData.publicationPrimaryFocus || null,
      practical_tat: practicalTat,
      price_usd: priceUsd,
      do_follow: doFollow,
      dr: dr,
      remarks: pubData.remarks || null
    };

    const savedPublication = await PublicationManagement.create(publicationDataForModel);
    console.log(`Saved publication management record: ${savedPublication.publication_name}`);
    return true;

  } catch (error) {
    console.error(`Error processing publication management ${pubData.publicationName}:`, error.message);
    return false;
  }
}

async function populatePublicationManagementData() {
  try {
    console.log('Starting publication management data population...');

    let totalSuccess = 0;
    let totalError = 0;

    console.log(`Processing ${publicationData.length} publication management records...`);

    for (const publication of publicationData) {
      const success = await processPublicationManagement(publication);
      if (success) {
        totalSuccess++;
      } else {
        totalError++;
      }
    }

    console.log(`\n=== Population Complete ===`);
    console.log(`Success: ${totalSuccess}, Errors: ${totalError}`);

    // Get final counts
    try {
      const totalResult = await db.query('SELECT COUNT(*) as count FROM publication_managements');
      console.log(`Total publication management records in database: ${totalResult.rows[0].count}`);
    } catch (countError) {
      console.log('Could not get final counts:', countError.message);
    }

  } catch (error) {
    console.error('Error in populatePublicationManagementData:', error);
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();

  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);

  populatePublicationManagementData()
    .then(() => {
      console.log('\nPublication management data population script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populatePublicationManagementData };
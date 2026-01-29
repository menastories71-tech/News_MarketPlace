import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../frontend/public');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const SITE_URL = process.env.SITE_URL || 'https://vaas.solutions';

// Helper to parse existing sitemap and extract existing URLs
function parseExistingSitemap(sitemapPath) {
    try {
        if (!fs.existsSync(sitemapPath)) return new Map();
        const content = fs.readFileSync(sitemapPath, 'utf-8');
        const urlMap = new Map();
        const urlRegex = /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>.*?<\/url>/gs;
        let match;
        while ((match = urlRegex.exec(content)) !== null) {
            urlMap.set(match[1], match[2]);
        }
        return urlMap;
    } catch (err) {
        console.error('⚠️ Could not parse existing sitemap:', err.message);
        return new Map();
    }
}

async function generateFiles() {
    try {
        console.log('🚀 Starting SEO file regeneration...');

        // 1. Load existing sitemap to preserve URLs if API fails
        const existingSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
        const existingUrls = parseExistingSitemap(existingSitemapPath);
        console.log(`📋 Found ${existingUrls.size} existing URLs in sitemap`);

        // Helper to fetch safe using native fetch (Node 18+)
        const fetchSafe = async (url, label) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }
                const data = await response.json();
                // Handle different response structures
                return data[label] || data.publications || data.blogs || data.events ||
                    data.nominations || data.eventCreations ||
                    data.careers || data.awards || data.themes || data.theme ||
                    data.pressPacks || data.pressPack || data.radios || data.radio ||
                    data.paparazzis || data.paparazzi ||
                    data.podcasters || data.podcaster ||
                    data.realEstateProfessionals || data.realEstateProfessional ||
                    data.publishedWorks || data.publishedWork || [];
            } catch (err) {
                console.error(`⚠️ Failed to fetch ${label}: ${err.message}`);
                return null; // Return null to indicate failure (not empty array)
            }
        };

        // 2. Fetch all dynamic data
        const [
            publications,
            blogs,
            events,
            powerlists,
            eventCreations,
            careers,
            awards,
            themes,
            pressPacks,
            radios,
            paparazzis,
            podcasters,
            realEstateProfessionals,
            publishedWorks
        ] = await Promise.all([
            fetchSafe(`${API_URL}/publications/public?limit=1000`, 'publications'),
            fetchSafe(`${API_URL}/blogs?limit=1000`, 'blogs'),
            fetchSafe(`${API_URL}/events?limit=1000`, 'events'),
            fetchSafe(`${API_URL}/powerlist-nominations/public?limit=1000`, 'nominations'),
            fetchSafe(`${API_URL}/admin/event-creations/public?limit=1000`, 'eventCreations'),
            fetchSafe(`${API_URL}/careers?limit=1000`, 'careers'),
            fetchSafe(`${API_URL}/awards?limit=1000`, 'awards'),
            fetchSafe(`${API_URL}/themes/public?limit=1000`, 'themes'),
            fetchSafe(`${API_URL}/press-packs/public?limit=1000`, 'pressPacks'),
            fetchSafe(`${API_URL}/radios/public?limit=1000`, 'radios'),
            fetchSafe(`${API_URL}/paparazzi/public?limit=1000`, 'paparazzis'),
            fetchSafe(`${API_URL}/podcasters/approved?limit=1000`, 'podcasters'),
            fetchSafe(`${API_URL}/real-estate-professionals?limit=1000`, 'realEstateProfessionals'),
            fetchSafe(`${API_URL}/published-works?limit=1000`, 'publishedWorks')
        ]);

        const lastMod = new Date().toISOString().split('T')[0];

        // 3. Build sitemap.xml with all URLs
        const allUrls = new Map();

        // Helper to add URL to the map (latest addition wins)
        const addUrl = (loc, priority = '0.7', changefreq = 'weekly') => {
            allUrls.set(loc, { lastmod: lastMod, priority, changefreq });
        };

        // 3a. Add ALL static routes (complete list from App.jsx)
        const staticRoutes = [
            { path: '', priority: '1.0', changefreq: 'daily' },
            { path: '/about-us', priority: '0.8' },
            { path: '/contact-us', priority: '0.8' },
            { path: '/faq', priority: '0.7' },
            { path: '/terms-and-conditions', priority: '0.5' },
            { path: '/privacy-policy', priority: '0.5' },
            { path: '/cookie-policy', priority: '0.5' },
            { path: '/refund-policy', priority: '0.5' },
            { path: '/csr', priority: '0.6' },
            { path: '/trademark-policy', priority: '0.5' },
            { path: '/data-protection', priority: '0.5' },
            { path: '/reselling-agreement', priority: '0.5' },
            { path: '/press-guidelines', priority: '0.6' },
            { path: '/brands-people', priority: '0.7' },
            { path: '/media-partnerships', priority: '0.7' },
            { path: '/services-overview', priority: '0.8' },
            { path: '/how-it-works', priority: '0.7' },
            { path: '/publications', priority: '0.9' },
            { path: '/blogs', priority: '0.9' },
            { path: '/events', priority: '0.9' },
            { path: '/power-lists', priority: '0.9' },
            { path: '/orders-delivered', priority: '0.8' },
            { path: '/awards', priority: '0.9' },
            { path: '/themes', priority: '0.8' },
            { path: '/press-packs', priority: '0.8' },
            { path: '/radio', priority: '0.8' },
            { path: '/paparazzi', priority: '0.8' },
            { path: '/podcasters', priority: '0.8' },
            { path: '/real-estate-professionals', priority: '0.8' },
            { path: '/careers', priority: '0.8' },
            { path: '/published-works', priority: '0.8' },
            { path: '/event-enquiry', priority: '0.7' },
            { path: '/affiliate-program', priority: '0.7' },
            { path: '/video-tutorials', priority: '0.6' },
            { path: '/how-to-guides', priority: '0.6' },
            { path: '/download-center', priority: '0.6' },
            { path: '/resource-library', priority: '0.6' }
        ];

        staticRoutes.forEach(route => {
            addUrl(`${SITE_URL}${route.path}`, route.priority, route.changefreq || 'weekly');
        });

        // 3b. Add dynamic publications (only if fetch succeeded)
        if (publications && Array.isArray(publications)) {
            publications.forEach(pub => {
                const slug = (pub.publication_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pub.id) {
                    addUrl(`${SITE_URL}/publications/${slug}-${pub.id}`, '0.6');
                }
            });
        } else {
            console.log('⚠️ Preserving existing publication URLs');
            // Preserve existing publication URLs
            existingUrls.forEach((_, url) => {
                if (url.includes('/publications/') && !url.endsWith('/publications')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.6', changefreq: 'weekly' });
                }
            });
        }

        // 3c. Add dynamic blogs
        if (blogs && Array.isArray(blogs)) {
            blogs.forEach(blog => {
                const slug = (blog.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && blog.id) {
                    addUrl(`${SITE_URL}/blog/${slug}-${blog.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/blog/') && !url.endsWith('/blogs')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3d. Add dynamic events
        if (events && Array.isArray(events)) {
            events.forEach(event => {
                const slug = (event.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && event.id) {
                    addUrl(`${SITE_URL}/events/${slug}-${event.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/events/') && !url.endsWith('/events')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3e. Add dynamic powerlists
        if (powerlists && Array.isArray(powerlists)) {
            powerlists.forEach(pl => {
                const slug = (pl.power_list_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pl.id) {
                    addUrl(`${SITE_URL}/power-lists/${slug}-${pl.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/power-lists/') && !url.endsWith('/power-lists')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3f. Add dynamic event creations (using /events/ path as these are events)
        if (eventCreations && Array.isArray(eventCreations)) {
            eventCreations.forEach(ec => {
                const slug = (ec.event_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && ec.id) {
                    addUrl(`${SITE_URL}/events/${slug}-${ec.id}`, '0.7');
                }
            });
        } else {
            // EventCreations are preserved via /events/ URLs above
            console.log('⚠️ Event creations fetch failed, preserving existing event URLs');
        }

        // 3g. Add dynamic careers
        if (careers && Array.isArray(careers)) {
            careers.forEach(career => {
                const slug = (career.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && career.id) {
                    addUrl(`${SITE_URL}/careers/${slug}-${career.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/careers/') && !url.endsWith('/careers')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3h. Add dynamic awards
        if (awards && Array.isArray(awards)) {
            awards.forEach(award => {
                const slug = (award.title || award.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && award.id) {
                    addUrl(`${SITE_URL}/awards/${slug}-${award.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/awards/') && !url.endsWith('/awards')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3i. Add dynamic themes
        if (themes && Array.isArray(themes)) {
            themes.forEach(theme => {
                const slug = (theme.name || theme.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && theme.id) {
                    addUrl(`${SITE_URL}/themes/${slug}-${theme.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/themes/') && !url.endsWith('/themes')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3j. Add dynamic press packs
        if (pressPacks && Array.isArray(pressPacks)) {
            pressPacks.forEach(pack => {
                const slug = (pack.name || pack.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pack.id) {
                    addUrl(`${SITE_URL}/press-packs/${slug}-${pack.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/press-packs/') && !url.endsWith('/press-packs')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3k. Add dynamic radios
        if (radios && Array.isArray(radios)) {
            radios.forEach(radio => {
                const slug = (radio.name || radio.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && radio.id) {
                    addUrl(`${SITE_URL}/radio/${slug}-${radio.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/radio/') && !url.endsWith('/radio')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3l. Add dynamic paparazzis
        if (paparazzis && Array.isArray(paparazzis)) {
            paparazzis.forEach(pap => {
                const slug = (pap.name || pap.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pap.id) {
                    addUrl(`${SITE_URL}/paparazzi/${slug}-${pap.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/paparazzi/') && !url.endsWith('/paparazzi')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3m. Add dynamic podcasters
        if (podcasters && Array.isArray(podcasters)) {
            podcasters.forEach(pod => {
                const slug = (pod.name || pod.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pod.id) {
                    addUrl(`${SITE_URL}/podcasters/${pod.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/podcasters/') && !url.endsWith('/podcasters')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3n. Add dynamic real estate professionals
        if (realEstateProfessionals && Array.isArray(realEstateProfessionals)) {
            realEstateProfessionals.forEach(rep => {
                const slug = (rep.name || rep.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && rep.id) {
                    addUrl(`${SITE_URL}/real-estate-professionals/${rep.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/real-estate-professionals/') && !url.endsWith('/real-estate-professionals')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 3o. Add dynamic published works
        if (publishedWorks && Array.isArray(publishedWorks)) {
            publishedWorks.forEach(pw => {
                const slug = (pw.title || pw.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                if (slug && pw.id) {
                    addUrl(`${SITE_URL}/published-works/${slug}-${pw.id}`, '0.7');
                }
            });
        } else {
            existingUrls.forEach((_, url) => {
                if (url.includes('/published-works/') && !url.endsWith('/published-works')) {
                    allUrls.set(url, { lastmod: existingUrls.get(url), priority: '0.7', changefreq: 'weekly' });
                }
            });
        }

        // 4. Generate the sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Sort URLs: static pages first (by priority desc), then dynamic pages (by lastmod desc)
        const sortedUrls = Array.from(allUrls.entries()).sort((a, b) => {
            const priorityA = parseFloat(a[1].priority);
            const priorityB = parseFloat(b[1].priority);
            if (priorityA !== priorityB) return priorityB - priorityA;
            return a[0].localeCompare(b[0]);
        });

        sortedUrls.forEach(([loc, data]) => {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${loc}</loc>\n`;
            sitemap += `    <lastmod>${data.lastmod}</lastmod>\n`;
            sitemap += `    <changefreq>${data.changefreq}</changefreq>\n`;
            sitemap += `    <priority>${data.priority}</priority>\n`;
            sitemap += `  </url>\n`;
        });

        sitemap += `</urlset>`;
        fs.writeFileSync(existingSitemapPath, sitemap);
        console.log(`✅ Sitemap updated with ${allUrls.size} URLs`);

        // 5. Build rss.xml
        let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
        rss += `  <title>VaaS Solutions | News Marketplace</title>\n  <link>${SITE_URL}</link>\n`;
        rss += `  <description>Latest premium publications, events, and media news from VaaS Solutions.</description>\n`;
        rss += `  <language>en-us</language>\n`;
        rss += `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
        rss += `  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

        // Add blogs to RSS
        if (blogs && Array.isArray(blogs)) {
            blogs.slice(0, 20).forEach(blog => {
                const slug = (blog.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                const description = (blog.excerpt || blog.description || '').replace(/[<>&'"]/g, char => ({
                    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;'
                }[char]));
                rss += `  <item>\n`;
                rss += `    <title><![CDATA[${blog.title || 'Untitled'}]]></title>\n`;
                rss += `    <link>${SITE_URL}/blog/${slug}-${blog.id}</link>\n`;
                rss += `    <guid isPermaLink="true">${SITE_URL}/blog/${slug}-${blog.id}</guid>\n`;
                rss += `    <description><![CDATA[${description}]]></description>\n`;
                rss += `    <pubDate>${new Date(blog.createdAt || blog.created_at || Date.now()).toUTCString()}</pubDate>\n`;
                rss += `  </item>\n`;
            });
        }

        // Add events to RSS
        if (events && Array.isArray(events)) {
            events.slice(0, 10).forEach(event => {
                const slug = (event.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                const description = (event.description || event.excerpt || '').replace(/[<>&'"]/g, char => ({
                    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;'
                }[char]));
                rss += `  <item>\n`;
                rss += `    <title><![CDATA[${event.title || 'Untitled Event'}]]></title>\n`;
                rss += `    <link>${SITE_URL}/events/${slug}-${event.id}</link>\n`;
                rss += `    <guid isPermaLink="true">${SITE_URL}/events/${slug}-${event.id}</guid>\n`;
                rss += `    <description><![CDATA[${description}]]></description>\n`;
                rss += `    <pubDate>${new Date(event.createdAt || event.created_at || Date.now()).toUTCString()}</pubDate>\n`;
                rss += `  </item>\n`;
            });
        }

        rss += `</channel>\n</rss>`;
        fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rss);
        console.log('✅ RSS feed updated');

        console.log('✅ SEO files updated successfully!');
    } catch (error) {
        console.error('❌ Failed to regenerate SEO files:', error.message);
    }
}

generateFiles();

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../frontend/public');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SITE_URL = 'https://vaas.solutions';

async function generateFiles() {
    try {
        console.log('🚀 Starting SEO file regeneration...');

        // 1. Fetch Dynamic Data
        // 1. Fetch Dynamic Data
        // Helper to fetch safe
        const fetchSafe = (url, label) => axios.get(url)
            .then(res => res.data[label] || res.data.nominations || res.data.eventCreations || [])
            .catch(err => {
                console.error(`⚠️ Failed to fetch ${label}: ${err.message}`);
                return [];
            });

        const [publications, blogs, events, powerlists, eventCreations] = await Promise.all([
            fetchSafe(`${API_URL}/publications/public`, 'publications'),
            fetchSafe(`${API_URL}/blogs`, 'blogs'),
            fetchSafe(`${API_URL}/events`, 'events'),
            fetchSafe(`${API_URL}/powerlist-nominations/public`, 'nominations'),
            fetchSafe(`${API_URL}/admin/event-creations/public`, 'eventCreations')
        ]);

        const lastMod = new Date().toISOString().split('T')[0];

        // 2. Build sitemap.xml
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Add static routes (samples)
        const staticRoutes = ['', '/about-us', '/publications', '/blogs', '/events', '/power-lists', '/orders-delivered'];
        staticRoutes.forEach(route => {
            sitemap += `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
        });

        // Add dynamic publications
        publications.forEach(pub => {
            const slug = (pub.publication_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            sitemap += `  <url>\n    <loc>${SITE_URL}/publications/${slug}-${pub.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        // Add dynamic blogs
        blogs.forEach(blog => {
            const slug = (blog.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            sitemap += `  <url>\n    <loc>${SITE_URL}/blog/${slug}-${blog.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        // Add dynamic events
        events.forEach(event => {
            const slug = (event.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            sitemap += `  <url>\n    <loc>${SITE_URL}/events/${slug}-${event.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        // Add dynamic powerlists
        powerlists.forEach(pl => {
            const slug = (pl.power_list_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            sitemap += `  <url>\n    <loc>${SITE_URL}/power-lists/${slug}-${pl.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        // Add dynamic event creations
        eventCreations.forEach(ec => {
            const slug = (ec.event_name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            // Using /event-directory/ as a placeholder path for these items since they come from 'Event Creation' module
            sitemap += `  <url>\n    <loc>${SITE_URL}/event-directory/${slug}-${ec.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        sitemap += `</urlset>`;
        fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);

        // 3. Build rss.xml
        let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
        rss += `  <title>News Marketplace | Vision to Visibility</title>\n  <link>${SITE_URL}</link>\n`;
        rss += `  <description>Latest premium publications and media news.</description>\n`;

        blogs.slice(0, 10).forEach(blog => {
            rss += `  <item>\n    <title>${blog.title}</title>\n    <link>${SITE_URL}/blogs/${blog.id}</link>\n    <description>${blog.excerpt || ''}</description>\n    <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>\n  </item>\n`;
        });

        rss += `</channel>\n</rss>`;
        fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rss);

        console.log('✅ SEO files updated successfully!');
    } catch (error) {
        console.error('❌ Failed to regenerate SEO files:', error.message);
    }
}

generateFiles();

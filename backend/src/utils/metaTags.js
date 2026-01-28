const { Pool } = require('pg');
require('dotenv').config();

let pool;
try {
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    pool.on('error', (err) => {
        console.error('[META-POOL-ERROR] Unexpected error on idle client', err);
    });
} catch (e) {
    console.error('[META-INIT-ERROR] Failed to initialize PG pool:', e);
}

/**
 * Extracts the ID from a slug-id string
 * @param {string} slugId - The slug combined with ID (e.g. "my-title-123")
 * @returns {string|null} - The ID part
 */
const getIdFromSlug = (slugId) => {
    if (!slugId) return null;
    const s = String(slugId).trim();

    // Remove trailing slash
    const clean = s.endsWith('/') ? s.slice(0, -1) : s;

    // Check if it's a numeric ID already or a slug like "some-title-123"
    // Use regex to find the last numeric part after a hyphen or the whole string if numeric
    if (/^\d+$/.test(clean)) return parseInt(clean, 10);

    const match = clean.match(/-(\d+)$/);
    if (match) return parseInt(match[1], 10);

    return null;
};

const getMetaData = async (route, idOrSlug) => {
    let title = 'News Marketplace';
    let description = 'VaaS Solutions is your one-stop destination for news, industry insights, publications, events, and professional networking. Explore blogs, awards, careers, and more with our global marketplace.';
    let image = 'https://vaas.solutions/logo.png'; // Default logo
    const id = getIdFromSlug(idOrSlug);
    let url = `https://vaas.solutions/${route}/${idOrSlug || ''}`;

    // Improve fallback title based on route (for listing pages)
    if (!idOrSlug) {
        const routeTitles = {
            'publications': 'Verified Media Publications',
            'events': 'Industry Events & Networking',
            'blog': 'Marketplace Insights & Blogs',
            'blogs': 'Marketplace Insights & Blogs',
            'careers': 'Career Opportunities in Media',
            'themes': 'Media Themes & Curated Lists',
            'power-lists': 'Power Lists & Industry Leaders',
            'paparazzi': 'Influencer & Social Media Pages',
            'awards': 'Awards & Recognitions',
            'real-estate-professionals': 'Real Estate Experts Directory',
            'radio': 'Radio Stations & Broadcasters',
            'podcasters': 'Top Podcasters Directory',
            'press-packs': 'Media Press Packs',
            'published-works': 'Our Published Media Works'
        };
        if (routeTitles[route]) {
            title = routeTitles[route];
            description = `Explore the best ${routeTitles[route]} on VaaS Solutions. Connect with industry leaders and grow your presence.`;
        }
    }

    // Improve fallback title from slug if possible (for detail pages)
    if (idOrSlug && typeof idOrSlug === 'string') {
        let slugPart = idOrSlug;
        if (slugPart.includes('-')) {
            const parts = slugPart.split('-');
            if (!isNaN(parts[parts.length - 1])) {
                parts.pop();
            }
            slugPart = parts.join(' ');
        }
        title = slugPart
            .split(' ')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
    }

    console.log(`[META-DEBUG] Generating tags for Route: ${route}, Slug: ${idOrSlug}, Extracted ID: ${id}`);

    try {
        if (id && pool) {
            // Check if we are connected to the pool
            if (typeof pool.query === 'function') {
                switch (route) {
                    case 'publications': {
                        const res = await pool.query('SELECT publication_name, remarks, image FROM publication_managements WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].publication_name;
                            description = res.rows[0].remarks || description;
                            image = res.rows[0].image || image;
                        } else {
                            // Fallback to publications table
                            const resPub = await pool.query('SELECT publication_name, other_remarks FROM publications WHERE id = $1', [id]);
                            if (resPub.rows[0]) {
                                title = resPub.rows[0].publication_name;
                                description = resPub.rows[0].other_remarks || description;
                            }
                        }
                        break;
                    }
                    case 'events': {
                        const res = await pool.query('SELECT event_name, event_description, event_image FROM events WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].event_name;
                            description = res.rows[0].event_description || description;
                            image = res.rows[0].event_image || image;
                        }
                        break;
                    }
                    case 'blog':
                    case 'blogs': {
                        const res = await pool.query('SELECT title, content, image FROM blogs WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].title;
                            description = res.rows[0].content ? res.rows[0].content.substring(0, 160) : description;
                            image = res.rows[0].image || image;
                        }
                        break;
                    }
                    case 'careers': {
                        const res = await pool.query('SELECT title, description FROM careers WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].title;
                            description = res.rows[0].description || description;
                        }
                        break;
                    }
                    case 'themes': {
                        const res = await pool.query('SELECT theme_name, theme_description, theme_image FROM themes WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].theme_name;
                            description = res.rows[0].theme_description || description;
                            image = res.rows[0].theme_image || image;
                        }
                        break;
                    }
                    case 'power-lists': {
                        const res = await pool.query('SELECT nomination_name, company_name, description FROM powerlist_nominations WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = `${res.rows[0].nomination_name} - ${res.rows[0].company_name}`;
                            description = res.rows[0].description || description;
                        }
                        break;
                    }
                    case 'paparazzi': {
                        const res = await pool.query('SELECT instagram_page_name, category, profile_dp_logo FROM paparazzi_creations WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].instagram_page_name;
                            description = `Social Media Page - Category: ${res.rows[0].category}`;
                            image = res.rows[0].profile_dp_logo || image;
                        }
                        break;
                    }
                    case 'awards': {
                        const res = await pool.query('SELECT award_name, industry, image FROM award_creations WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].award_name;
                            description = res.rows[0].industry || description;
                            image = res.rows[0].image || image;
                        }
                        break;
                    }
                    case 'real-estate-professionals': {
                        const res = await pool.query('SELECT full_name, bio, profile_image FROM real_estate_professionals WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].full_name;
                            description = res.rows[0].bio || description;
                            image = res.rows[0].profile_image || image;
                        }
                        break;
                    }
                    case 'radio': {
                        const res = await pool.query('SELECT station_name, description, logo FROM radios WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = `${res.rows[0].station_name} | Radio Station Broadcaster`;
                            description = res.rows[0].description || `Listen to ${res.rows[0].station_name} on VaaS Solutions. Explore top radio stations and broadcasters globally.`;
                            image = res.rows[0].logo || image;
                        }
                        break;
                    }
                    case 'podcasters': {
                        const res = await pool.query('SELECT podcast_name as name, podcast_host as host, cta as description, image FROM podcasters WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = `${res.rows[0].name} | Podcast Host`;
                            description = res.rows[0].description || `Connect with ${res.rows[0].host}, host of ${res.rows[0].name}, on VaaS Solutions. Explore top podcasts and media influencers.`;
                            image = res.rows[0].image || image;
                        }
                        break;
                    }
                    case 'press-packs': {
                        const res = await pool.query('SELECT pack_name, description, image FROM press_packs WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].pack_name;
                            description = res.rows[0].description || description;
                            image = res.rows[0].image || image;
                        }
                        break;
                    }
                    case 'published-works': {
                        const res = await pool.query('SELECT publication_name, description FROM published_works WHERE id = $1', [id]);
                        if (res.rows[0]) {
                            title = res.rows[0].publication_name;
                            description = res.rows[0].description || description;
                        }
                        break;
                    }
                }
            } else {
                console.error('[META-ERROR] Pool is not initialized correctly');
            }
        } else {
            console.log(`[META-INFO] Skipping DB query - ID: ${id}, Pool exists: ${!!pool}`);
        }
    } catch (error) {
        console.error('[META-ERROR] Database query or switch logic failed:', error);
    }

    // Ensure absolute image URL logic
    if (image && typeof image === 'string' && image.length > 0) {
        if (!image.startsWith('http')) {
            if (image.startsWith('//')) {
                image = `https:${image}`;
            } else {
                const cleanSource = image.startsWith('/') ? image.substring(1) : image;
                image = `https://vaas.solutions/${cleanSource}`;
            }
        }
    }

    // Final image fallback
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
        image = 'https://vaas.solutions/logo.png';
    }

    // Determine image type
    let imageType = 'image/jpeg';
    if (image.toLowerCase().endsWith('.png')) imageType = 'image/png';
    else if (image.toLowerCase().endsWith('.gif')) imageType = 'image/gif';
    else if (image.toLowerCase().endsWith('.webp')) imageType = 'image/webp';

    // Determine Open Graph type
    let ogType = 'website';
    if (['publications', 'blog', 'blogs', 'published-works'].includes(route)) {
        ogType = 'article';
    }

    const finalTitle = title === 'News Marketplace' ? 'News Marketplace - Dynamic' : title;

    // Sanitize description
    const cleanDescription = description ? description
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() : 'Your one-stop destination for news and industry insights.';

    let metaDescription = cleanDescription;
    if (metaDescription.length > 250) {
        metaDescription = metaDescription.substring(0, 247) + '...';
    }

    return `
<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${finalTitle} | VaaS Solutions</title>
    <meta name="description" content="${metaDescription}">

    <link rel="canonical" href="${url}">
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="${finalTitle} | VaaS Solutions">
    <meta name="description" content="${metaDescription}">
    <link rel="image_src" href="${image}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="VaaS Solutions">
    <meta property="og:title" content="${finalTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:url" content="${image}">
    <meta property="og:image:type" content="${imageType}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${finalTitle}">
    <meta property="og:locale" content="en_US">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${finalTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${finalTitle}">
    <meta name="twitter:site" content="@vaassolutions">

    <!-- Schema.org for Google -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "${ogType === 'article' ? 'NewsArticle' : 'WebPage'}",
      "headline": "${finalTitle.replace(/"/g, '\\"')}",
      "image": ["${image}"],
      "url": "${url}",
      "description": "${metaDescription.replace(/"/g, '\\"')}",
      "publisher": {
        "@type": "Organization",
        "name": "VaaS Solutions",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vaas.solutions/logo.png"
        }
      }
    }
    </script>

    <!-- Redirect for humans -->
    <script>
        // Only redirect if not a bot
        const ua = navigator.userAgent;
        const isBot = /bot|crawler|spider|facebook|linkedin|twitter|whatsapp|slack|discord|telegram/i.test(ua);
        if (!isBot) {
            window.location.replace("${url}");
        }
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0;url=${url}">
    </noscript>
</head>
<body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
    <div style="max-width: 600px; width: 90%; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
        <img src="${image}" alt="${finalTitle}" style="max-width: 240px; height: auto; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h1 style="color: #212121; font-size: 24px; margin-bottom: 16px;">${finalTitle}</h1>
        <p style="color: #757575; line-height: 1.6; font-size: 16px; margin-bottom: 32px;">${metaDescription}</p>
        <a href="${url}" style="display: inline-block; background-color: #1976D2; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: background-color 0.2s;">
            Continue to Site
        </a>
    </div>
</body>
</html>
    `;
};

module.exports = { getMetaData };

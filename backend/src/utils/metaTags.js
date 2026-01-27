const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

/**
 * Extracts the ID from a slug-id string
 * @param {string} slugId - The slug combined with ID (e.g. "my-title-123")
 * @returns {string|null} - The ID part
 */
const getIdFromSlug = (slugId) => {
    if (!slugId) return null;
    if (!isNaN(slugId)) return slugId; // If it's just a number
    const parts = slugId.split('-');
    return parts[parts.length - 1];
};

const getMetaData = async (route, idOrSlug) => {
    let title = 'News Marketplace';
    let description = 'Your one-stop destination for news and industry insights.';
    let image = 'https://vaas.solutions/logo.png'; // Default logo
    const id = getIdFromSlug(idOrSlug);
    let url = `https://vaas.solutions/${route}/${idOrSlug}`;

    // Improve fallback title from slug
    if (idOrSlug && typeof idOrSlug === 'string' && idOrSlug.includes('-')) {
        const parts = idOrSlug.split('-');
        if (!isNaN(parts[parts.length - 1])) {
            parts.pop(); // Remove the ID if it's a number
        }
        const slugTitle = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        if (slugTitle) title = slugTitle;
    }

    try {
        switch (route) {
            case 'publications': {
                const res = await pool.query('SELECT publication_name, remarks, image FROM publication_managements WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].publication_name;
                    description = res.rows[0].remarks || description;
                    image = res.rows[0].image || image;
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
                    description = `Social Media Page - Category: ${res.rows[0].category}` || description;
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
                    title = res.rows[0].station_name;
                    description = res.rows[0].description || description;
                    image = res.rows[0].logo || image;
                }
                break;
            }
            case 'podcasters': {
                const res = await pool.query('SELECT name, description, image FROM podcasters WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].name;
                    description = res.rows[0].description || description;
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
        }
    } catch (error) {
        console.error('Error fetching metadata (db):', error);
    }

    // Ensure absolute image URL with improved logic
    if (image && typeof image === 'string' && image.length > 0) {
        if (!image.startsWith('http')) {
            // Handle protocol-relative URLs (//example.com)
            if (image.startsWith('//')) {
                image = `https:${image}`;
            } else {
                // Remove leading slash if present to avoid double slashes
                const cleanSource = image.startsWith('/') ? image.substring(1) : image;
                image = `https://vaas.solutions/${cleanSource}`;
            }
        }
    } else {
        // Fallback to high-resolution logo if possible, or standard logo
        image = 'https://vaas.solutions/logo.png';
    }

    // Sanitize description (remove HTML tags and newlines)
    const cleanDescription = description ? description
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() : 'Your one-stop destination for news and industry insights.';

    let metaDescription = cleanDescription;
    if (metaDescription.length > 200) {
        metaDescription = metaDescription.substring(0, 197) + '...';
    }

    // Determine image type
    let imageType = 'image/jpeg';
    if (image.toLowerCase().endsWith('.png')) imageType = 'image/png';
    else if (image.toLowerCase().endsWith('.gif')) imageType = 'image/gif';
    else if (image.toLowerCase().endsWith('.webp')) imageType = 'image/webp';

    // Determine Open Graph type
    let ogType = 'website';
    if (['publications', 'blog', 'blogs'].includes(route)) {
        ogType = 'article';
    }

    return `
<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | News Marketplace</title>
    <meta name="description" content="${metaDescription}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:type" content="${imageType}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="VaaS Solutions">
    <meta property="og:locale" content="en_US">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${metaDescription}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${title}">

    <link rel="canonical" href="${url}">

    <!-- Redirect for humans -->
    <script>
        // Only redirect if not a known bot
        const ua = navigator.userAgent;
        const isBot = /bot|crawler|spider|facebookexternalhit|LinkedInBot/i.test(ua);
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
        <img src="${image}" alt="${title}" style="max-width: 240px; height: auto; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h1 style="color: #212121; font-size: 24px; margin-bottom: 16px;">${title}</h1>
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

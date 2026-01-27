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

    // Ensure absolute image URL
    if (image && !image.startsWith('http')) {
        image = `https://vaas.solutions${image.startsWith('/') ? '' : '/'}${image}`;
    }

    // Sanitize description (remove HTML tags and newlines)
    description = description ? description
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() : 'Your one-stop destination for news and industry insights.';

    if (description.length > 160) {
        description = description.substring(0, 157) + '...';
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | News Marketplace</title>
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="VaaS Solutions">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">

    <!-- Redirect to actual page for humans -->
    <script>
        setTimeout(function() {
            window.location.href = "${url}";
        }, 500);
    </script>
</head>
<body>
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center;">
        <img src="${image}" alt="${title}" style="max-width: 200px; height: auto; margin-bottom: 20px; border-radius: 8px;">
        <h1 style="color: #1a1a1a;">${title}</h1>
        <p style="color: #666; line-height: 1.6;">${description}</p>
        <p style="margin-top: 30px;"><a href="${url}" style="color: #1976D2; text-decoration: none; font-weight: bold;">Loading content...</a></p>
    </div>
</body>
</html>
  `;
};

module.exports = { getMetaData };

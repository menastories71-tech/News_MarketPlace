/**
 * Simple slugify utility
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified text
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
};

/**
 * Extracts the ID from a slug-id string
 * @param {string} slugId - The slug combined with ID (e.g. "my-title-123")
 * @returns {string|null} - The ID part
 */
export const getIdFromSlug = (slugId) => {
    if (!slugId) return null;
    const parts = slugId.split('-');
    return parts[parts.length - 1];
};

/**
 * Creates a URL-friendly path with slug and ID
 * @param {string} title - The title of the item
 * @param {string|number} id - The ID of the item
 * @returns {string} - The slugified path part
 */
export const createSlugPath = (title, id) => {
    const slug = slugify(title);
    return slug ? `${slug}-${id}` : id.toString();
};

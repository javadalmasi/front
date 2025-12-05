/**
 * Utility functions for handling thumbnail URLs
 */

import { resizeImage, findClosestAllowedDimension, determineFormat } from './ImageResizer.js';

/**
 * Transforms a YouTube thumbnail URL to the new CDN format
 * @param {string} originalThumbnailUrl - The original thumbnail URL (e.g., from YouTube)
 * @param {Object} options - Options for the transformation
 * @param {string} options.videoId - The video ID (if not extractable from URL)
 * @param {string} options.width - Width for resizing (will be constrained to allowed values)
 * @param {string} options.height - Height for resizing (will be constrained to allowed values)
 * @param {number} options.quality - Quality parameter as number between 1-100 (will be constrained to allowed values)
 * @param {string} options.format - Format parameter (avif, webp, jpeg) with browser priority
 * @param {string} options.type - Type of image ('general' for search/sidebar or 'player' for video player), defaults to 'general'
 * @returns {string} The transformed thumbnail URL using the CDN format
 */
export function transformThumbnailUrl(originalThumbnailUrl, options = {}) {
    // Get the CDN base URL from environment variable
    const cdnBaseUrl =
        import.meta.env.VITE_CDN_THUMBNAIL_BASE_URL ||
        "https://impx.global.ssl.fastly.net/fragrant-fire-439a.laagaw.workers.dev/vi/";

    // Extract video ID from the original URL if not provided
    let videoId = options.videoId;
    if (!videoId && originalThumbnailUrl) {
        // Extract video ID from YouTube thumbnail URL patterns
        // Common YouTube thumbnail URL patterns:
        // - https://i.ytimg.com/vi/{videoId}/{style}.jpg
        // - https://img.youtube.com/vi/{videoId}/{style}.jpg

        const videoIdMatch = originalThumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
        if (videoIdMatch && videoIdMatch[1]) {
            videoId = videoIdMatch[1];
        } else {
            // If we can't extract from the URL, try to get it from options
            // If still not available, return the original URL
            if (!options.videoId) {
                console.warn("Could not extract video ID from thumbnail URL:", originalThumbnailUrl);
                return originalThumbnailUrl;
            }
        }
    }

    // Determine dimensions and constrain to allowed values based on type
    const [width, height] = findClosestAllowedDimension(
        parseInt(options.width) || 0,
        parseInt(options.height) || 0,
        options.type || 'general'
    );

    // Build the CDN URL
    let cdnUrl = `${cdnBaseUrl}${videoId}?resize=${width},${height}`;

    // Constrain quality to allowed values [75, 85]
    let quality = 85; // Default to 85 if not specified
    if (options.quality !== undefined) {
        const allowedQualities = [75, 85];
        quality = allowedQualities.reduce((prev, curr) => {
            const currDiff = Math.abs(curr - options.quality);
            const prevDiff = Math.abs(prev - options.quality);
            if (currDiff < prevDiff) return curr;
            if (currDiff === prevDiff && curr > prev) return curr; // Choose higher in case of tie
            return prev;
        });
    }
    // Always add quality parameter as it's required
    cdnUrl += `&quality=${quality}`;

    // Add format parameter if specified and valid
    const format = determineFormat(options.format);
    if (format) {
        cdnUrl += `&format=${format}`;
    }

    return cdnUrl;
}

/**
 * Gets appropriate dimensions and quality for general thumbnails (search results, sidebar, etc.)
 * based on screen size, device characteristics, and pixel density
 * @returns {Object} width, height, and quality suitable for general thumbnails (constrained to allowed values)
 */
export function getGeneralThumbnailSettings() {
    // Define optimal dimensions based on screen width
    if (typeof window === 'undefined') {
        // Default to a common size when not in browser (SSR or testing)
        const [width, height] = findClosestAllowedDimension(640, 360, 'general');
        return {
            width: width.toString(),
            height: height.toString(),
            quality: 85,
        };
    }
    
    const screenWidth = window.innerWidth || screen.width;
    // Get pixel ratio for high-DPI displays (Retina, etc.)
    const pixelRatio = window.devicePixelRatio || 1;

    let baseWidth, baseHeight, quality;

    if (screenWidth <= 480) {
        // Mobile: smaller thumbnails
        baseWidth = 426; // Use allowed dimension for general
        baseHeight = 240;
        quality = 75; // Use allowed quality
    } else if (screenWidth <= 768) {
        // Tablet: medium thumbnails
        baseWidth = 640; // Use allowed dimension for general
        baseHeight = 360;
        quality = 75; // Use allowed quality
    } else if (screenWidth <= 1024) {
        // Small desktop: standard thumbnails
        baseWidth = 854; // Use allowed dimension for general
        baseHeight = 480;
        quality = 85; // Use allowed quality
    } else {
        // Large desktop: larger thumbnails
        baseWidth = 960; // Use allowed dimension for general
        baseHeight = 540;
        quality = 85; // Use allowed quality
    }

    // Scale dimensions by pixel ratio for high-DPI displays but ensure they're allowed
    const scaledWidth = Math.round(baseWidth * pixelRatio);
    const scaledHeight = Math.round(baseHeight * pixelRatio);

    // Find closest allowed dimension for general type
    const [finalWidth, finalHeight] = findClosestAllowedDimension(scaledWidth, scaledHeight, 'general');

    return {
        width: finalWidth.toString(),
        height: finalHeight.toString(),
        quality: quality,
    };
}

/**
 * Gets appropriate dimensions and quality for player thumbnails
 * based on screen size, device characteristics, and pixel density
 * @returns {Object} width, height, and quality suitable for player thumbnails (constrained to allowed values)
 */
export function getPlayerThumbnailSettings() {
    // Define optimal dimensions based on screen width
    if (typeof window === 'undefined') {
        // Default to a common size when not in browser (SSR or testing)
        const [width, height] = findClosestAllowedDimension(1280, 720, 'player');
        return {
            width: width.toString(),
            height: height.toString(),
            quality: 85,
        };
    }
    
    const screenWidth = window.innerWidth || screen.width;
    // Get pixel ratio for high-DPI displays (Retina, etc.)
    const pixelRatio = window.devicePixelRatio || 1;

    let baseWidth, baseHeight, quality;

    if (screenWidth <= 480) {
        // Mobile: smaller thumbnails
        baseWidth = 426; // Use allowed dimension
        baseHeight = 240;
        quality = 75; // Use allowed quality
    } else if (screenWidth <= 768) {
        // Tablet: medium thumbnails
        baseWidth = 640; // Use allowed dimension
        baseHeight = 360;
        quality = 75; // Use allowed quality
    } else if (screenWidth <= 1024) {
        // Small desktop: standard thumbnails
        baseWidth = 854; // Use allowed dimension
        baseHeight = 480;
        quality = 85; // Use allowed quality
    } else {
        // Large desktop: larger thumbnails
        baseWidth = 1280; // Use allowed dimension for player
        baseHeight = 720;
        quality = 85; // Use allowed quality
    }

    // Scale dimensions by pixel ratio for high-DPI displays but ensure they're allowed
    const scaledWidth = Math.round(baseWidth * pixelRatio);
    const scaledHeight = Math.round(baseHeight * pixelRatio);

    // Find closest allowed dimension for player type
    const [finalWidth, finalHeight] = findClosestAllowedDimension(scaledWidth, scaledHeight, 'player');

    return {
        width: finalWidth.toString(),
        height: finalHeight.toString(),
        quality: quality,
    };
}

/**
 * Gets appropriate dimensions and quality based on screen size, device characteristics, and pixel density
 * @param {string} type - Type of image ('general' for search/sidebar or 'player' for video player), defaults to 'general'
 * @returns {Object} width, height, and quality suitable for the device (constrained to allowed values)
 */
export function getOptimalThumbnailSettings(type = 'general') {
    if (type === 'player') {
        return getPlayerThumbnailSettings();
    } else {
        return getGeneralThumbnailSettings();
    }
}



/**
 * Generates a thumbnail URL optimally sized for the current device
 * @param {string} originalThumbnailUrl - Original thumbnail URL
 * @param {Object} additionalOptions - Additional options to override
 * @param {string} additionalOptions.format - Image format (avif, webp, jpeg) with browser priority
 * @param {string} additionalOptions.type - Type of image ('general' for search/sidebar or 'player' for video player), defaults to 'general'
 * @returns {string} Optimally sized CDN thumbnail URL
 */
export function getOptimalThumbnailUrl(originalThumbnailUrl, additionalOptions = {}) {
    const type = additionalOptions.type || 'general';
    const settings = getOptimalThumbnailSettings(type);
    // Include format in the options with browser priority
    const options = { 
        ...settings, 
        ...additionalOptions 
    };
    return transformThumbnailUrl(originalThumbnailUrl, options);
}

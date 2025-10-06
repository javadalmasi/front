/**
 * Utility functions for handling thumbnail URLs
 */

/**
 * Transforms a YouTube thumbnail URL to the new CDN format
 * @param {string} originalThumbnailUrl - The original thumbnail URL (e.g., from YouTube)
 * @param {Object} options - Options for the transformation
 * @param {string} options.videoId - The video ID (if not extractable from URL)
 * @param {string} options.width - Width for resizing (default: 320)
 * @param {string} options.height - Height for resizing (default: 180)
 * @param {number} options.quality - Quality parameter as number between 1-100 (optional)
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

    // Determine dimensions (default 320x180)
    const width = options.width || "320";
    const height = options.height || "180";

    // Build the CDN URL
    let cdnUrl = `${cdnBaseUrl}${videoId}?resize=${width},${height}`;

    // Add quality parameter if specified (as number between 1-100)
    if (options.quality !== undefined) {
        cdnUrl += `&quality=${options.quality}`;
    }

    return cdnUrl;
}

/**
 * Gets appropriate dimensions and quality based on screen size, device characteristics, and pixel density
 * @returns {Object} width, height, and quality suitable for the device
 */
export function getOptimalThumbnailSettings() {
    // Define optimal dimensions based on screen width
    const screenWidth = window.innerWidth || screen.width;
    // Get pixel ratio for high-DPI displays (Retina, etc.)
    const pixelRatio = window.devicePixelRatio || 1;

    // Calculate base dimensions and upscale based on pixel ratio for better quality on high-DPI displays
    let baseWidth, quality;

    if (screenWidth <= 480) {
        // Mobile: smaller thumbnails
        baseWidth = 120; // Smaller base size for mobile
        quality = 70; // Lower quality on smaller screens to save bandwidth (1-100 scale)
    } else if (screenWidth <= 768) {
        // Tablet: medium thumbnails
        baseWidth = 180; // Medium size for tablets
        quality = 75;
    } else if (screenWidth <= 1024) {
        // Small desktop: standard thumbnails
        baseWidth = 240; // Standard size for desktop
        quality = 80;
    } else {
        // Large desktop: larger thumbnails
        baseWidth = 320; // Appropriate size for large desktop
        quality = 85; // Higher quality on larger screens
    }

    // Scale dimensions by pixel ratio for high-DPI displays but use standardized sizes
    const scaledWidth = Math.round(baseWidth * pixelRatio);

    // Use standardized dimensions rounded to common multiples to improve caching and efficiency
    const standardizedWidth = Math.min(standardizeDimension(scaledWidth), 1280);
    // Calculate corresponding height to maintain 16:9 ratio
    const standardizedHeight = Math.round((standardizedWidth * 9) / 16);

    return {
        width: standardizedWidth.toString(),
        height: standardizedHeight.toString(),
        quality: quality,
    };
}

/**
 * Rounds dimensions to standardized sizes to improve caching efficiency
 * @param {number} dimension - The dimension to standardize
 * @returns {number} - Standardized dimension
 */
function standardizeDimension(dimension) {
    // Define common standardized sizes
    const standardSizes = [64, 96, 120, 160, 180, 240, 320, 360, 480, 640, 720, 768, 800, 960, 1024, 1280];

    // Find the closest standard size
    let closest = standardSizes[0];
    let minDiff = Math.abs(dimension - standardSizes[0]);

    for (let i = 1; i < standardSizes.length; i++) {
        const diff = Math.abs(dimension - standardSizes[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = standardSizes[i];
        } else {
            // If differences start increasing, we've passed the closest value
            break;
        }
    }

    // If the calculated dimension is significantly larger than the closest standard size,
    // round up to the next standard size to avoid under-sizing
    if (
        dimension > closest &&
        dimension - closest > closest - (standardSizes[standardSizes.indexOf(closest) - 1] || 0)
    ) {
        const nextIndex = standardSizes.indexOf(closest) + 1;
        if (nextIndex < standardSizes.length) {
            return standardSizes[nextIndex];
        }
    }

    return closest;
}

/**
 * Generates a thumbnail URL optimally sized for the current device
 * @param {string} originalThumbnailUrl - Original thumbnail URL
 * @param {Object} additionalOptions - Additional options to override
 * @returns {string} Optimally sized CDN thumbnail URL
 */
export function getOptimalThumbnailUrl(originalThumbnailUrl, additionalOptions = {}) {
    const settings = getOptimalThumbnailSettings();
    const options = { ...settings, ...additionalOptions };
    return transformThumbnailUrl(originalThumbnailUrl, options);
}

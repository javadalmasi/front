/**
 * Utility functions for handling thumbnail URLs
 */

/**
 * Transforms a video ID into a CDN thumbnail URL.
 * @param {string} videoId - The video ID.
 * @param {Object} options - Options for the transformation.
 * @param {boolean} options.isShort - Whether the video is a short (for 9:16 aspect ratio).
 * @param {string} options.width - Width for resizing.
 * @param {string} options.height - Height for resizing.
 * @param {number} options.quality - Quality parameter (1-100).
 * @returns {string} The transformed thumbnail URL.
 */
export function transformThumbnailUrl(videoId, options = {}) {
    if (!videoId) {
        console.warn("transformThumbnailUrl called without a videoId.");
        return ""; // Return empty string or a placeholder image URL
    }

    const cdnBaseUrl = import.meta.env.VITE_CDN_THUMBNAIL_BASE_URL;
    if (!cdnBaseUrl) {
        console.error("VITE_CDN_THUMBNAIL_BASE_URL is not configured.");
        // Fallback to a default placeholder or the original ytimg URL if needed
        return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    let { width, height, quality, isShort } = options;

    // Default dimensions
    const defaultWidth = 320;
    const defaultHeight = 180;

    if (isShort) {
        width = width || defaultWidth; // Use default width if not provided
        height = Math.round((width * 16) / 9); // Calculate height for 9:16
    } else {
        width = width || defaultWidth;
        height = height || defaultHeight;
    }

    let cdnUrl = `${cdnBaseUrl}${videoId}?resize=${width},${height}`;

    if (quality !== undefined) {
        cdnUrl += `&quality=${quality}`;
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
 * Generates a thumbnail URL optimally sized for the current device.
 * It extracts the video ID from the original URL and passes it to transformThumbnailUrl.
 * @param {string} originalThumbnailUrl - Original thumbnail URL from YouTube.
 * @param {Object} additionalOptions - Additional options like 'isShort'.
 * @returns {string} Optimally sized CDN thumbnail URL.
 */
export function getOptimalThumbnailUrl(originalThumbnailUrl, additionalOptions = {}) {
    if (!originalThumbnailUrl) return "";

    // Extract video ID from the original URL
    const videoIdMatch = originalThumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
    const videoId = videoIdMatch && videoIdMatch[1];

    if (!videoId) {
        console.warn("Could not extract video ID from thumbnail URL:", originalThumbnailUrl);
        return originalThumbnailUrl; // Fallback to original if ID extraction fails
    }

    const settings = getOptimalThumbnailSettings();
    // Combine settings with any additional options (like isShort)
    const options = { ...settings, ...additionalOptions };

    return transformThumbnailUrl(videoId, options);
}

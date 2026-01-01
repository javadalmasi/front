/**
 * Utility functions for handling thumbnail URLs
 */

import { findClosestAllowedDimension, determineFormat } from './ImageResizer.js';

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
    // Check if this is a proxy URL for a channel avatar (from yt3.ggpht.com)
    // Channel avatars don't need video thumbnail transformation
    if (originalThumbnailUrl && originalThumbnailUrl.includes('ytproxy.ttj.dev') &&
        (originalThumbnailUrl.includes('host=yt3.ggpht.com') || originalThumbnailUrl.includes('/ytc/'))) {
        // This is a proxy URL for a channel avatar, return the original URL without transformation
        return originalThumbnailUrl;
    }

    // Get the CDN base URL from environment variable
    const cdnBaseUrl =
        import.meta.env.VITE_CDN_THUMBNAIL_BASE_URL ||
        "https://impx.global.ssl.fastly.net/fragrant-fire-439a.laagaw.workers.dev/vi/";

    // Extract video ID from the original URL if not provided
    let videoId = options.videoId;
    if (!videoId && originalThumbnailUrl) {
        // Extract video ID from various thumbnail URL patterns

        // For YouTube thumbnail URL patterns:
        // - https://i.ytimg.com/vi/{videoId}/{style}.jpg
        // - https://img.youtube.com/vi/{videoId}/{style}.jpg
        let videoIdMatch = originalThumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);

        // For relative paths like /vi_webp/{id}/maxresdefault.webp?host=i.ytimg.com
        if (!videoIdMatch) {
            videoIdMatch = originalThumbnailUrl.match(/\/vi_webp\/([a-zA-Z0-9_-]{11})\//);
        }

        // For proxy URLs like https://ytproxy.ttj.dev/{videoId}=...?host=yt3.ggpht.com
        // Some proxy URLs may have the video ID in the path before query parameters
        if (!videoIdMatch) {
            // Try to extract from proxy URL patterns
            // Pattern: https://ytproxy.ttj.dev/{encoded_part}?host=...
            // The encoded part might contain the video ID or be derived from it
            const proxyMatch = originalThumbnailUrl.match(/ytproxy\.ttj\.dev\/([a-zA-Z0-9_-]+)/);
            if (proxyMatch && proxyMatch[1]) {
                // For URLs with /ytc/ prefix, the video ID might be embedded differently
                // If the extracted part looks like a video ID (11 chars), use it
                const potentialVideoId = proxyMatch[1];
                if (potentialVideoId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(potentialVideoId)) {
                    videoIdMatch = [potentialVideoId, potentialVideoId]; // [full_match, capture_group]
                } else {
                    // For /ytc/ URLs, try to extract video ID from patterns like:
                    // /ytc/AIdro_{videoId} where the video ID follows AIdro_ (first 11 chars after AIdro_)
                    const ytcMatch = originalThumbnailUrl.match(/\/ytc\/AIdro_([a-zA-Z0-9_-]{11})/);
                    if (ytcMatch && ytcMatch[1]) {
                        videoIdMatch = ytcMatch;
                    }
                    // Also try to extract potential video ID from other proxy URL patterns
                    // Some proxy URLs might have the video ID embedded differently
                    else {
                        // For non-ytc URLs like https://ytproxy.ttj.dev/{video_id_encoded}=...
                        // Check if the first path segment after domain starts with a potential video ID
                        const nonYtcMatch = originalThumbnailUrl.match(/ytproxy\.ttj\.dev\/([a-zA-Z0-9_-]{11})[=\/]/);
                        if (nonYtcMatch && nonYtcMatch[1]) {
                            videoIdMatch = nonYtcMatch;
                        }
                        // If still no match, try to find a potential video ID in the path before the query parameter
                        else {
                            // Extract the part before the query string
                            const pathPart = originalThumbnailUrl.split('?')[0];
                            // Look for 11-character YouTube ID pattern in the path part
                            const potentialVideoId = pathPart.match(/[a-zA-Z0-9_-]{11}/);
                            if (potentialVideoId) {
                                // Validate that it's a proper video ID format (not just any 11 chars)
                                if (/^[a-zA-Z0-9_-]{11}$/.test(potentialVideoId[0])) {
                                    // Create a match-like array with the full match at index 0 and capture at index 1
                                    videoIdMatch = [potentialVideoId[0], potentialVideoId[0]];
                                }
                            }
                        }
                    }
                }
            }
        }

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

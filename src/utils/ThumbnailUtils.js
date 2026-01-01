/**
 * Utility functions for handling thumbnail URLs
 */

import { findClosestAllowedDimension, determineFormat, findClosestAllowedQuality } from './ImageResizer.js';

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

    // Use the new findClosestAllowedQuality function to support wider range
    let quality = 85; // Default to 85 if not specified
    if (options.quality !== undefined) {
        quality = findClosestAllowedQuality(options.quality);
    } else {
        // If no quality specified, default to 85
        quality = 85;
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
 * Detects the device type based on screen size, user agent, and other characteristics
 * @returns {string} Device type: 'mobile', 'tablet', 'desktop', or 'tv'
 */
function getDeviceType() {
    if (typeof window === 'undefined') {
        return 'desktop'; // Default to desktop for SSR
    }

    const screenWidth = window.innerWidth || screen.width;
    const userAgent = navigator.userAgent || '';

    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Check for tablet devices
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android|Tablet/i.test(userAgent) ||
                    (screenWidth >= 768 && screenWidth <= 1024 && (window.orientation !== undefined));

    // Check for TV-like devices (larger screens)
    const isTV = screenWidth > 1920 || /SmartTV|TV|TVOS|GoogleTV|HbbTV|CE-HTML/i.test(userAgent);

    if (isMobile && !isTablet) {
        return 'mobile';
    } else if (isTablet) {
        return 'tablet';
    } else if (isTV) {
        return 'tv';
    } else {
        return 'desktop';
    }
}

/**
 * Gets appropriate dimensions and quality for general thumbnails (search results, sidebar, etc.)
 * based on device type, screen size, and pixel density
 * @returns {Object} width, height, and quality suitable for general thumbnails (constrained to allowed values)
 */
export function getGeneralThumbnailSettings() {
    // Define optimal dimensions based on device type
    if (typeof window === 'undefined') {
        // Default to a common size when not in browser (SSR or testing)
        const [width, height] = findClosestAllowedDimension(640, 360, 'general');
        return {
            width: width.toString(),
            height: height.toString(),
            quality: 75,
        };
    }

    const deviceType = getDeviceType();
    // Get pixel ratio for high-DPI displays (Retina, etc.)
    const pixelRatio = window.devicePixelRatio || 1;

    let baseWidth, baseHeight, quality;

    switch (deviceType) {
        case 'mobile':
            // Mobile: up to 320x180 at max
            baseWidth = 320;
            baseHeight = 180;
            quality = pixelRatio > 1 ? 65 : 60; // Moderate quality for mobile
            break;
        case 'tablet':
            // Tablet: up to 320x180 at max
            baseWidth = 320;
            baseHeight = 180;
            quality = pixelRatio > 1 ? 70 : 65; // Moderate quality for tablet
            break;
        case 'tv':
            // TV: based on screen size, up to 1024x576 for large screens
            const screenWidth = window.innerWidth || screen.width;
            if (screenWidth > 1920) {
                baseWidth = 1024;
                baseHeight = 576;
            } else {
                baseWidth = 640;
                baseHeight = 360;
            }
            quality = pixelRatio > 1 ? 80 : 75; // Higher quality for larger displays
            break;
        case 'desktop':
        default:
            // Desktop: up to 426x240 at max
            baseWidth = 426;
            baseHeight = 240;
            quality = pixelRatio > 1 ? 70 : 65; // Moderate quality for desktop
            break;
    }

    // Scale dimensions by pixel ratio for high-DPI displays but ensure they're allowed
    const scaledWidth = Math.round(baseWidth * pixelRatio);
    const scaledHeight = Math.round(baseHeight * pixelRatio);

    // Find closest allowed dimension for general type
    const [finalWidth, finalHeight] = findClosestAllowedDimension(scaledWidth, scaledHeight, 'general');
    const finalQuality = findClosestAllowedQuality(quality);

    return {
        width: finalWidth.toString(),
        height: finalHeight.toString(),
        quality: finalQuality,
    };
}

/**
 * Gets appropriate dimensions and quality for player thumbnails
 * Always returns 1280x720 with quality 70 on all devices as requested
 * @returns {Object} width, height, and quality suitable for player thumbnails (constrained to allowed values)
 */
export function getPlayerThumbnailSettings() {
    // Always return 1280x720 with quality 70 on all devices
    const [width, height] = findClosestAllowedDimension(1280, 720, 'player');
    const quality = findClosestAllowedQuality(70);

    return {
        width: width.toString(),
        height: height.toString(),
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
 * Generates both preload and optimized thumbnail URLs for progressive loading
 * @param {string} originalThumbnailUrl - Original thumbnail URL
 * @param {Object} additionalOptions - Additional options to override
 * @param {string} additionalOptions.format - Image format (avif, webp, jpeg) with browser priority
 * @param {string} additionalOptions.type - Type of image ('general' for search/sidebar or 'player' for video player), defaults to 'general'
 * @returns {Object} Object containing preloadUrl and optimizedUrl for progressive loading
 */
export function getProgressiveThumbnailUrls(originalThumbnailUrl, additionalOptions = {}) {
    const type = additionalOptions.type || 'general';

    // Preload URL with fixed small size and low quality for fast loading
    const preloadUrl = transformThumbnailUrl(originalThumbnailUrl, {
        width: 32,
        height: 18,
        quality: 20,
        format: additionalOptions.format,
        type: type
    });

    // Optimized URL based on device type and settings
    const settings = getOptimalThumbnailSettings(type);
    const optimizedUrl = transformThumbnailUrl(originalThumbnailUrl, {
        ...settings,
        ...additionalOptions
    });

    return {
        preloadUrl,
        optimizedUrl
    };
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

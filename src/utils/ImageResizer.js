/**
 * Image Resizer Utility
 * Enforces required dimensions, quality, and formats as per specifications
 */

/**
 * List of allowed dimensions for general images (search results, sidebar, etc.) in the format [width, height]
 */
const GENERAL_ALLOWED_DIMENSIONS = [
    [426, 240],
    [640, 360],
    [854, 480],
    [960, 540]
];

/**
 * List of allowed dimensions for video player thumbnails in the format [width, height]
 */
const PLAYER_ALLOWED_DIMENSIONS = [
    [426, 240],
    [640, 360],
    [854, 480],
    [960, 540],
    [1024, 576],
    [1280, 720],
    [1600, 900],
    [1920, 1080]
];

/**
 * All allowed dimensions (for backward compatibility)
 */
const ALLOWED_DIMENSIONS = [
    [426, 240],
    [640, 360],
    [854, 480],
    [960, 540],
    [1024, 576],
    [1280, 720],
    [1600, 900],
    [1920, 1080]
];

/**
 * List of allowed quality values
 */
const ALLOWED_QUALITY_VALUES = [75, 85];

/**
 * List of supported formats in order of browser priority
 */
const SUPPORTED_FORMATS = ['avif', 'webp', 'jpeg'];

/**
 * Checks if a given dimension is in the allowed list
 * @param {number} width - Width to check
 * @param {number} height - Height to check
 * @param {string} type - Type of image ('general' or 'player'), defaults to 'general'
 * @returns {boolean} - True if the dimension is allowed for the specified type
 */
function isAllowedDimension(width, height, type = 'general') {
    const dimensions = type === 'player' ? PLAYER_ALLOWED_DIMENSIONS : GENERAL_ALLOWED_DIMENSIONS;
    return dimensions.some(([allowedWidth, allowedHeight]) => 
        allowedWidth === width && allowedHeight === height
    );
}

/**
 * Finds the closest allowed dimension to the given width and height
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} type - Type of image ('general' or 'player'), defaults to 'general'
 * @returns {Array<number>} - An array [width, height] of the closest allowed dimension
 */
function findClosestAllowedDimension(width, height, type = 'general') {
    const dimensions = type === 'player' ? PLAYER_ALLOWED_DIMENSIONS : GENERAL_ALLOWED_DIMENSIONS;
    
    // If exact match exists, return it
    const exactMatch = dimensions.find(([w, h]) => w === width && h === height);
    if (exactMatch) return exactMatch;

    // Find closest dimension based on aspect ratio and size
    const targetRatio = width / height;
    let closestDimension = dimensions[0];
    let smallestDifference = Infinity;

    for (const [allowedWidth, allowedHeight] of dimensions) {
        // Calculate how close the aspect ratio is
        const allowedRatio = allowedWidth / allowedHeight;
        const ratioDifference = Math.abs(targetRatio - allowedRatio);
        
        // Calculate size difference
        const sizeDifference = Math.abs(width * height - allowedWidth * allowedHeight);
        
        // Combined difference score
        const totalDifference = ratioDifference * 1000 + sizeDifference;
        
        if (totalDifference < smallestDifference) {
            smallestDifference = totalDifference;
            closestDimension = [allowedWidth, allowedHeight];
        }
    }

    return closestDimension;
}

/**
 * Checks if a given quality value is allowed
 * @param {number} quality - Quality value to check
 * @returns {boolean} - True if the quality is allowed
 */
function isAllowedQuality(quality) {
    return ALLOWED_QUALITY_VALUES.includes(quality);
}

/**
 * Determines the format to use, validating it against supported formats
 * @param {string} requestedFormat - The format requested by the user
 * @returns {string} - The format if valid, or undefined if not supported
 */
function determineFormat(requestedFormat) {
    if (!requestedFormat) {
        return undefined; // Let the server decide
    }
    
    // Validate requested format
    if (SUPPORTED_FORMATS.includes(requestedFormat)) {
        return requestedFormat;
    }
    
    return undefined; // Format not supported, let server decide
}

/**
 * Resizes an image URL with the required constraints
 * @param {string} imageUrl - The original image URL
 * @param {Object} options - Options for resizing
 * @param {number} options.width - Desired width (will be adjusted to allowed dimensions)
 * @param {number} options.height - Desired height (will be adjusted to allowed dimensions)
 * @param {number} options.quality - Quality value (will be adjusted to allowed values)
 * @param {string} options.format - Desired format (will use browser priority if not supported)
 * @param {string} options.type - Type of image ('general' for search/sidebar or 'player' for video player), defaults to 'general'
 * @returns {string} - The resized image URL with proper parameters
 */
function resizeImage(imageUrl, options = {}) {
    // Find closest allowed dimensions based on type
    const [width, height] = findClosestAllowedDimension(
        options.width || 0,
        options.height || 0,
        options.type || 'general'
    );
    
    // Validate and normalize quality (required parameter)
    let quality = 85; // Default to 85 if not specified
    if (options.quality !== undefined) {
        if (isAllowedQuality(options.quality)) {
            quality = options.quality;
        } else {
            // If provided quality is not allowed, find the closest allowed value
            // In case of tie, choose the higher value (85)
            quality = ALLOWED_QUALITY_VALUES.reduce((prev, curr) => {
                const currDiff = Math.abs(curr - options.quality);
                const prevDiff = Math.abs(prev - options.quality);
                if (currDiff < prevDiff) return curr;
                if (currDiff === prevDiff && curr > prev) return curr; // Choose higher in case of tie
                return prev;
            });
        }
    }
    
    // Determine the format to use
    let format = determineFormat(options.format);
    
    // Construct the URL with parameters
    // Handle both browser and server environments
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(imageUrl, baseUrl);
    
    // Add dimension parameters
    url.searchParams.set('width', width.toString());
    url.searchParams.set('height', height.toString());
    
    // Always add quality parameter as it's required
    url.searchParams.set('quality', quality.toString());
    
    // Add format parameter only if specified and valid
    if (format) {
        url.searchParams.set('format', format);
    }
    
    return url.toString();
}


/**
 * Gets general allowed dimensions (for search results, sidebar, etc.)
 * @returns {Array<Array<number>>} - Array of allowed [width, height] pairs
 */
function getGeneralAllowedDimensions() {
    return GENERAL_ALLOWED_DIMENSIONS;
}

/**
 * Gets player allowed dimensions (for video player thumbnails)
 * @returns {Array<Array<number>>} - Array of allowed [width, height] pairs
 */
function getPlayerAllowedDimensions() {
    return PLAYER_ALLOWED_DIMENSIONS;
}

/**
 * Gets all allowed dimensions
 * @returns {Array<Array<number>>} - Array of allowed [width, height] pairs
 */
function getAllowedDimensions() {
    return ALLOWED_DIMENSIONS;
}

/**
 * Gets all allowed quality values
 * @returns {Array<number>} - Array of allowed quality values
 */
function getAllowedQualityValues() {
    return ALLOWED_QUALITY_VALUES;
}

/**
 * Checks if the browser supports a specific image format
 * @param {string} format - Image format to check (e.g., 'avif', 'webp', 'jpeg')
 * @returns {boolean} - True if the format is supported, false otherwise
 */
function isFormatSupported(format) {
    if (typeof document === 'undefined') {
        // Server-side rendering - assume support
        return true;
    }

    // Create a test element to check format support
    const testCanvas = document.createElement('canvas');
    if (!testCanvas.getContext) {
        return false;
    }

    // Map format to MIME type
    const mimeTypes = {
        'avif': 'image/avif',
        'webp': 'image/webp',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif'
    };

    const mimeType = mimeTypes[format.toLowerCase()];
    if (!mimeType) {
        return false;
    }

    // Test the canvas.toDataURL method with the MIME type
    try {
        return testCanvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);
    } catch (e) {
        // If an error occurs, the format is not supported
        return false;
    }
}

/**
 * Gets supported formats in priority order
 * @returns {Array<string>} - Array of supported formats in priority order
 */
function getSupportedFormats() {
    return SUPPORTED_FORMATS;
}

export {
    resizeImage,
    findClosestAllowedDimension,
    isAllowedDimension,
    isAllowedQuality,
    determineFormat,
    isFormatSupported,
    getAllowedDimensions,
    getGeneralAllowedDimensions,
    getPlayerAllowedDimensions,
    getAllowedQualityValues,
    getSupportedFormats
};
export function replaceWithCdnUrl(originalUrl, proxyUrl, cdnUrl) {
    // Only process if CDN is enabled via environment variable
    if (!import.meta.env.VITE_ENABLE_CDN || import.meta.env.VITE_ENABLE_CDN !== "true") {
        return originalUrl; // Return original URL if CDN is not enabled
    }

    try {
        // Create URL objects for proper parsing
        const originalUrlObj = new URL(originalUrl);

        // Extract the host parameter from query string
        const hostParam = originalUrlObj.searchParams.get("host");
        if (!hostParam) {
            return originalUrl; // Return original if no host parameter
        }

        // Extract subdomain (first part of the host)
        const hostParts = hostParam.split(".");
        const subdomain = hostParts[0]; // e.g., 'rr1---sn-a5mekndz' from 'rr1---sn-a5mekndz.googlevideo.com'

        // Remove the host parameter from the URL as required
        originalUrlObj.searchParams.delete("host");

        // Get the pathname and query without the host parameter
        const pathname = originalUrlObj.pathname; // e.g., '/videoplayback'
        const search = originalUrlObj.search; // e.g., '?bui=...&itag=137&...'

        // Parse CDN URLs from environment variable (comma-separated)
        let cdnUrls = [];
        if (typeof cdnUrl === 'string' && cdnUrl.includes(',')) {
            cdnUrls = cdnUrl.split(',').map(url => url.trim()).filter(url => url);
        } else if (Array.isArray(cdnUrl)) {
            cdnUrls = cdnUrl;
        } else {
            // Fallback to single URL if not an array or comma-separated string
            cdnUrls = [cdnUrl];
        }

        // Select a random CDN URL from the array
        const randomCdnUrl = cdnUrls[Math.floor(Math.random() * cdnUrls.length)];

        // Construct the new URL: CDN URL + subdomain + pathname + remaining query params
        const cleanCdnUrl = randomCdnUrl.replace(/\/+$/, ""); // Remove trailing slash from CDN URL
        const newUrl = `${cleanCdnUrl}${cleanCdnUrl.endsWith("/") ? "" : "/"}${subdomain}${pathname}${search}`;

        return newUrl;
    } catch (error) {
        console.error("Error processing CDN URL replacement:", error);
        return originalUrl; // Return original URL if there's an error
    }
}

// Function to get a random CDN URL from the environment variable
export function getRandomCdnUrl() {
    const cdnUrlEnv = import.meta.env.VITE_CDN_URL || "https://storage.vidioo.ir/gl/";

    let cdnUrls = [];
    if (typeof cdnUrlEnv === 'string' && cdnUrlEnv.includes(',')) {
        cdnUrls = cdnUrlEnv.split(',').map(url => url.trim()).filter(url => url);
    } else {
        cdnUrls = [cdnUrlEnv];
    }

    return cdnUrls[Math.floor(Math.random() * cdnUrls.length)];
}

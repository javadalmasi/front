<template>
    <div class="w-full">
        <div class="relative" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
            <div class="watched-container" :class="{ watched: item.watched, hovered: isHovered }">
                <img
                    loading="lazy"
                    class="aspect-video w-full rounded-lg object-cover"
                    :src="optimizedThumbnail"
                    :alt="item.title"
                    :class="{
                        'shorts-img': item.isShort,
                    }"
                />
            </div>
            <!-- progress bar -->
            <div class="absolute bottom-0 left-0 h-1 w-full">
                <div
                    v-if="item.watched && item.duration > 0 && item.currentTime < item.duration"
                    class="h-1 rounded-b-lg bg-red-600"
                    :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
                />
            </div>

            <!-- watched overlay -->
            <div
                v-if="item.watched"
                ref="watchedOverlay"
                :class="[
                    'absolute inset-0 bg-black bg-opacity-20 rounded-lg backdrop-blur-[1px] watched-overlay',
                    { 'watched-overlay-hovered': isHovered },
                ]"
            ></div>

            <!-- duration indicator for non-shorts -->
            <div
                v-if="!item.isShort && item.duration >= 0 && !inPlaylist"
                ref="durationIndicator"
                :class="[
                    'duration-indicator absolute flex items-center gap-1 bottom-2 right-2 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs leading-[1.6] text-white',
                    { 'indicator-hidden': isHovered },
                ]"
            >
                <i class="i-fa6-solid:clock text-2xs"></i>
                <span v-text="timeFormat(item.duration)"></span>
            </div>

            <!-- shorts indicator -->
            <div
                v-if="item.isShort"
                ref="shortsIndicator"
                :class="[
                    'shorts-indicator absolute flex items-center gap-1 bottom-2 right-2 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs leading-[1.6] text-white',
                    { 'indicator-hidden': isHovered },
                ]"
            >
                <i class="i-fa6-solid:bolt text-2xs"></i>
                <span v-t="'video.shorts'"></span>
            </div>

            <!-- watched indicator -->
            <div
                v-if="item.watched"
                ref="watchedIndicator"
                :class="[
                    'absolute flex items-center gap-1 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray-800 bg-opacity-75 px-2 py-1 watched-indicator',
                    { 'indicator-hidden': isHovered },
                ]"
                :title="$t('video.watched')"
            >
                <i class="i-fa6-solid:eye text-xl text-gray-300"></i>
                <span class="text-xs text-white leading-[1.6]">{{ $t("video.watched") }}</span>
            </div>
        </div>
    </div>

    <div class="relative" :class="small ? 'text-xs leading-[1.6]' : 'text-sm leading-[1.65]'">
        <i18n-t
            v-if="!isLiveStreamDisabled() && isLivestream(item)"
            keypath="video.live"
            class="thumbnail-overlay thumbnail-right !bg-red-600"
            tag="div"
        >
            <i class="i-fa6-solid:tower-broadcast w-3" />
        </i18n-t>
    </div>
</template>
<script>
import { getOptimalThumbnailUrl } from "../utils/ThumbnailUtils";

export default {
    props: {
        item: {
            type: Object,
            default: () => {
                return {};
            },
        },
        small: {
            type: Boolean,
            default: () => {
                return false;
            },
        },
        inPlaylist: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isHovered: false,
        };
    },
    computed: {
        title() {
            return this.item.title;
        },
        thumbnail() {
            return this.item.thumbnail;
        },
        optimizedThumbnail() {
            // Only transform video thumbnails, not channel avatars or other images
            if (this.thumbnail) {
                // Check if this is likely a video thumbnail by checking for common video ID patterns
                if (this.thumbnail.includes("ytimg.com") || this.thumbnail.includes("youtube.com")) {
                    // Extract video ID from the URL and use it for the CDN transformation
                    const videoIdMatch = this.thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
                    if (videoIdMatch && videoIdMatch[1]) {
                        // Use transformThumbnailUrl with the extracted video ID for more reliable processing
                        // getOptimalThumbnailUrl will automatically determine size based on device characteristics
                        return getOptimalThumbnailUrl(this.thumbnail);
                    } else {
                        // If we can't extract the video ID, use the original URL
                        return this.thumbnail;
                    }
                }
                // For other images (like channel avatars), return the original URL
                return this.thumbnail;
            }
            // If no thumbnail field exists, use the video ID to construct the thumbnail URL
            else if (this.item.id) {
                // Use getOptimalThumbnailUrl with an empty string and the video ID in options
                return getOptimalThumbnailUrl('', { videoId: this.item.id });
            }
            // Fallback to the thumbnail (which would be undefined/empty)
            return this.thumbnail;
        },
    },
    methods: {
        isLiveStreamDisabled() {
            return import.meta.env.VITE_DISABLE_LIVESTREAMS === "true";
        },
        isLivestream(item) {
            // Check various properties that might indicate a livestream
            // Don't consider short videos as livestreams
            if (item.isShort === true) {
                return false; // Short videos are not livestreams
            }
            return (
                item.livestream === true ||
                (item.duration !== undefined && item.duration <= 0) ||
                (item.duration === undefined && item.isLive === true) ||
                (item.duration !== undefined && item.duration === -1) ||
                item.uploadedDate === null
            );
        },
        onMouseEnter() {
            this.isHovered = true;
            this.applyHoverEffect(true);
        },
        onMouseLeave() {
            this.isHovered = false;
            this.applyHoverEffect(false);
        },
        applyHoverEffect() {
            // The hover effect is handled by CSS classes bound to the isHovered data property
            // No need to manually manipulate the styles anymore
        },
    },
};
</script>

<style>
.shorts-img {
    @apply w-full object-cover;
}

.watched-container {
    @apply relative;
}

/* Apply rounded corners to progress bar to match thumbnail */
.rounded-b-lg {
    @apply rounded-b-lg;
}

/* Ensure smooth transitions for JavaScript-managed effects */
.watched-overlay,
.watched-indicator,
.duration-indicator,
.shorts-indicator {
    transition:
        opacity 0.3s ease,
        backdrop-filter 0.3s ease;
}

/* Hover states for watched overlay */
.watched-overlay-hovered {
    opacity: 0.1;
    backdrop-filter: none;
}

/* Hide indicators on hover */
.indicator-hidden {
    opacity: 0;
}
</style>

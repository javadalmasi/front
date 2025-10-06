<template>
    <div class="w-full">
        <img
            loading="lazy"
            class="aspect-video w-full rounded-lg object-contain"
            :src="optimizedThumbnail"
            :alt="item.title"
            :class="{ 'shorts-img': item.isShort, 'opacity-75': item.watched }"
        />
        <!-- progress bar -->
        <div class="relative h-1 w-full">
            <div
                v-if="item.watched && item.duration > 0"
                class="absolute bottom-0 left-0 h-1 bg-red-600"
                :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
            />
        </div>
    </div>

    <div class="relative" :class="small ? 'text-xs' : 'text-sm'">
        <!-- shorts thumbnail -->
        <span v-if="item.isShort" v-t="'video.shorts'" class="thumbnail-overlay thumbnail-left" />
        <span
            v-if="item.duration > 0 || (item.duration == 0 && item.isShort)"
            class="thumbnail-overlay thumbnail-right px-0.5"
            v-text="timeFormat(item.duration)"
        />
        <i18n-t
            v-else-if="!isLiveStreamDisabled() && isLivestream(item)"
            keypath="video.live"
            class="thumbnail-overlay thumbnail-right !bg-red-600"
            tag="div"
        >
            <i class="i-fa6-solid:tower-broadcast w-3" />
        </i18n-t>
        <span v-if="item.watched" v-t="'video.watched'" class="thumbnail-overlay bottom-5px left-5px" />
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
    },
    computed: {
        title() {
            return this.item.dearrow?.titles[0]?.title ?? this.item.title;
        },
        thumbnail() {
            return this.item.dearrow?.thumbnails[0]?.thumbnail ?? this.item.thumbnail;
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
    },
};
</script>

<style>
.shorts-img {
    @apply w-full object-contain;
}
</style>

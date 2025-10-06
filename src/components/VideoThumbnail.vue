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
                    class="h-1 bg-red-600 rounded-b-lg"
                    :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
                />
            </div>

            <!-- watched overlay -->
            <div
                v-if="item.watched"
                ref="watchedOverlay"
                class="absolute inset-0 rounded-lg bg-black bg-opacity-20 backdrop-blur-[1px] watched-overlay"
            ></div>

            <!-- duration indicator for non-shorts -->
            <div
                v-if="!item.isShort && item.duration >= 0"
                ref="durationIndicator"
                class="duration-indicator absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs text-white"
            >
                <i class="i-fa6-solid:clock text-2xs"></i>
                <span v-text="timeFormat(item.duration)"></span>
            </div>

            <!-- shorts indicator -->
            <div
                v-if="item.isShort"
                ref="shortsIndicator"
                class="shorts-indicator absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs text-white"
            >
                <i class="i-fa6-solid:bolt text-2xs"></i>
                <span v-t="'video.shorts'"></span>
            </div>

            <!-- watched indicator -->
            <div
                v-if="item.watched"
                ref="watchedIndicator"
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-gray-800 bg-opacity-75 px-2 py-1 watched-indicator"
                :title="$t('video.watched')"
            >
                <i class="i-fa6-solid:eye text-xl text-gray-300"></i>
                <span class="text-white text-xs">{{ $t("video.watched") }}</span>
            </div>
        </div>
    </div>

    <div class="relative" :class="small ? 'text-xs' : 'text-sm'">
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
    },
    data() {
        return {
            isHovered: false,
        };
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
        onMouseEnter() {
            this.isHovered = true;
            this.applyHoverEffect(true);
        },
        onMouseLeave() {
            this.isHovered = false;
            this.applyHoverEffect(false);
        },
        applyHoverEffect(hovered) {
            // Apply effect to watched overlay if it exists
            if (this.$refs.watchedOverlay && this.item.watched) {
                const overlay = Array.isArray(this.$refs.watchedOverlay)
                    ? this.$refs.watchedOverlay[0]
                    : this.$refs.watchedOverlay;

                if (overlay) {
                    if (hovered) {
                        // On hover: reduce opacity and remove blur
                        overlay.style.opacity = "0.1";
                        overlay.style.backdropFilter = "none";
                    } else {
                        // On leave: restore original opacity and blur
                        overlay.style.opacity = "0.2";
                        overlay.style.backdropFilter = "blur(1px)";
                    }
                }
            }

            // Apply effect to watched indicator if it exists
            if (this.$refs.watchedIndicator && this.item.watched) {
                const indicator = Array.isArray(this.$refs.watchedIndicator)
                    ? this.$refs.watchedIndicator[0]
                    : this.$refs.watchedIndicator;

                if (indicator) {
                    indicator.style.opacity = hovered ? "0" : "1";
                }
            }

            // Apply effect to duration indicator if it exists
            if (this.$refs.durationIndicator) {
                const indicator = Array.isArray(this.$refs.durationIndicator)
                    ? this.$refs.durationIndicator[0]
                    : this.$refs.durationIndicator;

                if (indicator) {
                    if (hovered) {
                        // On hover: make transparent
                        indicator.style.opacity = "0";
                    } else {
                        // On leave: restore full opacity
                        indicator.style.opacity = "1";
                    }
                }
            }

            // Apply effect to shorts indicator if it exists
            if (this.$refs.shortsIndicator) {
                const indicator = Array.isArray(this.$refs.shortsIndicator)
                    ? this.$refs.shortsIndicator[0]
                    : this.$refs.shortsIndicator;

                if (indicator) {
                    if (hovered) {
                        // On hover: make transparent
                        indicator.style.opacity = "0";
                    } else {
                        // On leave: restore full opacity
                        indicator.style.opacity = "1";
                    }
                }
            }
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
.watched-indicator {
    transition:
        opacity 0.3s ease,
        backdrop-filter 0.3s ease;
}
</style>

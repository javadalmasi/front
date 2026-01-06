<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="videoUrl" class="link inline-block">
            <div class="relative">
                <img
                    loading="lazy"
                    :src="currentThumbnail"
                    alt="Playlist thumbnail"
                    class="aspect-video w-full rounded-lg object-cover progressive-image"
                    @load="onImageLoad"
                    @error="onImageError"
                />
                <div
                    class="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs text-white leading-[1.6]"
                >
                    <i class="i-fa6-solid:bars text-2xs"></i>
                    <span>{{ props.item.videos }} {{ $t("video.videos") }}</span>
                </div>
            </div>
            <p :style="titleStyle" class="link pt-2 font-bold" :title="props.item.name" v-text="props.item.name" />
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />

        <router-link
            v-if="props.item.uploaderUrl && props.item.uploaderName && !props.hideChannel"
            class="link-secondary text-sm leading-[1.65] no-underline hover:underline-dashed"
            :to="props.item.uploaderUrl"
        >
            <p>
                <span ref="uploaderNameRef" v-text="props.item.uploaderName" />
                <i v-if="props.item.uploaderVerified" class="i-fa6-solid:check mr-1.5" />
            </p>
        </router-link>
        <a
            v-else-if="props.item.uploaderName && !props.hideChannel"
            ref="uploaderNameRef"
            class="link no-underline hover:underline-dashed"
            v-text="props.item.uploaderName"
        />

        <br />
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { getProgressiveThumbnailUrls, getOptimalThumbnailUrl } from "../utils/ThumbnailUtils";

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    hideChannel: {
        type: Boolean,
        default: false,
    },
    clampTitleLines: {
        type: Boolean,
        default: true,
    },
});

const uploaderNameRef = ref(null);

const progressiveThumbnailUrls = computed(() => {
    // Apply the same thumbnail optimization as used in VideoThumbnail
    if (props.item.thumbnail) {
        // Check if this is likely a video thumbnail by checking for common video ID patterns
        if (props.item.thumbnail.includes("ytimg.com") || props.item.thumbnail.includes("youtube.com")) {
            // Extract video ID from the URL and use it for the CDN transformation
            const videoIdMatch = props.item.thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
            if (videoIdMatch && videoIdMatch[1]) {
                // For playlist items, use smaller dimensions similar to other tabs (426x240)
                // instead of letting getProgressiveThumbnailUrls choose based on screen size
                return getProgressiveThumbnailUrls(props.item.thumbnail, {
                    width: 426,
                    height: 240,
                    type: 'general'
                });
            } else {
                // If we can't extract the video ID, use the original URL for both
                return {
                    preloadUrl: props.item.thumbnail,
                    optimizedUrl: props.item.thumbnail
                };
            }
        }
        // For other images (like channel avatars), return the original URL for both
        return {
            preloadUrl: props.item.thumbnail,
            optimizedUrl: props.item.thumbnail
        };
    }
    return {
        preloadUrl: props.item.thumbnail,
        optimizedUrl: props.item.thumbnail
    };
});

const preloadThumbnail = computed(() => {
    return progressiveThumbnailUrls.value.preloadUrl;
});

const optimizedThumbnail = computed(() => {
    return progressiveThumbnailUrls.value.optimizedUrl;
});

const titleStyle = computed(() => {
    // Apply line clamping only if the prop is true
    if (props.clampTitleLines) {
        return {
            display: "-webkit-box",
            "-webkit-line-clamp": "2",
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
        };
    }
    // Return an empty style object when not clamping
    return {};
});

const videoUrl = computed(() => {
    const videoIdMatch = props.item.thumbnail?.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    // Convert playlist URL format from `/playlist?list=...` to `&list=...` for watch URL
    let playlistParams = '';
    if (props.item.url) {
        // Replace `/playlist?` with `&list=` to create a proper query parameter
        const playlistMatch = props.item.url.match(/\/playlist\?list=([^&]+)/);
        if (playlistMatch && playlistMatch[1]) {
            const listId = playlistMatch[1];
            const indexMatch = props.item.url.match(/[&?]index=(\d+)/);
            const index = indexMatch ? `&index=${indexMatch[1]}` : '';
            playlistParams = `&list=${listId}${index}`;
        }
    }

    if (videoId) {
        return `/watch?v=${videoId}${playlistParams}`;
    }

    // Fallback to original URL if video ID extraction fails
    return props.item.url;
});

// Reactive variable to track if the optimized image has loaded
const isLoaded = ref(false);

// Computed property for the current thumbnail to show
const currentThumbnail = computed(() => {
    return isLoaded.value ? optimizedThumbnail.value : preloadThumbnail.value;
});

// Method to handle progressive image loading
const onImageLoad = (event) => {
    // After preload image loads, load the optimized image in the background
    // Only apply progressive loading if this is actually a video thumbnail
    if (!isLoaded.value && props.item.thumbnail &&
        (props.item.thumbnail.includes("ytimg.com") || props.item.thumbnail.includes("youtube.com"))) {
        // Preload the optimized image by creating an Image object
        const img = new Image();
        img.src = optimizedThumbnail.value;
        img.onload = () => {
            // Once optimized image is loaded, update the state
            isLoaded.value = true;
        };
    } else {
        // If it's not a video thumbnail, just mark as loaded immediately
        isLoaded.value = true;
    }
};

// Method to handle image errors
const onImageError = (event) => {
    // Don't use placeholder images - just let the image fail gracefully
    import("../utils/DebugLogger").then(({ debugLogger }) => {
        debugLogger.warn("Playlist thumbnail failed to load:", event.target.src);
    });
};
</script>
<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="props.item.url" class="link inline-block">
            <div class="relative">
                <img loading="lazy" class="aspect-video w-full rounded-lg object-cover" :src="optimizedThumbnail" />
                <div
                    class="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs leading-[1.6] text-white"
                >
                    <i class="i-fa6-solid:bars text-2xs"></i>
                    <span>{{ props.item.videos }} {{ $t("video.videos") }}</span>
                </div>
            </div>
            <p class="link pt-2 font-bold" :title="props.item.name" v-text="props.item.name" />
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />

        <router-link
            v-if="props.item.uploaderUrl && props.item.uploaderName && !props.hideChannel"
            class="link-secondary text-sm leading-[1.65] no-underline hover:underline-dashed"
            :to="props.item.uploaderUrl"
        >
            <p>
                <span ref="uploaderNameRef" v-text="truncatedUploaderName" />
                <i v-if="props.item.uploaderVerified" class="i-fa6-solid:check mr-1.5" />
            </p>
        </router-link>
        <a
            v-else-if="props.item.uploaderName && !props.hideChannel"
            class="link no-underline hover:underline-dashed"
            ref="uploaderNameRef"
            v-text="truncatedUploaderName"
        />

        <br />
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { truncateStringByWidth } from "../utils/Misc";
import { getOptimalThumbnailUrl } from "../utils/ThumbnailUtils";

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    hideChannel: {
        type: Boolean,
        default: false,
    },
});

const uploaderNameRef = ref(null);

const optimizedThumbnail = computed(() => {
    // Apply the same thumbnail optimization as used in VideoThumbnail
    if (props.item.thumbnail) {
        // Check if this is likely a video thumbnail by checking for common video ID patterns
        if (props.item.thumbnail.includes("ytimg.com") || props.item.thumbnail.includes("youtube.com")) {
            // Extract video ID from the URL and use it for the CDN transformation
            const videoIdMatch = props.item.thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
            if (videoIdMatch && videoIdMatch[1]) {
                // Use getOptimalThumbnailUrl to automatically determine size based on device characteristics
                return getOptimalThumbnailUrl(props.item.thumbnail);
            } else {
                // If we can't extract the video ID, use the original URL
                return props.item.thumbnail;
            }
        }
        // For other images (like channel avatars), return the original URL
        return props.item.thumbnail;
    }
    return props.item.thumbnail;
});

// For now, using a default width as we can't easily measure the element width in setup
// We'll implement a more advanced solution with a watcher if needed
const truncatedUploaderName = computed(() => {
    // Instead of using a fixed character limit, we'll use a reasonable default width in px
    // This could be adjusted based on screen size or container width
    const maxWidth = 120; // Default max width in pixels
    return props.item.uploaderName ? truncateStringByWidth(props.item.uploaderName, maxWidth) : props.item.uploaderName;
});
</script>

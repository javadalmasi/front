<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="props.item.url" class="link inline-block">
            <div class="relative">
                <img loading="lazy" class="aspect-video w-full rounded-lg object-cover" :src="optimizedThumbnail" />
                <div
                    class="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black bg-opacity-75 px-1.5 py-0.5 text-xs text-white"
                >
                    <i class="i-fa6-solid:bars text-2xs"></i>
                    <span>{{ props.item.videos }} {{ $t("video.videos") }}</span>
                </div>
            </div>
            <p class="link pt-2 font-bold" :title="props.item.name" v-text="props.item.name" />
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />

        <router-link
            v-if="props.item.uploaderUrl"
            class="link-secondary text-sm no-underline hover:underline-dashed"
            :to="props.item.uploaderUrl"
        >
            <p>
                <span v-text="truncatedUploaderName" />
                <i v-if="props.item.uploaderVerified" class="i-fa6-solid:check mr-1.5" />
            </p>
        </router-link>
        <a
            v-else-if="props.item.uploaderName"
            class="link no-underline hover:underline-dashed"
            v-text="truncatedUploaderName"
        />

        <br />
    </div>
</template>

<script setup>
import { computed } from "vue";
import { truncateString } from "../utils/Misc";
import { getOptimalThumbnailUrl } from "../utils/ThumbnailUtils";

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

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

const truncatedUploaderName = computed(() => {
    const limit = import.meta.env.VITE_CHANNEL_NAME_LIMIT ? parseInt(import.meta.env.VITE_CHANNEL_NAME_LIMIT) : 16;
    return truncateString(props.item.uploaderName, limit);
});
</script>

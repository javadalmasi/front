<template>
    <div>
        <router-link :to="{ path: '/playlist', query: { list: playlistId } }"
            ><h1 class="font-bold leading-[1.7] !text-lg hover:underline" v-text="playlist.name"
        /></router-link>
        <span class="text-sm leading-[1.65]">
            <template v-if="playlist.uploader">
                <router-link class="link-secondary" :to="playlist.uploaderUrl" :title="playlist.uploader">
                    {{ playlist.uploader }}
                </router-link>
                -
            </template>
            {{ selectedIndex }} / {{ playlist.videos }}
        </span>
    </div>
    <div ref="scrollable" class="mt-4 max-h-screen-sm overflow-y-auto">
        <div
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :index="index"
            :playlist-id="playlistId"
            :prefer-listen="preferListen"
        >
            <router-link
                class="flex rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
                :class="{ 'bg-gray-200 dark:bg-neutral-700': index === selectedIndex - 1 }"
                :to="{
                    path: '/watch',
                    query: {
                        v: related.url.substr(-11),
                        ...(playlistId && { list: playlistId }),
                        ...(index >= 0 && { index: index + 1 }),
                        ...(preferListen && { listen: 1 }),
                    },
                }"
            >
                <span class="min-w-5 flex-none text-xs leading-[1.6]" v-text="index + 1" />
                <div class="w-24 flex-none">
                    <VideoThumbnail :item="related" :small="true" />
                </div>

                <div class="mr-2 flex flex-col">
                    <span class="link" :title="related.title" v-text="related.title" />
                    <div class="flex-1">
                        <router-link
                            v-if="related.uploaderUrl && related.uploaderName && !hideChannel"
                            class="link-secondary block overflow-hidden text-xs leading-[1.6] no-underline hover:underline-dashed"
                            :to="related.uploaderUrl"
                            :title="related.uploaderName"
                        >
                            <span v-text="getTruncatedUploaderName(related.uploaderName)" />
                            <i v-if="related.uploaderVerified" class="i-fa6-solid:check mr-1.5" />
                        </router-link>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { nextTick } from "vue";
import VideoThumbnail from "./VideoThumbnail.vue";
import { truncateStringByWidth } from "../utils/Misc";

export default {
    components: { VideoThumbnail },
    props: {
        playlist: {
            type: Object,
            required: true,
        },
        playlistId: {
            type: String,
            required: true,
        },
        selectedIndex: {
            type: Number,
            required: true,
        },
        preferListen: {
            type: Boolean,
            default: false,
        },
        hideChannel: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        playlist: {
            handler() {
                if (this.selectedIndex - 1 < this.playlist.relatedStreams.length)
                    nextTick(() => {
                        this.updateScroll();
                    });
            },
            deep: true,
        },
    },
    mounted() {
        this.updateScroll();
        this.updateWatched(this.playlist.relatedStreams);
    },
    methods: {
        updateScroll() {
            const elems = Array.from(this.$refs.scrollable.children).filter(elm => elm.matches("div"));
            const index = this.selectedIndex - 1;
            if (index < elems.length)
                this.$refs.scrollable.scrollTop =
                    elems[this.selectedIndex - 1].offsetTop - this.$refs.scrollable.offsetTop;
        },
        getTruncatedUploaderName(uploaderName) {
            // Calculate available width based on element's container
            // Default to 80px if we can't determine the width
            const maxWidth = this.calculateAvailableWidth();
            return uploaderName ? truncateStringByWidth(uploaderName, maxWidth) : uploaderName;
        },
        calculateAvailableWidth() {
            // For playlist videos, we use a default width since each item has limited space
            // We can't easily measure the specific element width here, so we use an estimated value
            return 80; // Reasonable width for the limited space in playlist items
        },
    },
};
</script>

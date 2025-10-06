<template>
    <div v-if="showVideo" class="h-full flex flex-col overflow-hidden card transition-all duration-200 hover:shadow-lg">
        <!-- Video Thumbnail -->
        <router-link :to="watchUrl" class="relative block">
            <VideoThumbnail :item="item" />
        </router-link>

        <!-- Video Details -->
        <div class="flex flex-1 gap-3 p-3">
            <!-- Uploader Avatar -->
            <router-link v-if="item.uploaderAvatar && !hideChannel" :to="item.uploaderUrl" class="flex-shrink-0">
                <div class="relative">
                    <img loading="lazy" :src="item.uploaderAvatar" class="h-9 w-9 rounded-full bg-surface" alt="" />
                    <div
                        v-if="item.uploaderVerified"
                        class="absolute end-0 bottom-0 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-primary"
                        :title="$t('channel.verified')"
                    >
                        <i class="i-fa6-solid:check text-[7px] text-white" />
                    </div>
                </div>
            </router-link>

            <!-- Title & Metadata -->
            <div class="overflow-hidden">
                <router-link :to="watchUrl" :title="title">
                    <h3
                        class="overflow-hidden text-main font-semibold"
                        style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                        v-text="title"
                    ></h3>
                </router-link>

                <div class="mt-1.5 flex flex-col text-sm text-soft">
                    <router-link
                        v-if="item.uploaderName && !hideChannel"
                        :to="item.uploaderUrl"
                        class="hover:underline"
                        :title="item.uploaderName"
                    >
                        <span>{{ item.uploaderName }}</span>
                    </router-link>

                    <div class="flex items-center gap-1.5">
                        <span v-if="item.views >= 0">
                            {{ `${numberFormat(item.views)} ${$t("video.views", item.views)}` }}
                        </span>
                        <span v-if="item.views >= 0 && (item.uploaded > 0 || item.uploadedDate)">•</span>
                        <span v-if="item.uploaded > 0" :title="new Date(item.uploaded).toLocaleString()">
                            {{ timeAgo(item.uploaded) }}
                        </span>
                        <span v-else-if="item.uploadedDate">{{ item.uploadedDate }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VideoThumbnail from "./VideoThumbnail.vue";

export default {
    components: { VideoThumbnail },
    props: {
        item: {
            type: Object,
            required: true,
        },
        isFeed: {
            type: Boolean,
            default: false,
        },
        hideChannel: { type: Boolean, default: false },
        index: { type: Number, default: -1 },
        playlistId: { type: String, default: null },
        preferListen: { type: Boolean, default: false },
    },
    emits: ["update:watched"],
    data() {
        return {
            showVideo: true,
        };
    },
    computed: {
        title() {
            return this.item.dearrow?.titles[0]?.title ?? this.item.title;
        },
        watchUrl() {
            return {
                path: "/watch",
                query: {
                    v: this.item.url.substr(-11),
                    ...(this.playlistId && { list: this.playlistId }),
                    ...(this.index >= 0 && { index: this.index + 1 }),
                    ...(this.preferListen && { listen: 1 }),
                },
            };
        },
    },
    mounted() {
        this.shouldShowVideo();
    },
    methods: {
        shouldShowVideo() {
            if (!this.isFeed || !this.getPreferenceBoolean("hideWatched", false) || !window.db) return;

            const objectStore = window.db.transaction("watch_history", "readonly").objectStore("watch_history");
            const request = objectStore.get(this.item.url.substr(-11));
            request.onsuccess = event => {
                const video = event.target.result;
                // Hide video if it's considered fully watched
                if (video && video.currentTime && video.duration && video.currentTime > video.duration * 0.9) {
                    this.showVideo = false;
                }
            };
            request.onerror = () => {
                // If db query fails, just show the video
                this.showVideo = true;
            };
        },
    },
};
</script>

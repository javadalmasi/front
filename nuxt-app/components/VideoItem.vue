<template>
    <div v-if="showVideo" class="h-full flex flex-col flex-justify-between">
        <NuxtLink
            class="link inline-block w-full"
            :to="{
                path: '/watch',
                query: {
                    v: item.url.substr(-11),
                    ...(playlistId && { list: playlistId }),
                    ...(index >= 0 && { index: index + 1 }),
                    ...(preferListen && { listen: 1 }),
                },
            }"
        >
            <VideoThumbnail :item="item" />

            <div>
                <p
                    :style="lineClampStyle"
                    class="link flex overflow-hidden pt-2 font-bold"
                    :title="title"
                    v-text="title"
                />
            </div>
        </NuxtLink>

        <div class="flex items-center">
            <NuxtLink :to="item.uploaderUrl" class="mr-0.5 mt-0.5 flex-shrink-0">
                <div class="relative inline-block">
                    <img
                        v-if="item.uploaderAvatar"
                        loading="lazy"
                        :src="getOptimalThumbnailUrl(item.uploaderAvatar, { width: '68', height: '68', quality: 85 })"
                        :class="{ 'border-2 border-blue-700': item.uploaderVerified, 'rounded-full': true }"
                        class="h-32px w-32px"
                        width="68"
                        height="68"
                    />
                    <div
                        v-if="item.uploaderVerified && item.uploaderAvatar"
                        class="absolute end-0 bottom-0 h-4 w-4 flex items-center justify-center rounded-full bg-blue-700"
                    >
                        <i class="i-fa6-solid:check text-[8px] text-white" />
                    </div>
                </div>
            </NuxtLink>

            <div class="flex-1 px-2 min-w-0">
                <!-- Added min-w-0 to prevent flex item from overflowing -->
                <NuxtLink
                    v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
                    class="link-secondary overflow-hidden text-sm leading-[1.65] no-underline hover:underline-dashed"
                    :to="item.uploaderUrl"
                    :title="item.uploaderName"
                >
                    <span v-text="truncatedUploaderName" />
                </NuxtLink>

                <div v-if="item.views >= 0 || item.uploadedDate" class="video-info">
                    <span v-if="item.views >= 0">
                        <!-- <i class="i-fa6-solid:eye" /> -->
                        <span class="pr-1" v-text="`${numberFormat(item.views)} •`" />
                    </span>
                    <span
                        v-if="item.uploaded > 0"
                        class="pr-0.5"
                        :title="new Date(item.uploaded).toLocaleString()"
                        v-text="timeAgo(item.uploaded)"
                    />
                    <span v-else-if="item.uploadedDate" class="pr-0.5" v-text="item.uploadedDate" />
                </div>
            </div>

            <div v-if="!shouldHideVideoItemIcons" class="flex items-center gap-2.5">
                <NuxtLink
                    :to="{
                        path: '/watch',
                        query: {
                            v: item.url.substr(-11),
                            ...(playlistId && { list: playlistId }),
                            ...(index >= 0 && { index: index + 1 }),
                            ...(!preferListen && { listen: 1 }),
                        },
                    }"
                    :aria-label="preferListen ? title : 'Listen to ' + title"
                    :title="preferListen ? title : 'Listen to ' + title"
                >
                    <i :class="preferListen ? 'i-fa6-solid:tv' : 'i-fa6-solid:headphones'" />
                </NuxtLink>
                <button :title="$t('actions.add_to_playlist')" @click="showPlaylistModal = !showPlaylistModal">
                    <i class="i-fa6-solid:circle-plus" />
                </button>
                <button :title="$t('actions.share')" @click="showShareModal = !showShareModal">
                    <i class="i-fa6-solid:share" />
                </button>
                <button
                    v-if="admin"
                    ref="removeButton"
                    :title="$t('actions.remove_from_playlist')"
                    @click="showConfirmRemove = true"
                >
                    <i class="i-fa6-solid:circle-minus" />
                </button>
                <button
                    v-if="showMarkOnWatched && isFeed"
                    ref="watchButton"
                    @click="toggleWatched(item.url.substr(-11))"
                >
                    <i
                        v-if="item.watched && item.currentTime > item.duration * 0.9"
                        :title="$t('actions.mark_as_unwatched')"
                        class="i-fa6-solid:eye-slash"
                    />
                    <i v-else :title="$t('actions.mark_as_watched')" class="i-fa6-solid:eye" />
                </button>
                <ConfirmModal
                    v-if="showConfirmRemove"
                    :message="$t('actions.delete_playlist_video_confirm')"
                    @close="showConfirmRemove = false"
                    @confirm="removeVideo(item.url.substr(-11))"
                />
                <PlaylistAddModal
                    v-if="showPlaylistModal"
                    :video-id="item.url.substr(-11)"
                    :video-info="item"
                    @close="showPlaylistModal = false"
                />
                <ShareModal
                    v-if="showShareModal"
                    :video-id="item.url.substr(-11)"
                    :current-time="0"
                    @close="showShareModal = false"
                />
            </div>
        </div>
    </div>
</template>

<script>
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import VideoThumbnail from "./VideoThumbnail.vue";
import { truncateStringByWidth } from "../utils/Misc";

export default {
    components: { PlaylistAddModal, ConfirmModal, ShareModal, VideoThumbnail },
    props: {
        item: {
            type: Object,
            default: () => {
                return {};
            },
        },
        isFeed: {
            type: Boolean,
            default: false,
        },
        height: { type: String, default: "118" },
        width: { type: String, default: "210" },
        hideChannel: { type: Boolean, default: false },
        index: { type: Number, default: -1 },
        playlistId: { type: String, default: null },
        preferListen: { type: Boolean, default: false },
        admin: { type: Boolean, default: false },
        clampTitleLines: { type: Boolean, default: true },
    },
    emits: ["update:watched", "remove"],
    data() {
        return {
            showPlaylistModal: false,
            showShareModal: false,
            showVideo: true,
            showConfirmRemove: false,
            showMarkOnWatched: false,
        };
    },
    computed: {
        title() {
            return this.item.dearrow?.titles[0]?.title ?? this.item.title;
        },
        thumbnail() {
            return this.item.dearrow?.thumbnails[0]?.thumbnail ?? this.item.thumbnail;
        },
        truncatedUploaderName() {
            // Calculate available width based on element's container
            // Default to 100px if we can't determine the width
            const maxWidth = this.calculateUploaderNameWidth();
            return this.item.uploaderName
                ? truncateStringByWidth(this.item.uploaderName, maxWidth)
                : this.item.uploaderName;
        },
        lineClampStyle() {
            // Apply line clamping only if the prop is true
            if (this.clampTitleLines) {
                return {
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                };
            }
            // Return an empty style object when not clamping
            return {};
        },
        shouldHideVideoItemIcons() {
            return import.meta.env.VITE_DISABLE_VIDEO_ITEM_ICONS === "true";
        },
    },
    mounted() {
        this.shouldShowVideo();
        this.shouldShowMarkOnWatched();
    },
    methods: {
        removeVideo() {
            this.$refs.removeButton.disabled = true;
            this.removeVideoFromPlaylist(this.playlistId, this.index).then(json => {
                if (json.error) alert(json.error);
                else this.$emit("remove");
            });
        },
        shouldShowVideo() {
            if (!this.isFeed || !this.getPreferenceBoolean("hideWatched", false)) return;

            const objectStore = window.db.transaction("watch_history", "readonly").objectStore("watch_history");
            const request = objectStore.get(this.item.url.substr(-11));
            request.onsuccess = event => {
                const video = event.target.result;
                if (video && (video.currentTime ?? 0) > video.duration * 0.9) {
                    this.showVideo = false;
                    return;
                }
            };
        },
        shouldShowMarkOnWatched() {
            this.showMarkOnWatched = this.getPreferenceBoolean("watchHistory", false);
        },
        toggleWatched(videoId) {
            if (window.db) {
                var tx = window.db.transaction("watch_history", "readwrite");
                var store = tx.objectStore("watch_history");
                var instance = this;
                var request = store.get(videoId);
                request.onsuccess = function (event) {
                    var video = event.target.result;
                    if (video) {
                        video.watchedAt = Date.now();
                    } else {
                        video = {
                            videoId: videoId,
                            title: instance.item.title,
                            duration: instance.item.duration,
                            thumbnail: instance.item.thumbnail,
                            uploaderUrl: instance.item.uploaderUrl,
                            uploaderName: instance.item.uploaderName,
                            watchedAt: Date.now(),
                        };
                    }
                    video.currentTime =
                        instance.item.currentTime < instance.item.duration * 0.9 ? instance.item.duration : 0;
                    store.put(video);
                    instance.$emit("update:watched", [instance.item.url]);
                    instance.shouldShowVideo();
                };
            }
        },
        calculateUploaderNameWidth() {
            // Get the container element that displays the uploader name
            if (this.$el && this.$el.querySelector) {
                const nameElement = this.$el.querySelector(".link-secondary");
                if (nameElement) {
                    let availableWidth = nameElement.clientWidth - 10; // 10px buffer

                    // If video item icons are hidden, we have more space available
                    if (this.shouldHideVideoItemIcons) {
                        // Add extra space that would have been taken by the icons container
                        // The icons container has class "flex items-center gap-2.5" which adds extra space
                        // This means when icons are hidden, the channel name can use that space
                        const extraSpace = 100; // Approximate width of the icons container when present
                        availableWidth += extraSpace;
                    }

                    return availableWidth;
                }
            }
            // Default fallback width (in pixels)
            return this.shouldHideVideoItemIcons ? 200 : 100; // More space when icons are hidden
        },
    },
};
</script>

<style>
.video-info {
    @apply mt-1 text-xs leading-[1.6] text-gray-600 font-normal;
}

.dark .video-info {
    @apply text-gray-400;
}
</style>

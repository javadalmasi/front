<template>
    <div class="homepage">
        <div v-if="loading" class="loading-indicator">Loading...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="!loading && !error" class="space-y-8">
            <!-- Recommended Videos Section -->
            <div v-if="videos.length > 0">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-xl font-bold">{{ $t("titles.recommended") }}</h2>
                    <div class="flex gap-2">
                        <button
                            class="rounded-full px-4 py-2 text-sm font-medium"
                            :class="sortBy === 'views' ? 'bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-800'"
                            @click="sortBy = 'views'"
                        >
                            {{ $t("sort.most_viewed") }}
                        </button>
                        <button
                            class="rounded-full px-4 py-2 text-sm font-medium"
                            :class="sortBy === 'latest' ? 'bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-800'"
                            @click="sortBy = 'latest'"
                        >
                            {{ $t("sort.latest") }}
                        </button>
                    </div>
                </div>
                <div class="carousel-container">
                    <div class="carousel-grid">
                        <ContentItem
                            v-for="video in sortedVideos"
                            :key="video.url"
                            :item="video"
                            class="carousel-item"
                        />
                    </div>
                </div>
            </div>

            <!-- Shorts Section -->
            <div v-if="shorts.length > 0">
                <h2 class="mb-4 text-xl font-bold">{{ $t("titles.shorts") }}</h2>
                <div class="carousel-container">
                    <ContentItem
                        v-for="short in shorts"
                        :key="short.url"
                        :item="short"
                        class="carousel-item short-item"
                    />
                </div>
            </div>

            <!-- Watched Items Section -->
            <div v-if="watchedVideos.length > 0">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-xl font-bold">{{ $t("titles.watched_items") }}</h2>
                    <router-link to="/history" class="text-sm text-blue-500 hover:underline">
                        {{ $t("history.view_all") }}
                    </router-link>
                </div>
                <div class="carousel-container">
                    <ContentItem v-for="video in watchedVideos" :key="video.url" :item="video" class="carousel-item" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { channelIds } from "../channels.js";
import ContentItem from "./ContentItem.vue";

export default {
    components: {
        ContentItem,
    },
    data() {
        return {
            videos: [],
            shorts: [],
            watchedVideos: [],
            loading: true,
            error: null,
            sortBy: "latest",
        };
    },
    computed: {
        sortedVideos() {
            if (this.sortBy === "latest") {
                return [...this.videos].sort((a, b) => b.uploaded - a.uploaded);
            }
            return [...this.videos].sort((a, b) => b.views - a.views);
        },
    },
    async mounted() {
        await this.fetchFeed();
        this.fetchWatchHistory();
    },
    methods: {
        async fetchFeed() {
            this.loading = true;
            this.error = null;
            try {
                const channelsQueryParam = channelIds.join(",");
                const response = await fetch(
                    `https://api.vidioo.ir/feed/unauthenticated?channels=${channelsQueryParam}`,
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch feed.");
                }
                const data = await response.json();
                this.videos = data.filter(item => !item.isShort);
                this.shorts = data.filter(item => item.isShort);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
        fetchWatchHistory() {
            if (window.db) {
                const tx = window.db.transaction("watch_history", "readonly");
                const store = tx.objectStore("watch_history");
                const request = store.openCursor(null, "prev");
                const watched = [];
                request.onsuccess = event => {
                    const cursor = event.target.result;
                    if (cursor && watched.length < 10) {
                        watched.push({
                            url: "/watch?v=" + cursor.value.videoId,
                            ...cursor.value,
                        });
                        cursor.continue();
                    } else {
                        this.watchedVideos = watched;
                    }
                };
            }
        },
    },
};
</script>

<style scoped>
.homepage {
    @apply p-4;
}
.carousel-container {
    @apply flex overflow-x-auto pb-4;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
}
.carousel-container::-webkit-scrollbar {
    height: 8px;
}
.carousel-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}
.carousel-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}
.carousel-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}
.carousel-item {
    @apply mr-4 w-64 flex-shrink-0;
}
.short-item {
    @apply w-40;
}
.short-item :deep(.video-thumbnail) {
    aspect-ratio: 9 / 16;
}
.short-item :deep(.video-thumbnail img) {
    @apply h-full w-full object-cover;
}
.carousel-grid {
    @apply grid auto-cols-max grid-flow-col gap-4;
    grid-template-rows: repeat(2, 1fr);
}
.loading-indicator,
.error-message {
    @apply p-8 text-center text-xl;
}
</style>

<template>
    <div>
        <div class="flex gap-4 mb-4">
            <button
                @click="sortBy = 'views'"
                class="px-4 py-2 rounded-md"
                :class="sortBy === 'views' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-800'"
            >
                پربازدیدترین ها
            </button>
            <button
                @click="sortBy = 'latest'"
                class="px-4 py-2 rounded-md"
                :class="sortBy === 'latest' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-800'"
            >
                جدیدترین ها
            </button>
        </div>
        <div v-if="loading">Loading...</div>
        <div v-if="error">{{ error }}</div>
        <div v-if="!loading && !error">
            <!-- Shorts Section -->
            <div v-if="shorts.length > 0" class="shorts-container">
                <h2>{{ $t("titles.shorts") }}</h2>
                <div class="shorts-grid">
                    <ContentItem v-for="short in shorts" :key="short.url" :item="short" class="short-item" />
                </div>
            </div>

            <!-- Videos Section -->
            <div v-if="videos.length > 0" class="videos-container">
                <div
                    class="video-grid grid grid-cols-1 gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2"
                    @dragover.prevent
                    @drop="onDrop"
                >
                    <ContentItem
                        v-for="(video, index) in sortedVideos"
                        :key="video.url"
                        :item="video"
                        draggable="true"
                        @dragstart="onDragStart(index)"
                    />
                </div>
            </div>

            <!-- Watched Items Section -->
            <div v-if="watchedVideos.length > 0" class="watched-container">
                <h2>{{ $t("titles.watched_items") }}</h2>
                <div class="video-grid grid grid-cols-1 gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
                    <ContentItem v-for="video in watchedVideos" :key="video.url" :item="video" />
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
            sortBy: "latest", // Default sort
            draggedIndex: null,
        };
    },
    computed: {
        sortedVideos() {
            if (this.sortBy === "latest") {
                return [...this.videos].sort((a, b) => b.uploaded - a.uploaded);
            }
            // Default sort by views
            return [...this.videos].sort((a, b) => b.views - a.views);
        },
    },
    async mounted() {
        await this.fetchFeed();
        this.fetchWatchHistory();
    },
    methods: {
        onDragStart(index) {
            this.draggedIndex = index;
        },
        onDrop(event) {
            event.preventDefault();
            const targetElement = event.target.closest(".video-grid > *");
            if (!targetElement) return;

            const toIndex = Array.from(targetElement.parentNode.children).indexOf(targetElement);
            const fromIndex = this.draggedIndex;

            if (fromIndex === toIndex) return;

            const itemToMove = this.videos.splice(fromIndex, 1)[0];
            this.videos.splice(toIndex, 0, itemToMove);
            this.draggedIndex = null;
        },
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

                // Separate videos and shorts
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
                        // Limit to 10 items
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
.shorts-container,
.videos-container {
    margin-bottom: 2rem;
}
.shorts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}
.short-item {
    aspect-ratio: 9 / 16;
    width: 100%;
    max-width: 200px;
}
</style>

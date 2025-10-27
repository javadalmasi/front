<template>
    <div class="homepage">
        <div v-if="loading" class="loading-indicator">Loading...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="!loading && !error">
            <!-- Recommended Videos Section -->
            <div v-if="videos.length > 0" class="carousel-section">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold">{{ $t("titles.recommended") }}</h2>
                    <div class="flex gap-2">
                        <button
                            @click="sortBy = 'views'"
                            class="px-3 py-1 rounded-full text-sm"
                            :class="
                                sortBy === 'views'
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-200 dark:bg-gray-800'
                            "
                        >
                            {{ $t("sort.most_viewed") }}
                        </button>
                        <button
                            @click="sortBy = 'latest'"
                            class="px-3 py-1 rounded-full text-sm"
                            :class="
                                sortBy === 'latest'
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-200 dark:bg-gray-800'
                            "
                        >
                            {{ $t("sort.latest") }}
                        </button>
                    </div>
                </div>
                <div
                    class="carousel-container recommended-carousel"
                    ref="recommendedCarousel"
                    @mousedown="onMouseDown"
                    @mouseleave="onMouseLeave"
                    @mouseup="onMouseUp"
                    @mousemove="onMouseMove"
                >
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
            <div v-if="shorts.length > 0" class="carousel-section">
                <h2 class="text-xl font-bold mb-4">{{ $t("titles.shorts") }}</h2>
                <div
                    class="carousel-container shorts-carousel"
                    ref="shortsCarousel"
                    @mousedown="onMouseDown"
                    @mouseleave="onMouseLeave"
                    @mouseup="onMouseUp"
                    @mousemove="onMouseMove"
                >
                    <ContentItem
                        v-for="short in shorts"
                        :key="short.url"
                        :item="short"
                        class="carousel-item short-item"
                    />
                </div>
            </div>

            <!-- Watched Items Section -->
            <div v-if="watchedVideos.length > 0" class="carousel-section">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold">{{ $t("titles.watched_items") }}</h2>
                    <router-link to="/history" class="text-sm text-blue-500 hover:underline">
                        {{ $t("history.view_all") }}
                    </router-link>
                </div>
                <div
                    class="carousel-container watched-carousel"
                    ref="watchedCarousel"
                    @mousedown="onMouseDown"
                    @mouseleave="onMouseLeave"
                    @mouseup="onMouseUp"
                    @mousemove="onMouseMove"
                >
                    <ContentItem
                        v-for="video in watchedVideos"
                        :key="video.url"
                        :item="video"
                        class="carousel-item"
                    />
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
            isDown: false,
            startX: null,
            scrollLeft: null,
            activeCarousel: null,
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
        onMouseDown(e) {
            this.activeCarousel = e.currentTarget;
            this.isDown = true;
            this.activeCarousel.classList.add("active");
            this.startX = e.pageX - this.activeCarousel.offsetLeft;
            this.scrollLeft = this.activeCarousel.scrollLeft;
        },
        onMouseLeave() {
            if (!this.isDown) return;
            this.isDown = false;
            if (this.activeCarousel) {
                this.activeCarousel.classList.remove("active");
                this.activeCarousel = null;
            }
        },
        onMouseUp() {
            this.isDown = false;
            if (this.activeCarousel) {
                this.activeCarousel.classList.remove("active");
                this.activeCarousel = null;
            }
        },
        onMouseMove(e) {
            if (!this.isDown || !this.activeCarousel) return;
            e.preventDefault();
            const x = e.pageX - this.activeCarousel.offsetLeft;
            const walk = (x - this.startX) * 2; //scroll-fast
            this.activeCarousel.scrollLeft = this.scrollLeft - walk;
        },
    },
};
</script>

<style scoped>
.homepage {
    @apply p-4;
}
.carousel-section {
    @apply mb-8;
}
.carousel-container {
    @apply flex overflow-x-auto pb-4 cursor-grab;
    -webkit-overflow-scrolling: touch; /* for smooth scrolling on iOS */
    scrollbar-width: none; /* for Firefox */
}
.carousel-container::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
}
.carousel-container.active {
    @apply cursor-grabbing;
}
.carousel-item {
    @apply flex-shrink-0 w-64 mr-4;
}
.short-item {
    @apply w-40;
}
.recommended-carousel .carousel-grid {
    @apply grid grid-flow-col auto-cols-max gap-4;
    grid-template-rows: repeat(2, 1fr);
}
.loading-indicator, .error-message {
    @apply text-center text-xl p-8;
}
</style>

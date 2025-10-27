<template>
    <div>
        <div v-if="loading">Loading...</div>
        <div v-if="error">{{ error }}</div>
        <div v-if="!loading && !error">
            <!-- Shorts Section -->
            <div v-if="shorts.length > 0" class="shorts-container">
                <h2>Shorts</h2>
                <div class="shorts-grid">
                    <div v-for="short in shorts" :key="short.url" class="short-item">
                        <img :src="short.thumbnail" :alt="short.title" />
                        <h3>{{ short.title }}</h3>
                        <p>{{ short.uploaderName }}</p>
                        <p>{{ short.views.toLocaleString() }} views</p>
                    </div>
                </div>
            </div>

            <!-- Videos Section -->
            <div v-if="videos.length > 0" class="videos-container">
                <h2>Videos</h2>
                <div class="video-grid">
                    <div v-for="video in videos" :key="video.url" class="video-item">
                        <img :src="video.thumbnail" :alt="video.title" />
                        <h3>{{ video.title }}</h3>
                        <p>{{ video.uploaderName }}</p>
                        <p>{{ video.views.toLocaleString() }} views</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { channelIds } from "../channels.js";

export default {
    data() {
        return {
            videos: [],
            shorts: [],
            loading: true,
            error: null,
        };
    },
    async mounted() {
        await this.fetchFeed();
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

                // Sort data by views in descending order
                const sortedData = data.sort((a, b) => b.views - a.views);

                // Separate videos and shorts
                this.videos = sortedData.filter(item => !item.isShort);
                this.shorts = sortedData.filter(item => item.isShort);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
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
.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}
.short-item img,
.video-item img {
    width: 100%;
    border-radius: 8px;
}
.short-item h3,
.video-item h3 {
    font-size: 1rem;
    font-weight: 500;
    margin-top: 0.5rem;
}
</style>

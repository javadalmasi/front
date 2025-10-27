<template>
    <div>
        <div v-if="shorts.length > 0">
            <h2 class="my-4 text-2xl font-bold">Shorts</h2>
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <VideoItem v-for="video in shorts" :key="video.videoId" :video="video" />
            </div>
        </div>
        <div v-if="videos.length > 0">
            <h2 class="my-4 text-2xl font-bold">Videos</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <VideoItem v-for="video in videos" :key="video.videoId" :video="video" />
            </div>
        </div>
    </div>
</template>

<script>
import { channels } from "../channels.js";
import VideoItem from "../components/VideoItem.vue";

export default {
    components: {
        VideoItem,
    },
    data() {
        return {
            videos: [],
            shorts: [],
        };
    },
    async mounted() {
        const channelIds = channels.join(",");
        const url = `https://api.vidioo.ir/feed/unauthenticated?channels=${channelIds}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const sortedVideos = data.sort((a, b) => b.viewCount - a.viewCount);

            this.videos = sortedVideos.filter(video => !video.isShort);
            this.shorts = sortedVideos.filter(video => video.isShort);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    },
};
</script>

<template>
    <h1 v-t="'titles.trending'" class="my-4 text-center font-bold" />

    <hr />

    <LoadingIndicatorPage :show-content="videos.length != 0" class="video-grid">
        <VideoItem
            v-for="video in videos"
            :key="video.url"
            :item="video"
            :clamp-title-lines="true"
            height="118"
            width="210"
        />
    </LoadingIndicatorPage>
</template>

<script>
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import VideoItem from "./VideoItem.vue";

export default {
    components: {
        VideoItem,
        LoadingIndicatorPage,
    },
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        if (
            this.$route.path == import.meta.env.BASE_URL &&
            this.getPreferenceString("homepage", "trending") == "feed"
        ) {
            return;
        }
        let region = import.meta.env.VITE_COUNTRY_REGION || "US";

        this.fetchTrending(region).then(videos => {
            // Filter livestreams if they are disabled
            if (this.filterLivestreams) {
                this.videos = this.filterLivestreams(videos);
            } else {
                this.videos = videos;
            }
            this.updateWatched(this.videos);
            this.fetchDeArrowContent(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.trending") + " - " + this.getSiteName();
        if (this.videos.length > 0) this.updateWatched(this.videos);
        if (this.$route.path == import.meta.env.BASE_URL) {
            let homepage = this.getHomePage(this);
            if (homepage !== undefined) this.$router.push(homepage);
        }
    },
    methods: {
        async fetchTrending(region) {
            return await this.fetchJson(this.apiUrl() + "/trending", {
                region: region || "US",
            });
        },
    },
};
</script>

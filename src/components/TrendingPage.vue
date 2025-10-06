<template>
    <div class="page-container py-8">
        <h1 class="mb-6 text-3xl text-main font-bold">{{ $t("titles.trending") }}</h1>

        <LoadingIndicatorPage :show-content="videos.length > 0" class="video-grid">
            <!-- The "card" class on VideoItem's root is the target for our animation -->
            <VideoItem v-for="video in videos" :key="video.url" :item="video" />
        </LoadingIndicatorPage>
    </div>
</template>

<script>
import { nextTick } from "vue";
import { gsap } from "gsap";
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
    watch: {
        videos(newVideos) {
            if (newVideos.length > 0) {
                // Wait for the DOM to be updated with the new items
                nextTick(() => {
                    gsap.from(".video-grid .card", {
                        duration: 0.5,
                        opacity: 0,
                        y: 30,
                        stagger: 0.08,
                        ease: "power3.out",
                    });
                });
            }
        },
    },
    mounted() {
        if (
            this.$route.path === import.meta.env.BASE_URL &&
            this.getPreferenceString("homepage", "trending") === "feed"
        ) {
            return;
        }
        const region = import.meta.env.VITE_COUNTRY_REGION || "US";

        this.fetchTrending(region).then(videos => {
            if (this.getPreferenceBoolean("hideLivestreams", false) && typeof this.filterLivestreams === "function") {
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
        if (this.videos.length > 0) {
            this.updateWatched(this.videos);
        }
        if (this.$route.path === import.meta.env.BASE_URL) {
            const homepage = this.getHomePage(this);
            if (homepage && homepage !== this.$route.path) {
                this.$router.push(homepage);
            }
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
<template>
    <h1 v-t="'titles.feed'" class="my-4 text-center font-bold" />

    <div
        class="flex flex-col flex-wrap gap-2 children:(flex flex-col items-center gap-1 md:flex-row) md:flex-row md:items-center"
    >
        <span class="w-full md:w-auto">
            <label for="filters" class="block md:inline">
                <strong v-text="`${$t('actions.filter')}:`" />
            </label>
            <select
                id="filters"
                v-model="selectedFilter"
                default="all"
                class="select mt-1 w-full flex-grow md:mt-0 md:w-auto"
                @change="onFilterChange()"
            >
                <option v-for="filter in availableFilters" :key="filter" v-t="`video.${filter}`" :value="filter" />
            </select>
        </span>

        <span class="w-full md:w-auto">
            <label for="group-selector" class="block md:inline">
                <strong v-text="`${$t('titles.channel_groups')}:`" />
            </label>
            <select
                id="group-selector"
                v-model="selectedGroupName"
                default=""
                class="select mt-1 w-full flex-grow md:mt-0 md:w-auto"
            >
                <option v-t="`video.all`" value="" />
                <option
                    v-for="group in channelGroups"
                    :key="group.groupName"
                    :value="group.groupName"
                    v-text="group.groupName"
                />
            </select>
        </span>

        <span class="w-full md:mr-auto md:w-auto">
            <SortingSelector
                by-key="uploaded"
                class="mt-1 w-full md:mt-0 md:w-auto"
                @apply="order => videos.sort(order)"
            />
        </span>
    </div>
    <hr />

    <div class="flex flex-wrap justify-center gap-2 md:justify-start">
        <router-link v-t="'titles.subscriptions'" class="btn btn-secondary min-w-[120px] flex-1" to="/subscriptions" />
        <a
            v-if="!isRssFeedDisabled"
            :href="getRssUrl"
            class="btn btn-secondary min-w-[40px] flex items-center justify-center"
        >
            <i class="i-fa6-solid:rss" />
        </a>
    </div>
    <hr />

    <LoadingIndicatorPage :show-content="videosStore != null" class="video-grid">
        <template v-for="video in filteredVideos" :key="video.url">
            <VideoItem
                v-if="shouldShowVideo(video)"
                :is-feed="true"
                :item="video"
                :clamp-title-lines="true"
                @update:watched="onUpdateWatched"
            />
        </template>
    </LoadingIndicatorPage>
</template>

<script>
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";

export default {
    components: {
        VideoItem,
        SortingSelector,
        LoadingIndicatorPage,
    },
    data() {
        return {
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: null,
            videos: [],
            availableFilters: ["all", "shorts", "videos"],
            selectedFilter: "all",
            selectedGroupName: "",
            channelGroups: [],
        };
    },
    computed: {
        getRssUrl(_this) {
            if (_this.authenticated) return _this.authApiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
            else return _this.authApiUrl() + "/feed/unauthenticated/rss?channels=" + _this.getUnauthenticatedChannels();
        },
        isRssFeedDisabled() {
            // Check if RSS feed button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
        },
        filteredVideos(_this) {
            const selectedGroup = _this.channelGroups.filter(group => group.groupName == _this.selectedGroupName);

            const videos = this.getPreferenceBoolean("hideWatched", false)
                ? this.videos.filter(video => !video.watched)
                : this.videos;

            return _this.selectedGroupName == ""
                ? videos
                : videos.filter(video => selectedGroup[0].channels.includes(video.uploaderUrl.substr(-24)));
        },
    },
    mounted() {
        this.fetchFeed().then(resp => {
            if (resp.error) {
                alert(resp.error);
                return;
            }

            this.videosStore = resp;
            // Filter out livestreams if they are disabled
            if (this.isLiveStreamDisabled()) {
                this.videosStore = this.videosStore.filter(video => {
                    // Don't filter out short videos, only livestreams
                    if (video.isShort === true) {
                        return true; // Keep short videos
                    }
                    return !(
                        video.livestream === true ||
                        (video.duration !== undefined && video.duration <= 0) ||
                        (video.duration === undefined && video.isLive === true)
                    );
                });
            }
            this.loadMoreVideos();
            this.updateWatched(this.videos);
        });

        this.selectedFilter = this.getPreferenceString("feedFilter") ?? "all";

        if (!window.db) return;

        this.loadChannelGroups();
    },
    activated() {
        document.title = this.$t("titles.feed") + " - " + this.getSiteName();
        if (this.videos.length > 0) this.updateWatched(this.videos);
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async loadChannelGroups() {
            const groups = await this.getChannelGroups();
            this.channelGroups.push(...groups);
        },
        loadMoreVideos() {
            if (!this.videosStore) return;
            this.currentVideoCount = Math.min(this.currentVideoCount + this.videoStep, this.videosStore.length);
            if (this.videos.length != this.videosStore.length) {
                this.fetchDeArrowContent(this.videosStore.slice(this.videos.length, this.currentVideoCount));
                this.videos = this.videosStore.slice(0, this.currentVideoCount);
            }
        },
        handleScroll() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loadMoreVideos();
            }
        },
        onUpdateWatched(urls = null) {
            if (urls === null) {
                if (this.videos.length > 0) this.updateWatched(this.videos);
                return;
            }

            const subset = this.videos.filter(({ url }) => urls.includes(url));
            if (subset.length > 0) this.updateWatched(subset);
        },
        shouldShowVideo(video) {
            switch (this.selectedFilter.toLowerCase()) {
                case "shorts":
                    return video.isShort;
                case "videos":
                    return !video.isShort;
                default:
                    return true;
            }
        },
        onFilterChange() {
            this.setPreference("feedFilter", this.selectedFilter);
        },
    },
};
</script>

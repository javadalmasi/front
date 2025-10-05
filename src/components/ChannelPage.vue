<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <LoadingIndicatorPage :show-content="channel != null && !channel.error">
        <img
            v-if="channel.bannerUrl"
            loading="lazy"
            :src="channel.bannerUrl"
            class="h-30 w-full object-cover py-1.5 md:h-50"
        />
        <div class="flex flex-col items-center justify-between md:flex-row">
            <div class="flex place-items-center">
                <div class="relative inline-block">
                    <img
                        loading="lazy"
                        :src="channel.avatarUrl"
                        :class="{ 'border-2 border-blue-700': channel.verified, 'rounded-full': true }"
                        class="m-1"
                        width="48"
                        height="48"
                    />
                    <div
                        v-if="channel.verified"
                        class="absolute end-0.5 bottom-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-blue-700"
                    >
                        <i class="i-fa6-solid:check text-[8px] text-white" />
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <h1 class="!text-xl" v-text="channel.name" />
                </div>
            </div>

            <div class="flex gap-2">
                <button :class="subscribed ? 'btn btn-unsubscribe' : 'btn btn-primary'" @click="subscribeHandler">
                    <i v-if="!subscribed" class="i-fa6-solid:bell mr-1.5" />
                    <i v-if="subscribed" class="i-fa6-solid:bell-slash mr-1.5" />
                    {{
                        $t("actions." + (subscribed ? "unsubscribe" : "subscribe")) +
                        " - " +
                        numberFormat(channel.subscriberCount)
                    }}
                </button>

                <button
                    v-if="subscribed"
                    v-t="'actions.add_to_group'"
                    class="btn btn-secondary"
                    @click="showGroupModal = true"
                ></button>

                <!-- RSS Feed button -->
                <a
                    v-if="channel.id && !isRssFeedDisabled"
                    aria-label="RSS feed"
                    title="RSS feed"
                    role="button"
                    :href="`${apiUrl()}/feed/unauthenticated/rss?channels=${channel.id}`"
                    target="_blank"
                    class="btn btn-secondary flex-col"
                >
                    <i class="i-fa6-solid:rss" />
                </a>
            </div>
        </div>

        <CollapsableText :text="channel.description" />

        <WatchOnButton :link="`https://youtube.com/channel/${channel.id}`" />

        <div class="mx-1 my-2 flex">
            <button
                v-for="(tab, index) in tabs"
                :key="tab.name"
                class="btn btn-secondary mr-2"
                :class="{ active: selectedTab == index }"
                @click="loadTab(index)"
            >
                <span v-text="tab.translatedName"></span>
            </button>
            <router-link :to="`/playlist?list=UU${channel.id.substring(2)}`">
                <button class="btn btn-primary mr-2">پخش همه</button>
            </router-link>
        </div>

        <hr />

        <div class="video-grid">
            <ContentItem
                v-for="item in contentItems"
                :key="item.url"
                :item="item"
                height="94"
                width="168"
                hide-channel
            />
        </div>

        <AddToGroupModal v-if="showGroupModal" :channel-id="channel.id.substr(-24)" @close="showGroupModal = false" />
    </LoadingIndicatorPage>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import ContentItem from "./ContentItem.vue";
import WatchOnButton from "./WatchOnButton.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import AddToGroupModal from "./AddToGroupModal.vue";

export default {
    components: {
        ErrorHandler,
        ContentItem,
        WatchOnButton,
        LoadingIndicatorPage,
        CollapsableText,
        AddToGroupModal,
    },
    data() {
        return {
            channel: null,
            subscribed: false,
            tabs: [],
            selectedTab: 0,
            contentItems: [],
            showGroupModal: false,
        };
    },
    computed: {
        isRssFeedDisabled() {
            // Check if RSS feed button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
        },
    },
    mounted() {
        this.getChannelData();
    },
    activated() {
        if (this.channel && !this.channel.error) document.title = this.channel.name + " - " + this.getSiteName();
        window.addEventListener("scroll", this.handleScroll);
        if (this.channel && !this.channel.error) this.updateWatched(this.channel.relatedStreams);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchSubscribedStatus() {
            if (!this.channel.id) return;

            this.subscribed = await this.fetchSubscriptionStatus(this.channel.id);
        },
        async fetchChannel() {
            const url = this.$route.path.includes("@")
                ? this.apiUrl() + "/@/" + this.$route.params.channelId
                : this.apiUrl() + "/" + this.$route.params.path + "/" + this.$route.params.channelId;
            return await this.fetchJson(url);
        },
        async getChannelData() {
            this.fetchChannel()
                .then(data => (this.channel = data))
                .then(() => {
                    if (!this.channel.error) {
                        document.title = this.channel.name + " - " + this.getSiteName();
                        // Filter livestreams if they are disabled
                        if (this.filterLivestreams) {
                            this.channel.relatedStreams = this.filterLivestreams(this.channel.relatedStreams);
                        }
                        this.contentItems = this.channel.relatedStreams;
                        this.fetchSubscribedStatus();
                        this.updateWatched(this.channel.relatedStreams);
                        this.fetchDeArrowContent(this.channel.relatedStreams);
                        this.tabs.push({
                            translatedName: this.$t("video.videos"),
                        });
                        const tabQuery = this.$route.query.tab;
                        for (let i = 0; i < this.channel.tabs.length; i++) {
                            let tab = this.channel.tabs[i];
                            // Skip livestreams tab if livestreams are disabled
                            if (this.isLiveStreamDisabled && tab.name === "livestreams") continue;
                            tab.translatedName = this.getTranslatedTabName(tab.name);
                            this.tabs.push(tab);
                            if (tab.name === tabQuery) this.loadTab(i + 1);
                        }
                    }
                });
        },
        handleScroll() {
            if (
                this.loading ||
                !this.channel ||
                !this.channel.nextpage ||
                (this.selectedTab != 0 && !this.tabs[this.selectedTab].tabNextPage)
            )
                return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                if (this.selectedTab == 0) {
                    this.fetchChannelNextPage();
                } else {
                    this.fetchChannelTabNextPage();
                }
            }
        },
        fetchChannelNextPage() {
            this.fetchJson(this.apiUrl() + "/nextpage/channel/" + this.channel.id, {
                nextpage: this.channel.nextpage,
            }).then(json => {
                this.channel.nextpage = json.nextpage;
                this.loading = false;
                // Filter livestreams if they are disabled
                if (this.filterLivestreams) {
                    json.relatedStreams = this.filterLivestreams(json.relatedStreams);
                }
                this.updateWatched(json.relatedStreams);
                this.contentItems.push(...json.relatedStreams);
                this.fetchDeArrowContent(json.relatedStreams);
            });
        },
        fetchChannelTabNextPage() {
            this.fetchJson(this.apiUrl() + "/channels/tabs", {
                data: this.tabs[this.selectedTab].data,
                nextpage: this.tabs[this.selectedTab].tabNextPage,
            }).then(json => {
                this.tabs[this.selectedTab].tabNextPage = json.nextpage;
                this.loading = false;
                // Filter livestreams if they are disabled
                if (this.filterLivestreams) {
                    json.content = this.filterLivestreams(json.content);
                }
                this.contentItems.push(...json.content);
                this.fetchDeArrowContent(json.content);
                this.tabs[this.selectedTab].content = this.contentItems;
            });
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channel.id, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
        getTranslatedTabName(tabName) {
            let translatedTabName = tabName;
            switch (tabName) {
                case "livestreams":
                    translatedTabName = this.$t("titles.livestreams");
                    break;
                case "playlists":
                    translatedTabName = this.$t("titles.playlists");
                    break;
                case "albums":
                    translatedTabName = this.$t("titles.albums");
                    break;
                case "shorts":
                    translatedTabName = this.$t("video.shorts");
                    break;
                default:
                    console.error(`Tab name "${tabName}" is not translated yet!`);
                    break;
            }
            return translatedTabName;
        },
        loadTab(index) {
            this.selectedTab = index;

            // update the tab query in the url path
            const url = new URL(window.location);
            url.searchParams.set("tab", this.tabs[index].name ?? "videos");
            window.history.replaceState(window.history.state, "", url);

            if (index == 0) {
                this.contentItems = this.channel.relatedStreams;
                return;
            }

            if (this.tabs[index].content) {
                this.contentItems = this.tabs[index].content;
                return;
            }
            this.fetchJson(this.apiUrl() + "/channels/tabs", {
                data: this.tabs[index].data,
            }).then(tab => {
                // Filter livestreams if they are disabled
                if (this.filterLivestreams) {
                    tab.content = this.filterLivestreams(tab.content);
                }
                this.contentItems = this.tabs[index].content = tab.content;
                this.fetchDeArrowContent(tab.content);
                this.tabs[this.selectedTab].tabNextPage = tab.nextpage;
            });
        },
    },
};
</script>

<style>
.active {
    border: 0.1rem outset red;
}
</style>

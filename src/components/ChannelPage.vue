<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <LoadingIndicatorPage :show-content="channel != null && !channel.error">
        <img
            v-if="channel.bannerUrl"
            loading="lazy"
            :src="channel.bannerUrl"
            class="w-full object-cover py-1.5 md:h-50"
        />
        <div class="flex flex-col items-center justify-between md:flex-row">
            <div class="flex place-items-center gap-3">
                <div class="relative inline-block">
                    <img
                        loading="lazy"
                        :src="channel.avatarUrl"
                        :class="{ 'border-2 border-blue-700': channel.verified, 'rounded-full': true }"
                        class="h-48px w-48px"
                        width="48"
                        height="48"
                    />
                    <div
                        v-if="channel.verified"
                        class="absolute end-0 bottom-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-700"
                    >
                        <i class="i-fa6-solid:check text-[10px] text-white" />
                    </div>
                </div>
                <div class="flex items-center">
                    <h1 class="leading-[1.65] !text-xl" v-text="channel.name" />
                </div>
            </div>

            <div class="flex gap-2">
                <button
                    :class="subscribed ? 'btn btn-unsubscribe' : 'btn btn-danger'"
                    @click="subscribeHandler"
                >
                    <i v-if="!subscribed" class="i-fa6-solid:bell mr-1.5" />
                    <i v-if="subscribed" class="i-fa6-solid:bell-slash mr-1.5" />
                    {{
                        $t("actions." + (subscribed ? "unsubscribe" : "subscribe")) +
                        " - " +
                        numberFormat(channel.subscriberCount)
                    }}
                </button>

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

        <div class="channel-tabs-container">
            <div class="channel-tabs-wrapper">
                <button
                    v-for="(tab, index) in tabs"
                    :key="tab.name"
                    class="channel-tab-button"
                    :class="{ 'channel-tab-active': selectedTab == index }"
                    @click="loadTab(index)"
                >
                    <span class="channel-tab-text" v-text="tab.translatedName"></span>
                </button>
            </div>
            <div class="channel-tabs-divider"></div>
        </div>

        <div class="video-grid">
            <ContentItem
                v-for="item in contentItems"
                :key="item.url"
                :item="item"
                :clamp-title-lines="true"
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
        isAddToGroupDisabled() {
            // Check if add to group button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_ADD_TO_GROUP === "true";
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
                        
                        // Add the default videos tab
                        this.tabs.push({
                            name: "videos",
                            translatedName: this.$t("video.videos"),
                            content: this.channel.relatedStreams,
                        });
                        
                        const tabQuery = this.$route.query.tab;
                        for (let i = 0; i < this.channel.tabs.length; i++) {
                            let tab = this.channel.tabs[i];
                            // Skip livestreams tab if livestreams are disabled
                            if (this.isLiveStreamDisabled && tab.name === "livestreams") continue;
                            tab.translatedName = this.getTranslatedTabName(tab.name);
                            this.tabs.push(tab);
                            if (tab.name === tabQuery) {
                                // Wait for the tabs to be fully set up before loading the selected tab
                                this.$nextTick(() => {
                                    this.loadTab(i + 1);
                                });
                            }
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

                // Filter out duplicate items based on URL before adding them
                const newItems = json.relatedStreams.filter(
                    newItem => !this.contentItems.some(existingItem => existingItem.url === newItem.url),
                );

                // Only add items if there are non-duplicate ones
                if (newItems.length > 0) {
                    this.contentItems.push(...newItems);
                }

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

                // Filter out duplicate items based on URL before adding them
                const newItems = json.content.filter(
                    newItem => !this.contentItems.some(existingItem => existingItem.url === newItem.url),
                );

                // Only add items if there are non-duplicate ones
                if (newItems.length > 0) {
                    this.contentItems.push(...newItems);
                }

                this.fetchDeArrowContent(json.content);
                this.tabs[this.selectedTab].content = this.contentItems;
            }).catch(error => {
                this.loading = false;
                console.error('Error loading more tab content:', error);
                // Set empty array if there's an error to prevent endless loading state
                this.contentItems = this.tabs[this.selectedTab].content = [];
            });
        },
        subscribeHandler() {
            // Pass channel data when subscribing so we can store full information
            const channelData = {
                id: this.channel.id,
                name: this.channel.name,
                avatar: this.channel.avatarUrl,
                url: `/channel/${this.channel.id}`
            };
            this.toggleSubscriptionState(this.channel.id, this.subscribed, channelData).then(success => {
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
            
            // Show loading state while fetching tab content
            this.loading = true;
            
            this.fetchJson(this.apiUrl() + "/channels/tabs", {
                data: this.tabs[index].data,
            }).then(tab => {
                this.loading = false;
                // Filter livestreams if they are disabled
                if (this.filterLivestreams) {
                    tab.content = this.filterLivestreams(tab.content);
                }
                this.contentItems = this.tabs[index].content = tab.content;
                this.fetchDeArrowContent(tab.content);
                this.tabs[this.selectedTab].tabNextPage = tab.nextpage;
            }).catch(error => {
                this.loading = false;
                console.error('Error loading tab content:', error);
                // Set empty array if there's an error to prevent endless loading state
                this.contentItems = this.tabs[index].content = [];
            });
        },
    },
};
</script>

<style scoped>
.channel-tabs-container {
    margin: 0.25rem 0.25rem 0.5rem;
    position: relative;
}

.channel-tabs-wrapper {
    display: flex;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none; /* Firefox */
}

.channel-tabs-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.channel-tab-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    margin-right: 4px;
    margin-left: 4px;
    border: none;
    background: transparent;
    color: #000; /* black for light mode */
    font-size: 14px;
    font-weight: 600; /* slightly bolder */
    cursor: pointer;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition:
        color 0.2s,
        border-color 0.2s;
    border-radius: 0;
    text-decoration: underline; /* underline across the entire item */
    text-decoration-color: transparent; /* initially transparent */
    text-underline-offset: 4px; /* spacing between text and underline */
    position: relative;
}

.channel-tab-button::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: var(--hr-color);
    transition: width 0.3s ease;
}

.channel-tab-button:hover::after {
    width: 100%;
}

.channel-tab-active::after {
    width: 100% !important;
    background: #000 !important; /* black for light mode */
}

.dark .channel-tab-active::after {
    background: #fff !important; /* white for dark mode */
}

.channel-tab-button:hover {
    color: #000; /* black for light mode */
    background: transparent;
}

.dark .channel-tab-button {
    color: #fff; /* white for dark mode */
}

.dark .channel-tab-button:hover {
    color: #fff; /* white for dark mode */
}

.channel-tab-active {
    color: #000 !important; /* black for light mode */
    border-bottom: 2px solid transparent !important; /* remove the colored border */
}

.dark .channel-tab-active {
    color: #fff !important; /* white for dark mode */
}

.channel-tab-text {
    font-weight: 600; /* slightly bolder */
}

.channel-tabs-divider {
    height: 1px;
    background: var(--hr-color);
    margin-top: 4px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .channel-tab-button {
        padding: 10px 12px;
        font-size: 13px;
    }
    .channel-tab-text {
        font-size: 13px;
    }
}
</style>
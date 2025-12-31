<template>
    <div class="search-page-container" dir="rtl">
        <!-- Original search results structure -->
        <h1 class="my-2 text-center" v-text="$route.query.search_query" />

        <hr />

        <div v-if="results && results.corrected">
            <i18n-t keypath="search.did_you_mean" tag="div" class="text-lg leading-[1.7]">
                <router-link :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }">
                    <em v-text="results.suggestion" />
                </router-link>
            </i18n-t>
        </div>

        <LoadingIndicatorPage
            :show-content="!!results && !!results.items?.length"
            class="video-grid grid grid-cols-1 gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2"
        >
            <template v-for="result in results.items" :key="result.url">
                <ContentItem :item="result" :clamp-title-lines="true" height="94" width="168" />
            </template>
        </LoadingIndicatorPage>
    </div>
</template>

<script>
import ContentItem from "./ContentItem.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
export default {
    components: {
        ContentItem,
        LoadingIndicatorPage,
    },
    data() {
        return {
            results: null,
            selectedFilter: this.$route.query.filter ?? "videos", // Default to videos
            loadingNextPage: false, // Flag to prevent multiple simultaneous requests
        };
    },
    computed: {
        searchText() {
            return this.$route.query.search_query || "";
        },
    },
    watch: {
        $route(to, from) {
            // Only update results if search query or filter changed
            if (to.query.search_query !== from.query.search_query || to.query.filter !== from.query.filter) {
                this.selectedFilter = to.query.filter ?? "videos";
                this.updateResults();
            }
        },
    },
    mounted() {
        if (this.handleRedirect()) return;
        this.updateResults();
        this.saveQueryToHistory();
    },
    updated() {
        if (this.$route.query.search_query !== undefined) {
            document.title = this.$route.query.search_query + " - " + this.getSiteName();
        }
    },
    activated() {
        this.handleRedirect();
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        getSiteName() {
            return import.meta.env.VITE_SITE_NAME || "vidioo";
        },
        async fetchResults() {
            return await this.fetchJson(this.apiUrl() + "/search", {
                q: this.$route.query.search_query,
                filter: this.selectedFilter,
            });
        },
        async updateResults() {
            if (!this.$route.query.search_query) return;
            document.title = this.$route.query.search_query + " - " + this.getSiteName();
            this.results = await this.fetchResults();
            this.updateWatched(this.results.items);
        },
        updateFilter() {
            this.$router.replace({
                query: {
                    search_query: this.$route.query.search_query,
                    filter: this.selectedFilter,
                },
            });
        },
        handleScroll() {
            if (!this.results || !this.results.nextpage || this.loadingNextPage) return;
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 600) {
                this.loadingNextPage = true; // Set loading flag to prevent multiple simultaneous requests

                const params = {
                    nextpage: this.results.nextpage,
                    q: this.$route.query.search_query,
                    filter: this.selectedFilter,
                };

                this.fetchJson(this.apiUrl() + "/nextpage/search", params)
                    .then(json => {
                        if (json && json.items) {
                            // Filter out duplicate items based on URL before adding them
                            const newItems = json.items.filter(
                                newItem => !this.results.items.some(existingItem => existingItem.url === newItem.url),
                            );

                            // Only add items if there are non-duplicate ones
                            if (newItems.length > 0) {
                                newItems.forEach(item => this.results.items.push(item));
                            }

                            this.results.nextpage = json.nextpage;
                        } else {
                            this.results.nextpage = null;
                        }
                    })
                    .finally(() => {
                        this.loadingNextPage = false; // Reset loading flag after request completes
                    });
            }
        },
        handleRedirect() {
            const query = this.$route.query.search_query;
            const url =
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm.exec(query)?.[1] ??
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm
                    .exec(query)?.[1]
                    .replace(/^/, "/watch?v=");
            if (url) {
                this.$router.push(url);
                return true;
            }
        },
        saveQueryToHistory() {
            if (!this.getPreferenceBoolean("searchHistory", true)) return;
            const query = this.$route.query.search_query;
            if (!query) return;
            this.addToSearchHistory(query);
        },
        addToSearchHistory(query) {
            try {
                let searchHistory = this.getSearchHistory();
                // Remove the query if it already exists to avoid duplicates
                searchHistory = searchHistory.filter(item => item.query !== query);
                // Add the query to the beginning of the array with timestamp
                const newSearchItem = {
                    query: query,
                    timestamp: new Date().toISOString()
                };
                searchHistory.unshift(newSearchItem);

                // Apply auto-delete based on user preferences
                searchHistory = this.applyAutoDeleteToSearchHistory(searchHistory);

                localStorage.setItem("search_history", JSON.stringify(searchHistory));
            } catch (error) {
                console.error("Error adding to search history:", error);
            }
        },
        getSearchHistory() {
            try {
                const history = localStorage.getItem("search_history");
                const parsedHistory = history ? JSON.parse(history) : [];

                // If the history is in the old format (just strings), convert it to the new format
                if (parsedHistory.length > 0 && typeof parsedHistory[0] === 'string') {
                    return parsedHistory.map(query => ({
                        query: query,
                        timestamp: new Date().toISOString() // Use current timestamp for old entries
                    }));
                }

                return parsedHistory;
            } catch {
                return [];
            }
        },
        applyAutoDeleteToSearchHistory(searchHistory) {
            try {
                // Apply time-based deletion based on user preferences
                const autoDeleteEnabled = this.getPreferenceBoolean("autoDeleteSearchHistory", false);
                if (autoDeleteEnabled) {
                    const delayHours = this.getPreferenceNumber("autoDeleteSearchHistoryDelayHours", 24);
                    const maxTimeDiff = delayHours * 60 * 60 * 1000;

                    searchHistory = searchHistory.filter(item => {
                        const itemTime = new Date(item.timestamp).getTime();
                        return Date.now() - itemTime <= maxTimeDiff;
                    });
                }

                // Apply count-based deletion based on user preferences
                const maxCount = this.getPreferenceNumber("autoDeleteSearchHistoryMaxCount", 50);
                if (searchHistory.length > maxCount) {
                    // Keep only the most recent items up to the max count
                    searchHistory = searchHistory.slice(0, maxCount);
                }

                return searchHistory;
            } catch (error) {
                console.error("Error applying auto-delete to search history:", error);
                return searchHistory; // Return original if error occurs
            }
        },
    },
};
</script>

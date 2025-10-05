<template>
    <div class="search-page-container">
        <div class="search-input-container mb-8 flex flex-col items-center">
            <div class="logo-container mb-8">
                <h1 class="font-logo text-6xl font-bold">ویدیو</h1>
            </div>
            <div class="search-controls-container max-w-2xl w-full flex items-center gap-2">
                <select
                    id="ddlSearchFilters"
                    v-model="selectedFilter"
                    default="videos"
                    class="select h-10 border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                    @change="updateFilter()"
                >
                    <option v-for="filter in availableFilters" :key="filter" v-t="`search.${filter}`" :value="filter" />
                </select>
                <div class="search-container relative flex-1">
                    <input
                        ref="searchInput"
                        v-model="searchQueryText"
                        class="input h-10 w-full border border-gray-300 rounded-full px-4 pr-10 shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        role="search"
                        :title="$t('actions.search')"
                        :placeholder="'برای جستجو تایپ کنید و اینتر بزنید'"
                        @blur="onInputBlur"
                        @focus="onInputFocus"
                        @keypress="onKeyPress"
                        @keyup="onKeyUp"
                    />
                    <span
                        v-if="searchQueryText"
                        class="delete-search absolute right-3 top-1/2 h-6 w-6 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                        @click="searchQueryText = ''"
                    >
                        ×
                    </span>
                </div>
                <button
                    id="search-submit-btn"
                    class="btn h-10 flex items-center justify-center rounded-lg bg-gray-100 px-4 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
                    @click="submitSearch"
                >
                    <div class="i-fa6-solid:magnifying-glass text-sm" />
                </button>
            </div>
            <div class="relative mt-1 max-w-2xl w-full">
                <SearchSuggestions
                    v-show="(searchQueryText || showSearchHistory) && suggestionsVisible"
                    ref="searchSuggestions"
                    :search-text="searchQueryText"
                    @searchchange="onSearchTextChange"
                />
            </div>
        </div>

        <!-- Advanced Filters Section -->
        <div class="advanced-filters-container mx-auto mb-6 max-w-2xl w-full">
            <div class="filters-grid grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
                <!-- Duration Filter -->
                <div class="filter-group">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
                        {{ $t("search.duration") }}
                    </label>
                    <select
                        v-model="durationFilter"
                        class="select h-10 w-full border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        @change="applyAdvancedFilters"
                    >
                        <option value="">{{ $t("search.any_duration") }}</option>
                        <option value="short">{{ $t("search.short_videos") }} (&lt; 4 دقیقه)</option>
                        <option value="under_5">{{ $t("search.under_5_minutes") }}</option>
                        <option value="under_10">{{ $t("search.under_10_minutes") }}</option>
                        <option value="under_20">{{ $t("search.under_20_minutes") }}</option>
                        <option value="under_30">{{ $t("search.under_30_minutes") }}</option>
                        <option value="under_40">{{ $t("search.under_40_minutes") }}</option>
                        <option value="under_50">{{ $t("search.under_50_minutes") }}</option>
                        <option value="under_60">{{ $t("search.under_1_hour") }}</option>
                        <option value="under_120">{{ $t("search.under_2_hours") }}</option>
                        <option value="long">{{ $t("search.long_videos") }} (&gt; 2 ساعت)</option>
                    </select>
                </div>

                <!-- View Count Sorting Filter -->
                <div class="filter-group">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
                        {{ $t("search.view_count_sort") }}
                    </label>
                    <select
                        v-model="viewCountSortFilter"
                        class="select h-10 w-full border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        @change="applyAdvancedFilters"
                    >
                        <option value="">{{ $t("search.no_sort") }}</option>
                        <option value="most_viewed">{{ $t("search.most_viewed") }}</option>
                        <option value="least_viewed">{{ $t("search.least_viewed") }}</option>
                    </select>
                </div>

                <!-- Upload Date Sorting Filter -->
                <div class="filter-group">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
                        {{ $t("search.upload_date_sort") }}
                    </label>
                    <select
                        v-model="uploadDateSortFilter"
                        class="select h-10 w-full border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        @change="applyAdvancedFilters"
                    >
                        <option value="">{{ $t("search.no_sort") }}</option>
                        <option value="newest_first">{{ $t("search.newest_first") }}</option>
                        <option value="oldest_first">{{ $t("search.oldest_first") }}</option>
                    </select>
                </div>

                <!-- Combined View Count Sorting Filter -->
                <div class="filter-group">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
                        {{ $t("search.view_count_combined") }}
                    </label>
                    <select
                        v-model="combinedViewCountSortFilter"
                        class="select h-10 w-full border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        @change="applyAdvancedFilters"
                    >
                        <option value="">{{ $t("search.no_sort") }}</option>
                        <option value="highest_views">{{ $t("search.highest_views") }}</option>
                        <option value="lowest_views">{{ $t("search.lowest_views") }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div v-if="results && results.corrected" class="mb-4 text-center">
            <i18n-t keypath="search.did_you_mean" tag="div" class="text-base text-gray-600 dark:text-gray-400">
                <router-link
                    :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }"
                    class="text-blue-500 hover:underline"
                >
                    <em v-text="results.suggestion" />
                </router-link>
            </i18n-t>
        </div>

        <div class="mx-auto max-w-2xl">
            <LoadingIndicatorPage
                :show-content="results != null && results.items?.length"
                class="video-grid grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2"
            >
                <template v-for="result in results.items" :key="result.url">
                    <ContentItem :item="result" height="94" width="168" />
                </template>
            </LoadingIndicatorPage>
        </div>
    </div>
</template>

<script>
import ContentItem from "./ContentItem.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import SearchSuggestions from "./SearchSuggestions.vue";

export default {
    components: {
        ContentItem,
        LoadingIndicatorPage,
        SearchSuggestions,
    },
    data() {
        return {
            results: null,
            searchQueryText: "",
            suggestionsVisible: false,
            availableFilters: [
                "all",
                "videos",
                "channels",
                "playlists",
                "music_songs",
                "music_videos",
                "music_albums",
                "music_playlists",
                "music_artists",
            ],
            selectedFilter: this.$route.query.filter ?? "videos",
            // Advanced filters
            durationFilter: this.$route.query.duration ?? "",
            viewCountSortFilter: this.$route.query.view_count_sort ?? "",
            uploadDateSortFilter: this.$route.query.upload_date_sort ?? "",
            combinedViewCountSortFilter: this.$route.query.combined_view_count_sort ?? "",
        };
    },
    computed: {
        showSearchHistory() {
            return this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
        },
    },
    watch: {
        $route(to, from) {
            if (to.query.search_query !== from.query.search_query) {
                this.updateSearchTextFromURL();
                this.updateResults();
            }
            if (to.query.filter !== from.query.filter) {
                this.selectedFilter = to.query.filter ?? "videos";
            }
            if (to.query.duration !== from.query.duration) {
                this.durationFilter = to.query.duration ?? "";
            }
            if (to.query.view_count_sort !== from.query.view_count_sort) {
                this.viewCountSortFilter = to.query.view_count_sort ?? "";
            }
            if (to.query.upload_date_sort !== from.query.upload_date_sort) {
                this.uploadDateSortFilter = to.query.upload_date_sort ?? "";
            }
            if (to.query.combined_view_count_sort !== from.query.combined_view_count_sort) {
                this.combinedViewCountSortFilter = to.query.combined_view_count_sort ?? "";
            }
        },
    },
    mounted() {
        if (this.handleRedirect()) return;
        this.updateSearchTextFromURL();
        this.initializeAdvancedFilters();
        this.updateResults();
        this.saveQueryToHistory();
    },
    updated() {
        const query = this.searchQueryText || this.$route.query.search_query;
        if (query !== undefined) {
            document.title = query + " - " + this.getSiteName();
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
        async fetchResults() {
            const params = {
                q: this.searchQueryText || this.$route.query.search_query,
                filter: this.selectedFilter,
            };

            // Add advanced filter parameters if they are set
            if (this.durationFilter) params.duration = this.durationFilter;
            if (this.viewCountSortFilter) params.view_count_sort = this.viewCountSortFilter;
            if (this.uploadDateSortFilter) params.upload_date_sort = this.uploadDateSortFilter;
            if (this.combinedViewCountSortFilter) params.combined_view_count_sort = this.combinedViewCountSortFilter;

            return await await this.fetchJson(this.apiUrl() + "/search", params);
        },
        async updateResults() {
            const query = this.searchQueryText || this.$route.query.search_query;
            document.title = query + " - " + this.getSiteName();
            const json = await this.fetchResults();
            this.results = json;
            // Filter out livestreams if they are disabled
            if (this.filterLivestreams) {
                this.results.items = this.filterLivestreams(this.results.items);
            }
            this.updateWatched(this.results.items);
        },
        applyAdvancedFilters() {
            // Update the route with advanced filter parameters
            this.$router.replace({
                query: {
                    search_query: this.searchQueryText || this.$route.query.search_query,
                    filter: this.selectedFilter,
                    ...(this.durationFilter && { duration: this.durationFilter }),
                    ...(this.viewCountSortFilter && { view_count_sort: this.viewCountSortFilter }),
                    ...(this.uploadDateSortFilter && { upload_date_sort: this.uploadDateSortFilter }),
                    ...(this.combinedViewCountSortFilter && {
                        combined_view_count_sort: this.combinedViewCountSortFilter,
                    }),
                },
            });
        },
        updateFilter() {
            this.$router.replace({
                query: {
                    search_query: this.searchQueryText || this.$route.query.search_query,
                    filter: this.selectedFilter,
                    ...(this.durationFilter && { duration: this.durationFilter }),
                    ...(this.viewCountSortFilter && { view_count_sort: this.viewCountSortFilter }),
                    ...(this.uploadDateSortFilter && { upload_date_sort: this.uploadDateSortFilter }),
                    ...(this.combinedViewCountSortFilter && {
                        combined_view_count_sort: this.combinedViewCountSortFilter,
                    }),
                },
            });
        },
        handleScroll() {
            // Check if any filter is active
            const isFilterActive =
                this.durationFilter ||
                this.viewCountSortFilter ||
                this.uploadDateSortFilter ||
                this.combinedViewCountSortFilter;

            if (this.loading || !this.results || !this.results.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                const params = {
                    nextpage: this.results.nextpage,
                    q: this.searchQueryText || this.$route.query.search_query,
                    filter: this.selectedFilter,
                };

                // Add advanced filter parameters if they are set
                if (this.durationFilter) params.duration = this.durationFilter;
                if (this.viewCountSortFilter) params.view_count_sort = this.viewCountSortFilter;
                if (this.uploadDateSortFilter) params.upload_date_sort = this.uploadDateSortFilter;
                if (this.combinedViewCountSortFilter)
                    params.combined_view_count_sort = this.combinedViewCountSortFilter;

                this.fetchJson(this.apiUrl() + "/nextpage/search", params).then(json => {
                    this.results.nextpage = json.nextpage;
                    this.results.id = json.id;
                    this.loading = false;
                    // Filter livestreams from the new items before adding them
                    const filteredItems = this.filterLivestreams ? this.filterLivestreams(json.items) : json.items;
                    filteredItems.map(stream => this.results.items.push(stream));

                    // If a filter is active, automatically load the next 5 pages
                    if (isFilterActive) {
                        this.loadNextPages(5);
                    }
                });
            }
        },
        async loadNextPages(pageCount) {
            // Load the next specified number of pages automatically
            for (let i = 0; i < pageCount && this.results && this.results.nextpage; i++) {
                if (this.loading) break;

                this.loading = true;
                const params = {
                    nextpage: this.results.nextpage,
                    q: this.searchQueryText || this.$route.query.search_query,
                    filter: this.selectedFilter,
                };

                // Add advanced filter parameters if they are set
                if (this.durationFilter) params.duration = this.durationFilter;
                if (this.viewCountSortFilter) params.view_count_sort = this.viewCountSortFilter;
                if (this.uploadDateSortFilter) params.upload_date_sort = this.uploadDateSortFilter;
                if (this.combinedViewCountSortFilter)
                    params.combined_view_count_sort = this.combinedViewCountSortFilter;

                try {
                    const json = await this.fetchJson(this.apiUrl() + "/nextpage/search", params);
                    this.results.nextpage = json.nextpage;
                    this.results.id = json.id;
                    // Filter livestreams from the new items before adding them
                    const filteredItems = this.filterLivestreams ? this.filterLivestreams(json.items) : json.items;
                    filteredItems.map(stream => this.results.items.push(stream));
                } catch (error) {
                    console.error("Error loading next page:", error);
                    break;
                } finally {
                    this.loading = false;
                }
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
            if (!this.getPreferenceBoolean("searchHistory", false)) return;
            const query = this.$route.query.search_query;
            if (!query) return;
            const searchHistory = JSON.parse(localStorage.getItem("search_history")) ?? [];
            if (searchHistory.includes(query)) {
                const index = searchHistory.indexOf(query);
                searchHistory.splice(index, 1);
            }
            searchHistory.unshift(query);
            if (searchHistory.length > 10) searchHistory.shift();
            localStorage.setItem("search_history", JSON.stringify(searchHistory));
        },
        onInputFocus() {
            if (this.showSearchHistory) this.$refs.searchSuggestions.refreshSuggestions();
            this.suggestionsVisible = true;
        },
        onInputBlur() {
            setTimeout(() => (this.suggestionsVisible = false), 200);
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch(e);
            }
        },
        onKeyUp(e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            this.$refs.searchSuggestions.onKeyUp(e);
        },
        onSearchTextChange(searchText) {
            this.searchQueryText = searchText;
            // Don't automatically submit search when a suggestion is clicked
            // User must press Enter or click search button to initiate search
        },
        initializeAdvancedFilters() {
            // Initialize advanced filters from URL parameters
            this.durationFilter = this.$route.query.duration ?? "";
            this.viewCountSortFilter = this.$route.query.view_count_sort ?? "";
            this.uploadDateSortFilter = this.$route.query.upload_date_sort ?? "";
            this.combinedViewCountSortFilter = this.$route.query.combined_view_count_sort ?? "";
        },
        submitSearch(e) {
            if (e) e.target.blur();
            if (this.searchQueryText) {
                const queryParams = {
                    search_query: this.searchQueryText,
                    filter: this.selectedFilter,
                };

                // Add advanced filter parameters if they are set
                if (this.durationFilter) queryParams.duration = this.durationFilter;
                if (this.viewCountSortFilter) queryParams.view_count_sort = this.viewCountSortFilter;
                if (this.uploadDateSortFilter) queryParams.upload_date_sort = this.uploadDateSortFilter;
                if (this.combinedViewCountSortFilter)
                    queryParams.combined_view_count_sort = this.combinedViewCountSortFilter;

                this.$router.push({
                    name: "SearchResults",
                    query: queryParams,
                });
                this.suggestionsVisible = false;
            } else {
                this.$router.push("/");
            }
        },
        updateSearchTextFromURL() {
            const query = this.$route.query.search_query;
            if (query) {
                this.searchQueryText = query;
            }
        },
    },
};
</script>

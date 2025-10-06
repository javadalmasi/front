<template>
    <div class="search-page-container" dir="rtl">
        <!-- Search Input -->
        <div class="search-input-container mb-8 flex flex-col items-center px-4">
            <div class="search-controls-container max-w-3xl w-full flex items-center gap-2">
                <select
                    id="ddlSearchFilters"
                    v-model="selectedFilter"
                    class="select h-12 border border-gray-300 rounded-md bg-white px-3 text-base dark:border-dark-200 dark:bg-dark-600"
                >
                    <option v-for="filter in availableFilters" :key="filter" v-t="`search.${filter}`" :value="filter" />
                </select>
                <div class="search-container relative flex-1">
                    <input
                        ref="searchInput"
                        v-model="searchQueryText"
                        class="input h-12 w-full border border-gray-300 rounded-full px-5 pr-12 text-lg shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        class="delete-search absolute right-4 top-1/2 h-7 w-7 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                        @click="searchQueryText = ''"
                    >
                        ×
                    </span>
                </div>
                <button
                    class="btn h-12 flex items-center justify-center rounded-lg bg-gray-100 px-5 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
                    @click="submitSearch"
                >
                    <div class="i-fa6-solid:magnifying-glass text-base" />
                </button>
            </div>
            <div class="relative mt-1 max-w-3xl w-full">
                <SearchSuggestions
                    v-show="(searchQueryText || showSearchHistory) && suggestionsVisible"
                    ref="searchSuggestions"
                    :search-text="searchQueryText"
                    @searchchange="onSearchTextChange"
                />
            </div>
        </div>

        <!-- Sticky Filter Bar -->
        <div
            v-if="selectedFilter === 'videos'"
            class="filters-container sticky top-0 z-10 mb-6 bg-white p-4 shadow-md dark:bg-dark-800"
        >
            <div class="mx-auto max-w-6xl">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <!-- Time Filter -->
                    <select
                        v-model="filters.date"
                        class="select h-10 border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                    >
                        <option value="all">{{ $t("search.any_time") }}</option>
                        <option value="today">{{ $t("search.today") }}</option>
                        <option value="this_week">{{ $t("search.this_week") }}</option>
                        <option value="this_month">{{ $t("search.this_month") }}</option>
                        <option value="this_year">{{ $t("search.this_year") }}</option>
                    </select>

                    <!-- Sort By Filter -->
                    <select
                        v-model="filters.sort_by"
                        class="select h-10 border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        data-testid="sort-by-filter"
                    >
                        <option value="any">{{ $t("search.no_sort") }}</option>
                        <option value="most_viewed">{{ $t("search.most_viewed") }}</option>
                        <option value="least_viewed">{{ $t("search.least_viewed") }}</option>
                        <option value="longest">{{ $t("search.longest") }}</option>
                        <option value="shortest">{{ $t("search.shortest") }}</option>
                    </select>

                    <!-- Content Type Filter -->
                    <select
                        v-model="filters.type"
                        class="select h-10 border border-gray-300 rounded-md bg-white px-3 text-sm dark:border-dark-200 dark:bg-dark-600"
                        data-testid="content-type-filter"
                    >
                        <option value="all">{{ $t("search.all_types") }}</option>
                        <option value="video">{{ $t("search.videos") }}</option>
                        <option value="shorts">{{ $t("search.shorts") }}</option>
                    </select>

                    <!-- Advanced Search -->
                    <div class="relative">
                        <button
                            class="btn h-10 w-full flex items-center justify-center rounded-lg bg-gray-100 px-4 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
                            @click="advancedFilterVisible = !advancedFilterVisible"
                        >
                            {{ $t("search.advanced_search") }}
                        </button>
                        <div
                            v-if="advancedFilterVisible"
                            class="absolute z-20 mt-2 w-full rounded-md bg-white p-4 shadow-lg dark:bg-dark-700"
                        >
                            <label class="flex items-center space-x-2">
                                <input v-model="filters.uploaderVerified" type="checkbox" class="checkbox" />
                                <span>{{ $t("search.verified_uploader_only") }}</span>
                            </label>
                            <label class="mt-2 flex items-center space-x-2">
                                <input v-model="filters.shortDescription" type="checkbox" class="checkbox" />
                                <span>{{ $t("search.with_description_only") }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Results -->
        <div class="mx-auto max-w-6xl px-4">
            <LoadingIndicatorPage
                :show-content="!loading && filteredResults.length > 0"
                class="video-grid grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2"
            >
                <template v-for="result in filteredResults" :key="result.url">
                    <ContentItem :item="result" height="94" width="168" />
                </template>
            </LoadingIndicatorPage>

            <div v-if="loading" class="py-10 text-center">
                <p>{{ $t("actions.loading") }}</p>
            </div>

            <div v-if="!loading && filteredResults.length === 0 && rawResults.length > 0" class="py-10 text-center">
                <p>هیچ نتیجه‌ای با فیلترهای انتخابی یافت نشد.</p>
            </div>

            <div v-if="!loading && rawResults.length === 0 && searchQueryText" class="py-10 text-center">
                <p>هیچ نتیجه‌ای برای جستجوی شما یافت نشد.</p>
            </div>
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
    beforeRouteLeave(to, from, next) {
        // Clear search query only when navigating away from the search page
        if (to.name !== "SearchResults") {
            this.searchQueryText = "";
        }
        next();
    },
    data() {
        return {
            searchQueryText: "",
            rawResults: [],
            nextPage: null,
            loading: false,
            advancedFilterVisible: false,
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
            ],
            selectedFilter: this.$route.query.filter ?? "videos",
            filters: {
                date: "all",
                sort_by: "any",
                type: "all",
                uploaderVerified: false,
                shortDescription: false,
            },
            isFilterActive: false,
        };
    },
    computed: {
        showSearchHistory() {
            return this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
        },
        filteredResults() {
            if (!this.isFilterActive) {
                return this.rawResults;
            }

            let results = [...this.rawResults];

            // Date filter
            if (this.filters.date !== "all") {
                const now = new Date();
                results = results.filter(item => {
                    if (typeof item.uploaded !== "number") return false;
                    const uploaded = new Date(item.uploaded * 1000);
                    switch (this.filters.date) {
                        case "today":
                            return uploaded.toDateString() === now.toDateString();
                        case "this_week": {
                            const oneWeekAgo = new Date();
                            oneWeekAgo.setDate(now.getDate() - 7);
                            return uploaded >= oneWeekAgo;
                        }
                        case "this_month":
                            return (
                                uploaded.getMonth() === now.getMonth() && uploaded.getFullYear() === now.getFullYear()
                            );
                        case "this_year":
                            return uploaded.getFullYear() === now.getFullYear();
                        default:
                            return true;
                    }
                });
            }

            // Content Type filter
            if (this.filters.type !== "all") {
                results = results.filter(item => {
                    if (this.filters.type === "video") return !item.isShort;
                    if (this.filters.type === "shorts") return item.isShort;
                    return true;
                });
            }

            // Verified uploader filter
            if (this.filters.uploaderVerified) {
                results = results.filter(item => item.uploaderVerified);
            }

            // Description filter
            if (this.filters.shortDescription) {
                results = results.filter(item => item.shortDescription);
            }

            // Sorting logic
            if (this.filters.sort_by === "most_viewed") {
                results.sort((a, b) => (b.views || 0) - (a.views || 0));
            } else if (this.filters.sort_by === "least_viewed") {
                results.sort((a, b) => (a.views || 0) - (b.views || 0));
            } else if (this.filters.sort_by === "longest") {
                results = results.filter(item => item.duration > 0);
                results.sort((a, b) => (b.duration || 0) - (a.duration || 0));
            } else if (this.filters.sort_by === "shortest") {
                results = results.filter(item => item.duration > 0);
                results.sort((a, b) => (a.duration || 0) - (b.duration || 0));
            }

            return results;
        },
    },
    watch: {
        "$route.query": {
            handler(to, from) {
                from = from || {}; // handle initial load where from is undefined
                const newQuery = to.search_query;
                const oldQuery = from.search_query;
                const newFilter = to.filter;
                const oldFilter = from.filter;

                if (newQuery !== oldQuery || newFilter !== oldFilter) {
                    this.searchQueryText = newQuery || "";
                    this.selectedFilter = newFilter || "videos";
                    this.applyFiltersAndSearch();
                }
            },
            immediate: true,
        },
        filters: {
            handler() {
                this.applyFiltersAndSearch();
            },
            deep: true,
        },
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    activated() {
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        handleScroll() {
            // Infinite scroll should only work when no filters are active
            if (this.isFilterActive || this.loading || !this.nextPage) return;

            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                const params = {
                    nextpage: this.nextPage,
                    q: this.searchQueryText,
                    filter: this.selectedFilter,
                };

                this.fetchJson(this.apiUrl() + "/nextpage/search", params).then(json => {
                    if (json && json.items) {
                        this.rawResults.push(...json.items);
                        this.nextPage = json.nextpage;
                        this.updateWatched(json.items);
                    } else {
                        this.nextPage = null;
                    }
                    this.loading = false;
                });
            }
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
            if (this.$refs.searchSuggestions) this.$refs.searchSuggestions.onKeyUp(e);
        },
        onSearchTextChange(searchText) {
            this.searchQueryText = searchText;
        },
        submitSearch() {
            if (this.searchQueryText.trim()) {
                if (
                    this.searchQueryText === this.$route.query.search_query &&
                    this.selectedFilter === this.$route.query.filter
                )
                    return;

                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchQueryText, filter: this.selectedFilter },
                });
            }
        },
        checkIfFilterIsActive() {
            this.isFilterActive =
                this.filters.date !== "all" ||
                this.filters.sort_by !== "any" ||
                this.filters.type !== "all" ||
                this.filters.uploaderVerified ||
                this.filters.shortDescription;
        },
        async applyFiltersAndSearch() {
            if (!this.searchQueryText) return;

            this.loading = true;
            this.rawResults = [];
            this.nextPage = null;

            // Step 1: Fetch the initial page of results
            const params = { q: this.searchQueryText, filter: this.selectedFilter };
            const initialJson = await this.fetchJson(this.apiUrl() + "/search", params);

            if (initialJson && initialJson.items) {
                this.rawResults.push(...initialJson.items);
                this.nextPage = initialJson.nextpage;
                this.updateWatched(initialJson.items);
            } else {
                this.loading = false;
                return;
            }

            // Step 2: If filters are active, fetch more pages
            this.checkIfFilterIsActive();
            if (this.isFilterActive && this.selectedFilter === "videos") {
                for (let i = 0; i < 5; i++) {
                    if (!this.nextPage) break;
                    const nextPageParams = {
                        nextpage: this.nextPage,
                        q: this.searchQueryText,
                        filter: this.selectedFilter,
                    };
                    try {
                        const nextJson = await this.fetchJson(this.apiUrl() + "/nextpage/search", nextPageParams);
                        if (nextJson && nextJson.items) {
                            this.rawResults.push(...nextJson.items);
                            this.nextPage = nextJson.nextpage;
                            this.updateWatched(nextJson.items);
                        } else {
                            this.nextPage = null;
                        }
                    } catch (error) {
                        console.error("Error fetching next page:", error);
                        this.nextPage = null;
                    }
                }
            }

            this.loading = false;
        },
    },
};
</script>
<style scoped>
.filters-container {
    border-bottom: 1px solid var(--border-color, #e5e7eb);
}
.dark .filters-container {
    border-bottom: 1px solid var(--border-color, #374151);
}
</style>

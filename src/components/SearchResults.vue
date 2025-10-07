<template>
    <div class="search-page-container" dir="rtl">
        <!-- Search Input - With filter dropdown above on mobile -->
        <div
            class="search-input-container my-8 flex flex-col items-center border border-gray-200 rounded-xl bg-white p-6 shadow-md dark:border-dark-300 dark:bg-dark-700 dark:shadow-dark"
        >
            <div class="search-controls-container w-full flex flex-col gap-2 md:flex-row md:items-center">
                <select
                    id="ddlSearchFilters"
                    v-model="selectedFilter"
                    class="select mb-2 h-12 w-full border border-gray-300 rounded-md bg-white px-3 text-base leading-[1.65] md:mb-0 md:mr-2 md:w-auto dark:border-dark-200 dark:bg-dark-600"
                    @change="updateFilter()"
                >
                    <option v-for="filter in availableFilters" :key="filter" v-t="`search.${filter}`" :value="filter" />
                </select>
                <div class="search-container relative w-full flex-1 md:w-auto">
                    <input
                        ref="searchInput"
                        v-model="searchQueryText"
                        class="input h-12 w-full border border-gray-300 rounded-md px-5 pr-12 text-lg leading-[1.7] shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    class="btn mt-2 h-12 flex items-center justify-center rounded-lg bg-gray-100 px-5 md:mt-0 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
                    @click="submitSearch"
                >
                    <div class="i-fa6-solid:magnifying-glass text-base leading-[1.65]" />
                </button>
            </div>
            <div class="relative mt-1 w-full">
                <SearchSuggestions
                    v-show="(searchQueryText || showSearchHistory) && suggestionsVisible"
                    ref="searchSuggestions"
                    :search-text="searchQueryText"
                    :limit="5"
                    @searchchange="onSearchTextChange"
                />
            </div>
        </div>

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
            :show-content="results != null && results.items?.length"
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
            selectedFilter: this.$route.query.filter ?? "videos", // Default to videos
            searchQueryText: this.$route.query.search_query ?? "",
            suggestionsVisible: false,
        };
    },
    mounted() {
        this.searchQueryText = this.$route.query.search_query ?? "";
        if (this.handleRedirect()) return;
        this.updateResults();
        this.saveQueryToHistory();
    },
    updated() {
        if (this.$route.query.search_query !== undefined) {
            document.title = this.$route.query.search_query + " - Piped";
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
            return await this.fetchJson(this.apiUrl() + "/search", {
                q: this.$route.query.search_query,
                filter: this.selectedFilter,
            });
        },
        async updateResults() {
            if (!this.$route.query.search_query) return;
            document.title = this.$route.query.search_query + " - Piped";
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
            if (!this.results || !this.results.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 600) {
                const params = {
                    nextpage: this.results.nextpage,
                    q: this.$route.query.search_query,
                    filter: this.selectedFilter,
                };

                this.fetchJson(this.apiUrl() + "/nextpage/search", params).then(json => {
                    if (json && json.items) {
                        json.items.forEach(item => this.results.items.push(item));
                        this.results.nextpage = json.nextpage;
                    } else {
                        this.results.nextpage = null;
                    }
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
        },
        onSearchTextChange(searchText) {
            this.searchQueryText = searchText;
        },
        submitSearch() {
            if (this.searchQueryText.trim()) {
                if (this.searchQueryText === this.$route.query.search_query) return;

                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchQueryText, filter: this.selectedFilter },
                });
            }
        },
    },
};
</script>

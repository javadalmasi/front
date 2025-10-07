<template>
    <nav
        class="sticky top-0 z-70 h-16 w-full border-b border-gray-200 bg-gray-50 dark:border-dark-100 dark:bg-dark-800"
    >
        <div class="mx-auto h-full flex items-center justify-between px-2 sm:px-4">
            <!-- Left side: Menu button and Logo -->
            <div class="flex items-center">
                <button
                    class="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Toggle sidebar"
                    @click="toggleSidebar"
                >
                    <div class="i-fa6-solid:bars text-lg leading-[1.7]" />
                </button>
                <router-link
                    class="ml-4 flex items-center text-3xl font-bold leading-[1.45] font-sans"
                    :to="homePagePath"
                >
                    <img :src="logoSrc" alt="logo" height="32" width="32" class="bold w-10" />
                    <span class="hidden sm:inline">ویدیو</span>
                </router-link>
            </div>

            <!-- Search container that appears when clicking search button or when on search results page -->
            <div v-if="showSearchBox || isOnSearchResultsPage" class="flex flex-1 justify-center px-4">
                <div class="search-controls-container max-w-3xl w-full flex flex-col gap-2 md:flex-row md:items-center">
                    <select
                        id="ddlSearchFilters"
                        v-model="selectedFilter"
                        class="select mb-2 h-12 w-full border border-gray-300 rounded-md bg-white px-3 text-base leading-[1.65] md:mb-0 md:mr-2 md:w-auto dark:border-dark-200 dark:bg-dark-600"
                        @change="updateFilter()"
                    >
                        <option
                            v-for="filter in availableFilters"
                            :key="filter"
                            v-t="`search.${filter}`"
                            :value="filter"
                        />
                    </select>
                    <div class="search-container relative w-full flex-1 md:w-auto">
                        <input
                            ref="searchInput"
                            v-model="searchText"
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
                            v-if="searchText"
                            class="delete-search absolute right-4 top-1/2 h-7 w-7 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                            @click="searchText = ''"
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
                <SearchSuggestions
                    ref="searchSuggestions"
                    :search-text="searchText"
                    :limit="5"
                    @searchchange="onSearchTextChange"
                />
            </div>

            <!-- Right side: User actions -->
            <div v-else class="flex items-center">
                <!-- Search button -->
                <button
                    class="ml-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Search"
                    @click="showSearchBox = true"
                >
                    <div class="i-fa6-solid:magnifying-glass text-lg leading-[1.7]" />
                </button>
            </div>
        </div>
    </nav>
</template>

<script>
import SearchSuggestions from "./SearchSuggestions.vue";
import hotkeys from "hotkeys-js";
export default {
    components: {
        SearchSuggestions,
    },
    props: {
        sidebarState: {
            type: String,
            default: "closed",
        },
        theme: {
            type: String,
            default: "dark",
        },
    },
    emits: ["toggle-sidebar"],
    data() {
        return {
            searchText: this.$route.query.search_query ?? "",
            suggestionsVisible: false,
            homePagePath: import.meta.env.BASE_URL,
            registrationDisabled: false,
            showSearchBox: false,
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
            selectedFilter: this.$route.query.filter ?? "videos", // Default to videos or use filter from URL
        };
    },
    computed: {
        isOnSearchResultsPage() {
            return this.$route.name === "SearchResults";
        },
        shouldShowLogin() {
            return this.getAuthToken() == null;
        },
        shouldShowRegister() {
            return !this.registrationDisabled && this.shouldShowLogin;
        },
        shouldShowHistory() {
            return this.getPreferenceBoolean("watchHistory", false);
        },
        shouldShowTrending() {
            return this.getPreferenceString("homepage", "trending") !== "trending";
        },
        showSearchHistory() {
            return this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
        },
        logoSrc() {
            // Determine logo based on current theme
            const currentTheme = this.theme || localStorage.getItem("theme") || "dark";
            if (currentTheme === "light") {
                return "/img/icons/light-logo-64x64.png";
            } else {
                return "/img/icons/dark-logo-64x64.png";
            }
        },
    },
    watch: {
        $route() {
            this.updateSearchTextFromURLSearchParams();
            if (this.isOnSearchResultsPage) {
                this.searchText = this.$route.query.search_query ?? "";
                this.selectedFilter = this.$route.query.filter ?? "videos";
            }
        },
    },
    mounted() {
        this.fetchAuthConfig();
        this.updateSearchTextFromURLSearchParams();
        this.focusOnSearchBar();
        this.homePagePath = this.getHomePage(this);
    },
    methods: {
        updateSearchTextFromURLSearchParams() {
            const query = new URLSearchParams(window.location.search).get("search_query");
            if (query) {
                this.searchText = query;
                if (this.isOnSearchResultsPage) {
                    // Update filter from URL if on search results page
                    const filter = new URLSearchParams(window.location.search).get("filter");
                    this.selectedFilter = filter || "videos";
                }
            }
        },
        focusOnSearchBar() {
            hotkeys("ctrl+k", event => {
                event.preventDefault();
                if (this.showSearchBox) {
                    this.$refs.searchInput.focus();
                } else {
                    this.showSearchBox = true;
                    this.$nextTick(() => {
                        this.$refs.searchInput.focus();
                    });
                }
            });
        },
        onKeyUp(e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            if (this.showSearchBox && this.$refs.searchSuggestions) {
                this.$refs.searchSuggestions.onKeyUp(e);
            }
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch(e);
            }
        },
        onInputFocus() {
            if (this.showSearchBox && this.$refs.searchSuggestions) {
                if (this.showSearchHistory) this.$refs.searchSuggestions.refreshSuggestions();
                this.suggestionsVisible = true;
            }
        },
        onInputBlur() {
            // Only hide suggestions after a delay to allow click events to register
            setTimeout(() => (this.suggestionsVisible = false), 200);
        },
        onSearchTextChange(searchText) {
            this.searchText = searchText;
        },
        async fetchAuthConfig() {
            this.fetchJson(this.authApiUrl() + "/config").then(config => {
                this.registrationDisabled = config?.registrationDisabled === true;
            });
        },
        updateFilter() {
            if (this.isOnSearchResultsPage && this.searchText) {
                // Update the route with new filter while keeping the search query
                this.$router.replace({
                    query: {
                        search_query: this.searchText,
                        filter: this.selectedFilter,
                    },
                });
            }
        },
        submitSearch() {
            if (this.searchText) {
                this.$router.push({
                    name: "SearchResults",
                    query: {
                        search_query: this.searchText,
                        filter: this.selectedFilter,
                    },
                });
                this.showSearchBox = false;
            } else {
                this.$router.push("/");
            }
        },
        toggleSidebar() {
            this.$emit("toggle-sidebar");
        },
    },
};
</script>

<style scoped>
.search-container {
    @apply relative flex items-center;
}
.delete-search {
    @apply absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-[#ccc] w-4 h-4 text-center text-black opacity-50 hover:opacity-70 text-sm leading-[1.65];
}
#search-btn {
    @apply rounded-l-none rounded-r-3xl;
}
.dark #search-btn:hover {
    @apply bg-dark-100;
}

/* Full-screen search box on mobile */
@media (max-width: 768px) {
    .search-controls-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: white;
        padding: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 0;
        margin: 0;
        width: 100%;
    }

    .dark .search-controls-container {
        background: #15191a;
    }

    .search-controls-container .select {
        margin-bottom: 0.5rem !important;
        width: 100% !important;
        margin-right: 0 !important;
    }

    .search-controls-container .search-container {
        margin-bottom: 0.5rem;
    }

    .search-controls-container .btn {
        margin-top: 0 !important;
        width: 100%;
    }
}
/* Additional styles can be added here if needed */
</style>

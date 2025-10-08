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
                <!-- Mobile search input with cancel button -->
                <div
                    class="absolute left-0 right-0 top-0 z-70 h-16 w-full flex items-center border-b border-gray-200 bg-gray-50 px-2 md:hidden dark:border-dark-100 dark:bg-dark-800 sm:px-4"
                >
                    <div class="relative mx-2 flex flex-1 items-center">
                        <span
                            v-if="searchText"
                            class="delete-search absolute left-4 top-1/2 h-7 w-7 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                            @click="clearSearchText()"
                        >
                            ×
                        </span>
                        <input
                            ref="searchInput"
                            v-model="searchText"
                            class="input h-12 w-full border border-gray-300 rounded-md px-12 pr-16 text-lg leading-[1.7] shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="search"
                            role="search"
                            autocomplete="off"
                            :title="$t('actions.search')"
                            :placeholder="$t('actions.search')"
                            @blur="onInputBlur"
                            @focus="onInputFocus"
                            @keypress="onKeyPress"
                            @keyup="onKeyUp"
                        />
                        <button
                            class="absolute right-3 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                            aria-label="Cancel search"
                            @click="cancelSearch"
                        >
                            <div class="i-fa6-solid:xmark text-lg leading-[1.7]" />
                        </button>
                    </div>
                </div>
                <!-- Mobile search suggestions - only show when there's text and not on mobile devices -->
                <div class="absolute top-full mt-1 w-full md:hidden">
                    <SearchSuggestions
                        ref="searchSuggestions"
                        :search-text="searchText"
                        :is-visible="suggestionsVisible && searchText && searchText.length > 0"
                        @searchchange="onSearchTextChange"
                    />
                </div>
                <!-- Desktop search controls (existing) -->
                <div class="hidden flex-1 justify-center px-4 md:flex">
                    <div
                        class="search-controls-container relative max-w-3xl w-full flex flex-col gap-2 md:flex-row md:items-center"
                    >
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
                            <span
                                v-if="searchText"
                                class="delete-search absolute left-4 top-1/2 h-7 w-7 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                                @click="clearSearchText()"
                            >
                                ×
                            </span>
                            <input
                                ref="searchInput"
                                v-model="searchText"
                                class="input h-12 w-full border border-gray-300 rounded-md px-12 pr-5 text-lg leading-[1.7] shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="search"
                                role="search"
                                autocomplete="off"
                                :title="$t('actions.search')"
                                :placeholder="$t('actions.search')"
                                @blur="onInputBlur"
                                @focus="onInputFocus"
                                @keypress="onKeyPress"
                                @keyup="onKeyUp"
                            />
                        </div>
                        <button
                            class="btn mt-2 h-12 flex items-center justify-center rounded-lg bg-gray-100 px-5 md:mt-0 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
                            @click="submitSearch"
                        >
                            <div class="i-fa6-solid:magnifying-glass text-base leading-[1.65]" />
                        </button>
                        <div class="absolute top-full mt-1 w-full">
                            <SearchSuggestions
                                ref="searchSuggestions"
                                :search-text="searchText"
                                :is-visible="suggestionsVisible"
                                @searchchange="onSearchTextChange"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right side: User actions -->
            <div v-if="!showSearchBox && !isOnSearchResultsPage" class="flex items-center">
                <!-- Search button -->
                <button
                    class="ml-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Search"
                    @click="openSearchBox"
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
            searchText: this.$route.query?.search_query ?? "",
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
            selectedFilter: this.$route.query?.filter ?? "videos", // Default to videos or use filter from URL
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
        $route(to, from) {
            this.updateSearchTextFromURLSearchParams();
            if (this.isOnSearchResultsPage) {
                this.searchText = this.$route.query?.search_query ?? "";
                this.selectedFilter = this.$route.query?.filter ?? "videos";
            } else if (from.name === "SearchResults" && to.name !== "SearchResults") {
                // Clear search when navigating away from search results page
                this.showSearchBox = false;
                this.suggestionsVisible = false;
                this.searchText = "";
            }
        },
    },
    mounted() {
        this.fetchAuthConfig();
        this.updateSearchTextFromURLSearchParams();
        this.focusOnSearchBar();
        this.homePagePath = this.getHomePage(this);

        // Add click event listener to detect clicks outside the search area
        document.addEventListener("click", this.handleOutsideClick);
    },
    beforeUnmount() {
        // Remove event listener when component is destroyed to prevent memory leaks
        document.removeEventListener("click", this.handleOutsideClick);
    },
    methods: {
        updateSearchTextFromURLSearchParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get("search_query");
            if (query && typeof query === "string") {
                this.searchText = query;
                if (this.isOnSearchResultsPage) {
                    // Update filter from URL if on search results page
                    const filter = urlParams.get("filter");
                    this.selectedFilter = filter && typeof filter === "string" ? filter : "videos";
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
                if (this.showSearchBox && this.$refs.searchSuggestions) {
                    this.$refs.searchSuggestions.onKeyUp(e);
                    this.suggestionsVisible = true;
                }
            } else {
                if (this.showSearchBox && this.$refs.searchSuggestions) {
                    this.$refs.searchSuggestions.onKeyUp(e);
                    // Only show suggestions if there's text, and handle mobile differently
                    if (this.isMobileDevice()) {
                        this.suggestionsVisible = !!this.searchText && this.searchText && this.searchText.length > 0;
                    } else {
                        this.suggestionsVisible = !!this.searchText;
                    }
                }
            }
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch(e);
            }
        },
        onInputFocus() {
            // On mobile devices, delay showing suggestions to prevent keyboard overlap issues
            if (this.isMobileDevice()) {
                // Small delay to allow keyboard to appear before showing suggestions
                setTimeout(() => {
                    if (this.showSearchBox && this.$refs.searchSuggestions) {
                        this.$refs.searchSuggestions.refreshSuggestions();
                        // Only show suggestions if there's text to search, with safe check
                        this.suggestionsVisible = this.searchText && this.searchText.length > 0;
                    }
                }, 300);
            } else {
                // Desktop behavior - show immediately
                if (this.showSearchBox && this.$refs.searchSuggestions) {
                    this.$refs.searchSuggestions.refreshSuggestions();
                    this.suggestionsVisible = true;
                }
            }
        },
        onInputBlur() {
            // Only hide suggestions after a delay to allow click events to register
            setTimeout(() => (this.suggestionsVisible = false), 200);
        },
        onSearchTextChange(searchText) {
            this.searchText = searchText || "";
            // Keep suggestions visible when text is selected from suggestions
            if (this.isMobileDevice()) {
                // On mobile, only show suggestions if there's text
                const textToCheck = searchText || "";
                this.suggestionsVisible = !!textToCheck && textToCheck.length > 0;
            } else {
                this.suggestionsVisible = !!searchText;
            }
        },
        async fetchAuthConfig() {
            this.fetchJson(this.authApiUrl() + "/config").then(config => {
                this.registrationDisabled = config?.registrationDisabled === true;
            });
        },
        updateFilter() {
            if (this.isOnSearchResultsPage && this.searchText && typeof this.searchText === "string") {
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
            if (this.searchText && typeof this.searchText === "string" && this.searchText.trim() !== "") {
                this.$router.push({
                    name: "SearchResults",
                    query: {
                        search_query: this.searchText,
                        filter: this.selectedFilter,
                    },
                });
                this.showSearchBox = false;
                this.suggestionsVisible = false;
            } else {
                this.$router.push("/");
            }
        },
        toggleSidebar() {
            this.$emit("toggle-sidebar");
        },
        handleOutsideClick(event) {
            // Check if the click is outside the search container and suggestions
            const searchInput = this.$refs.searchInput;
            const searchSuggestions = this.$refs.searchSuggestions;

            // Check if the clicked element is inside the search container or suggestions
            let isClickInsideSearch = false;

            if (searchInput && searchInput.contains && searchInput.contains(event.target)) {
                isClickInsideSearch = true;
            }

            if (
                searchSuggestions &&
                searchSuggestions.$el &&
                searchSuggestions.$el.contains &&
                searchSuggestions.$el.contains(event.target)
            ) {
                isClickInsideSearch = true;
            }

            // If the click is outside both the search input and suggestions, hide suggestions
            if (!isClickInsideSearch) {
                this.suggestionsVisible = false;
            }
        },
        openSearchBox() {
            this.showSearchBox = true;
            this.suggestionsVisible = false;
            // Clear the search text and ensure the input is empty
            this.searchText = "";
            // Wait for the component to update before focusing
            this.$nextTick(() => {
                if (this.$refs.searchInput) {
                    this.$refs.searchInput.focus();
                    // Ensure the input is empty after focusing (in case browser tries to auto-fill)
                    this.$refs.searchInput.value = "";
                }
            });
        },
        cancelSearch() {
            this.showSearchBox = false;
            this.suggestionsVisible = false;
            this.searchText = "";
            // Ensure the input field is also cleared in case of browser auto-fill
            if (this.$refs.searchInput && this.$refs.searchInput.value) {
                this.$refs.searchInput.value = "";
            }
        },
        clearSearchText() {
            this.searchText = "";
        },
        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

/* Full-screen search box on mobile - adjust for existing mobile search */
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

<template>
    <nav
        class="sticky top-0 z-70 h-16 w-full border-b border-gray-200 bg-gray-50 dark:border-dark-100 dark:bg-dark-800"
    >
        <div class="mx-auto h-full flex items-center justify-between px-2 sm:px-4">
            <!-- Left side: Menu button and Logo -->
            <div class="flex items-center" :class="{ hidden: showSearchBox }">
                <button
                    class="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Toggle sidebar"
                    @click="toggleSidebar"
                >
                    <div class="i-fa6-solid:bars text-lg" />
                </button>
                <router-link class="ml-4 flex items-center gap-2 text-3xl font-bold font-sans" :to="homePagePath">
                    <img :src="logoSrc" alt="logo" class="bold w-10" height="32" width="32" />
                    <span class="hidden sm:inline">ویدیو</span>
                </router-link>
            </div>

            <!-- Center: Desktop Search Form -->
            <div class="hidden flex-1 justify-center px-4 md:flex">
                <div class="max-w-3xl w-full">
                    <SearchForm
                        ref="desktopSearch"
                        :available-filters="availableFilters"
                        :search-text-prop="searchText"
                        :selected-filter-prop="selectedFilter"
                        :suggestions-visible-prop="suggestionsVisible"
                        @submit="submitSearch"
                        @update:search-text="searchText = $event"
                        @update:selected-filter="selectedFilter = $event"
                        @update:suggestions-visible="suggestionsVisible = $event"
                    />
                </div>
            </div>

            <!-- Right side: User actions -->
            <div class="flex items-center" :class="{ hidden: showSearchBox }">
                <!-- Search button -->
                <button
                    class="ml-2 h-10 w-10 flex items-center justify-center rounded-full md:hidden hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Search"
                    @click="openSearchBox"
                >
                    <div class="i-fa6-solid:magnifying-glass text-lg" />
                </button>
            </div>
        </div>
        <!-- Mobile search overlay -->
        <div
            v-if="showSearchBox"
            class="absolute inset-0 z-70 h-16 w-full flex items-center border-b bg-gray-50 px-2 md:hidden dark:border-dark-100 dark:bg-dark-800 sm:px-4"
        >
            <button
                class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                aria-label="Cancel search"
                @click="cancelSearch"
            >
                <div class="i-fa6-solid:arrow-left text-lg" />
            </button>
            <SearchForm
                ref="mobileSearch"
                :available-filters="availableFilters"
                :search-text-prop="searchText"
                :selected-filter-prop="selectedFilter"
                :suggestions-visible-prop="suggestionsVisible"
                @submit="submitSearch"
                @update:search-text="searchText = $event"
                @update:selected-filter="selectedFilter = $event"
                @update:suggestions-visible="suggestionsVisible = $event"
            />
        </div>
    </nav>
</template>

<script>
import SearchForm from "./SearchForm.vue";
import hotkeys from "hotkeys-js";
export default {
    components: {
        SearchForm,
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
            homePagePath: "/",
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
                if (this.$refs.desktopSearch) {
                    this.$refs.desktopSearch.focusInput();
                } else if (this.showSearchBox) {
                    this.$refs.mobileSearch.focusInput();
                } else {
                    this.showSearchBox = true;
                    this.$nextTick(() => {
                        this.$refs.mobileSearch.focusInput();
                    });
                }
            });
        },
        async fetchAuthConfig() {
            this.fetchJson(this.authApiUrl() + "/config").then(config => {
                this.registrationDisabled = config?.registrationDisabled === true;
            });
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
            const isClickInsideDesktopSearch =
                this.$refs.desktopSearch && this.$refs.desktopSearch.$el.contains(event.target);
            const isClickInsideMobileSearch =
                this.$refs.mobileSearch && this.$refs.mobileSearch.$el.contains(event.target);

            if (!isClickInsideDesktopSearch && !isClickInsideMobileSearch) {
                this.suggestionsVisible = false;
            }
        },
        openSearchBox() {
            this.showSearchBox = true;
            this.suggestionsVisible = false;
            this.searchText = "";
            this.$nextTick(() => {
                if (this.$refs.mobileSearch) {
                    this.$refs.mobileSearch.focusInput();
                }
            });
        },
        cancelSearch() {
            this.showSearchBox = false;
            this.suggestionsVisible = false;
            this.searchText = "";
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
</style>

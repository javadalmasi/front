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
                    class="ml-4 flex items-center text-3xl leading-[1.45] font-bold font-sans"
                    :to="homePagePath"
                >
                    <img alt="logo" src="/img/icons/logo.svg" height="32" width="32" class="bold w-10" />
                    <span class="hidden sm:inline">ویدیو</span>
                </router-link>
            </div>

            <!-- Right side: User actions -->
            <div class="flex items-center">
                <!-- Search button -->
                <button
                    class="ml-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Search"
                    @click="$router.push({ name: 'SearchResults' })"
                >
                    <div class="i-fa6-solid:magnifying-glass text-lg leading-[1.7]" />
                </button>
            </div>
            <SearchSuggestions
                v-show="!isOnSearchResultsPage && (searchText || showSearchHistory) && suggestionsVisible"
                ref="searchSuggestions"
                :search-text="searchText"
                @searchchange="onSearchTextChange"
            />
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
            searchText: "",
            suggestionsVisible: false,
            homePagePath: import.meta.env.BASE_URL,
            registrationDisabled: false,
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
    },
    watch: {
        $route() {
            this.updateSearchTextFromURLSearchParams();
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
            if (query) this.onSearchTextChange(query);
        },
        focusOnSearchBar() {
            hotkeys("ctrl+k", event => {
                event.preventDefault();
                this.$refs.videoSearch.focus();
            });
        },
        onKeyUp(e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            if (!this.isOnSearchResultsPage && this.$refs.searchSuggestions) {
                this.$refs.searchSuggestions.onKeyUp(e);
            }
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch(e);
            }
        },
        onInputFocus() {
            if (!this.isOnSearchResultsPage && this.$refs.searchSuggestions) {
                if (this.showSearchHistory) this.$refs.searchSuggestions.refreshSuggestions();
                this.suggestionsVisible = true;
            }
        },
        onInputBlur() {
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
        onSearchClick(e) {
            this.submitSearch(e);
        },
        submitSearch(e) {
            e.target.blur();
            if (this.searchText) {
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchText },
                });
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
/* Additional styles can be added here if needed */
</style>

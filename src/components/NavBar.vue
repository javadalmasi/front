<template>
    <nav class="relative z-60 h-16 w-full border-b border-gray-200 bg-gray-50 dark:border-dark-100 dark:bg-dark-800">
        <div class="mx-auto flex h-full items-center justify-between px-2 sm:px-4">
            <!-- Left side: Menu button and Logo -->
            <div class="flex items-center">
                <button
                    class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-dark-100"
                    aria-label="Toggle sidebar"
                    @click="toggleSidebar"
                >
                    <div class="i-fa6-solid:bars text-2xl" />
                </button>
                <router-link class="ml-4 flex items-center font-sans text-3xl font-bold" :to="homePagePath">
                    <img alt="logo" src="/img/icons/logo.svg" height="32" width="32" class="bold w-10" />
                    <span class="hidden sm:inline">ویدیو</span>
                </router-link>
            </div>

            <!-- Center: Search bar -->
            <div class="mx-4 max-w-2xl flex-1">
                <div class="search-container w-full">
                    <input
                        ref="videoSearch"
                        v-model="searchText"
                        class="input h-10 w-full pr-10"
                        type="text"
                        role="search"
                        :title="$t('actions.search')"
                        :placeholder="$t('actions.search')"
                        @blur="onInputBlur"
                        @focus="onInputFocus"
                        @keypress="onKeyPress"
                        @keyup="onKeyUp"
                    />
                    <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
                    <button id="search-btn" class="btn absolute right-0 top-0 h-10 w-10" @click="onSearchClick">
                        <div class="i-fa6-solid:magnifying-glass" />
                    </button>
                </div>
            </div>

            <!-- Right side: User actions (placeholder) -->
            <div class="flex items-center">
                <!-- Future icons like notifications, user profile, etc. -->
            </div>
        </div>
    </nav>
    <SearchSuggestions
        v-show="(searchText || showSearchHistory) && suggestionsVisible"
        ref="searchSuggestions"
        :search-text="searchText"
        @searchchange="onSearchTextChange"
    />
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
            this.$refs.searchSuggestions.onKeyUp(e);
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch(e);
            }
        },
        onInputFocus() {
            if (this.showSearchHistory) this.$refs.searchSuggestions.refreshSuggestions();
            this.suggestionsVisible = true;
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
    @apply absolute left-12 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-[#ccc] w-4 h-4 text-center text-black opacity-50 hover:opacity-70 text-sm;
}
#search-btn {
    @apply rounded-l-none rounded-r-3xl;
}
.dark #search-btn:hover {
    @apply bg-dark-100;
}
</style>

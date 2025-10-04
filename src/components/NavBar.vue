<template>
    <nav class="relative w-full flex flex-wrap items-center justify-center px-2 pb-2.5 sm:px-4">
        <div class="flex flex-1 justify-start">
            <!-- Menu toggle button before the logo -->
            <button class="mr-3 flex flex-col justify-end md:hidden" @click="showTopNav = !showTopNav">
                <span class="line"></span>
                <span class="line"></span>
                <span class="line"></span>
            </button>
            <!-- Desktop sidebar toggle - available on all devices -->
            <button class="mr-3 flex flex-col justify-end" @click="toggleDesktopSidebar">
                <span class="line"></span>
                <span class="line"></span>
                <span class="line"></span>
            </button>
            <router-link class="flex items-center text-3xl font-bold font-sans" :to="homePagePath"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    class="bold mr-[-0.6rem] w-10"
                />ویدیو</router-link
            >
        </div>
        <div class="search-container mx-4 max-w-2xl flex-1 lt-md:hidden">
            <input
                ref="videoSearch"
                v-model="searchText"
                class="input h-10 w-full pl-20"
                type="text"
                role="search"
                :title="$t('actions.search')"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
            <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
        </div>
        <button id="search-btn" class="input btn mx-1 h-10" @click="onSearchClick">
            <div class="i-fa6-solid:magnifying-glass"></div>
        </button>
        <!-- three vertical lines for toggling the hamburger menu on mobile -->
        <button class="mr-3 flex flex-col justify-end md:hidden" @click="showTopNav = !showTopNav">
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
        </button>
    </nav>
    <!-- search suggestions for mobile devices -->
    <div class="search-container mb-2 w-full md:hidden">
        <input
            v-model="searchText"
            class="input h-10 w-full"
            type="text"
            role="search"
            :title="$t('actions.search')"
            :placeholder="$t('actions.search')"
            @keyup="onKeyUp"
            @keypress="onKeyPress"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
        <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
    </div>
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
    },
    data() {
        return {
            searchText: "",
            suggestionsVisible: false,
            showTopNav: false,
            homePagePath: import.meta.env.BASE_URL,
            registrationDisabled: false,
        };
    },
    computed: {
        shouldShowLogin(_this) {
            return _this.getAuthToken() == null;
        },
        shouldShowRegister(_this) {
            return _this.registrationDisabled == false ? _this.shouldShowLogin : false;
        },
        shouldShowHistory(_this) {
            return _this.getPreferenceBoolean("watchHistory", false);
        },
        shouldShowTrending(_this) {
            return _this.getPreferenceString("homepage", "trending") != "trending";
        },
        showSearchHistory(_this) {
            return _this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
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
        // focus on search bar when Ctrl+k is pressed
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
            // the search suggestions will be hidden after some seconds
            // otherwise anchor links won't work!
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
            return;
        },
        toggleDesktopSidebar() {
            // Use a global event or Vuex store to communicate with the sidebar
            // For now, we'll dispatch a custom event that the Sidebar component will listen for
            window.dispatchEvent(new CustomEvent("toggleDesktopSidebar"));
        },
    },
};
</script>

<style>
.search-container {
    @apply relative inline-flex items-center;
}
.delete-search {
    @apply absolute left-3 cursor-pointer rounded-full bg-[#ccc] w-4 h-4 text-center text-black opacity-50 hover:(opacity-70) text-size-[10px];
}
.mobile-nav div {
    @apply mx-1;
}

#search-btn:hover {
    @apply bg-red-400;
}

.dark #search-btn:hover {
    @apply bg-dark-100;
}

.nav-link {
    @apply hover:text-red-500;
}

.dark .nav-link {
    @apply hover:text-red-400;
}

@media screen and (max-width: 848px) {
    #search-btn {
        display: none;
    }
}
</style>

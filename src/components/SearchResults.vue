<template>
    <div class="page-container flex flex-col items-center gap-6 py-8">
        <!-- Search Input Section -->
        <div class="w-full max-w-3xl flex flex-col items-center gap-4">
            <div class="w-full flex items-center gap-2">
                <!-- Main Content Filter -->
                <select
                    id="ddlSearchFilters"
                    v-model="selectedFilter"
                    class="input-base h-12 !w-auto"
                    :title="$t('search.filter_by_type')"
                >
                    <option value="all">{{ $t("search.all") }}</option>
                    <option value="videos">{{ $t("search.videos") }}</option>
                    <option value="channels">{{ $t("search.channels") }}</option>
                    <option value="playlists">{{ $t("search.playlists") }}</option>
                </select>

                <!-- Search Input -->
                <div class="relative flex-1">
                    <input
                        ref="searchInput"
                        v-model="searchQueryText"
                        class="input-base h-12 w-full !rounded-full pl-12"
                        type="search"
                        :title="$t('actions.search')"
                        :placeholder="$t('search.placeholder')"
                        @blur="onInputBlur"
                        @focus="onInputFocus"
                        @keypress.enter="submitSearch"
                        @keyup="onKeyUp"
                    />
                    <div
                        class="i-fa6-solid:magnifying-glass text-soft absolute left-4 top-1/2 -translate-y-1/2"
                    ></div>
                </div>

                <!-- Submit Button -->
                <button class="btn btn-primary h-12" @click="submitSearch">
                    {{ $t("actions.search") }}
                </button>
            </div>

            <!-- Search Suggestions Dropdown -->
            <div class="relative w-full">
                <div class="absolute top-0 z-10 w-full">
                    <SearchSuggestions
                        v-show="suggestionsVisible"
                        ref="searchSuggestions"
                        :search-text="searchQueryText"
                        @searchchange="onSearchTextChange"
                        @close="suggestionsVisible = false"
                    />
                </div>
            </div>
        </div>

        <!-- Search Results Section -->
        <div v-if="!loading && rawResults.length === 0 && !searchQueryText" class="py-10 text-center text-soft">
             <p>{{ $t("search.prompt") }}</p>
        </div>

        <div v-if="!loading && rawResults.length === 0 && searchQueryText" class="py-10 text-center text-soft">
            <p>{{ $t("search.no_results_found") }}</p>
        </div>


        <LoadingIndicatorPage :show-content="!loading && rawResults.length > 0" class="video-grid w-full">
            <template v-for="result in rawResults" :key="result.url">
                <ContentItem :item="result" />
            </template>
        </LoadingIndicatorPage>

        <div v-if="loading" class="py-10 text-center text-soft">
            <p>{{ $t("actions.loading") }}</p>
        </div>
    </div>
</template>

<script>
import { nextTick } from "vue";
import { gsap } from "gsap";
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
            searchQueryText: "",
            rawResults: [],
            nextPage: null,
            loading: false,
            suggestionsVisible: false,
            selectedFilter: "all",
            initialLoad: true, // Flag to control initial animation
        };
    },
    watch: {
        "$route.query": {
            handler(newQuery) {
                if (newQuery.search_query || newQuery.filter) {
                    this.searchQueryText = newQuery.search_query || "";
                    this.selectedFilter = newQuery.filter || "all";
                    this.performSearch();
                }
            },
            immediate: true,
        },
        rawResults(newResults, oldResults) {
            // Animate only when new results are loaded, not on infinite scroll
            if (newResults.length > 0 && this.initialLoad) {
                nextTick(() => {
                    gsap.from(".video-grid .card", {
                        duration: 0.5,
                        opacity: 0,
                        y: 30,
                        stagger: 0.08,
                        ease: "power3.out",
                    });
                     this.initialLoad = false; // Prevent re-animation on infinite scroll
                });
            }
        }
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
            if (this.loading || !this.nextPage) return;
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
            if (nearBottom) {
                this.loadNextPage();
            }
        },
        async loadNextPage() {
            if (this.loading || !this.nextPage) return;
            this.loading = true;
            try {
                const params = {
                    nextpage: this.nextPage,
                    q: this.searchQueryText,
                    filter: this.selectedFilter,
                };
                const json = await this.fetchJson(this.apiUrl() + "/nextpage/search", params);
                if (json && json.items) {
                    this.rawResults.push(...json.items);
                    this.nextPage = json.nextpage;
                    this.updateWatched(json.items);
                } else {
                    this.nextPage = null;
                }
            } catch (error) {
                console.error("Failed to load next page:", error);
                this.nextPage = null;
            } finally {
                this.loading = false;
            }
        },
        onInputFocus() {
            this.suggestionsVisible = true;
        },
        onInputBlur() {
            setTimeout(() => {
                if (this.$refs.searchSuggestions && !this.$refs.searchSuggestions.isMouseOver) {
                    this.suggestionsVisible = false;
                }
            }, 200);
        },
        onKeyUp(e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                this.$refs.searchSuggestions?.onKeyUp(e);
            } else {
                 this.suggestionsVisible = true;
            }
        },
        onSearchTextChange(searchText) {
            this.searchQueryText = searchText;
            this.submitSearch();
        },
        submitSearch() {
            if (this.searchQueryText.trim()) {
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchQueryText, filter: this.selectedFilter },
                });
            }
        },
        async performSearch() {
            if (!this.searchQueryText) {
                this.rawResults = [];
                this.nextPage = null;
                return;
            };

            this.loading = true;
            this.rawResults = [];
            this.nextPage = null;
            this.suggestionsVisible = false;
            this.initialLoad = true; // Reset animation flag for new search

            try {
                const params = { q: this.searchQueryText, filter: this.selectedFilter };
                const json = await this.fetchJson(this.apiUrl() + "/search", params);

                if (json && json.items) {
                    this.rawResults = json.items;
                    this.nextPage = json.nextpage;
                    this.updateWatched(json.items);
                } else {
                    this.rawResults = [];
                    this.nextPage = null;
                }
            } catch (error) {
                console.error("Search failed:", error);
                this.rawResults = [];
                this.nextPage = null;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
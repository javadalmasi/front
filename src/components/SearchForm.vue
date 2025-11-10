<template>
    <div class="relative w-full flex flex-1 items-center gap-2">
        <!-- Search input and suggestions -->
        <div class="w-full flex-1 md:w-auto">
            <div class="search-container w-full flex items-center gap-2 md:flex-row">
                <div class="relative flex-1">
                    <span
                        v-if="searchText"
                        class="delete-search absolute top-1/2 h-7 w-7 flex cursor-pointer items-center justify-center rounded-full bg-gray-200 text-center text-gray-500 opacity-70 ltr:left-4 rtl:left-4 rtl:right-auto -translate-y-1/2 dark:bg-dark-400 dark:text-gray-400 hover:opacity-100"
                        @click="clearSearchText()"
                    >
                        ×
                    </span>
                    <input
                        ref="searchInput"
                        :value="searchTextProp"
                        class="input h-12 w-full border border-gray-300 rounded-md px-12 text-lg shadow-sm dark:border-dark-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="search"
                        role="search"
                        autocomplete="off"
                        :title="$t('actions.search')"
                        :placeholder="$t('actions.search')"
                        @input="$emit('update:search-text', $event.target.value)"
                        @blur="onInputBlur"
                        @focus="onInputFocus"
                        @keypress="onKeyPress"
                        @keyup="onKeyUp"
                    />
                </div>
                <!-- Search Filters Dropdown (visible on desktop) -->
                <select
                    v-if="!searchFiltersDisabled"
                    :value="selectedFilterProp"
                    class="ddlSearchFilters hidden h-12 min-w-[100px] border border-gray-300 rounded-md bg-gray-100 px-2 text-base md:block dark:border-dark-200 dark:bg-dark-400"
                    @change="
                        $emit('update:selected-filter', $event.target.value);
                        submitSearch();
                    "
                >
                    <option v-for="filter in availableFilters" :key="filter" v-t="`search.${filter}`" :value="filter" />
                </select>
            </div>
            <div class="absolute top-full mt-1 w-full ltr:left-0 ltr:right-auto rtl:left-auto rtl:right-0">
                <SearchSuggestions
                    ref="searchSuggestions"
                    :search-text="searchTextProp"
                    :is-visible="suggestionsVisibleProp"
                    @searchchange="onSearchTextChange"
                />
            </div>
        </div>
        <!-- Search button -->
        <button
            class="btn h-12 flex items-center justify-center rounded-lg bg-gray-100 px-5 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-300"
            @click="submitSearch"
        >
            <div class="i-fa6-solid:magnifying-glass text-base" />
        </button>
    </div>
</template>

<script>
import SearchSuggestions from "./SearchSuggestions.vue";
export default {
    name: "SearchForm",
    components: {
        SearchSuggestions,
    },
    props: {
        searchTextProp: {
            type: String,
            default: "",
        },
        selectedFilterProp: {
            type: String,
            default: "videos",
        },
        suggestionsVisibleProp: {
            type: Boolean,
            default: false,
        },
        availableFilters: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update:search-text", "update:selected-filter", "update:suggestions-visible", "submit"],
    computed: {
        searchText: {
            get() {
                return this.searchTextProp;
            },
            set(value) {
                this.$emit("update:search-text", value);
            },
        },
        searchFiltersDisabled() {
            return import.meta.env.VITE_DISABLE_SEARCH_FILTERS === "true";
        },
    },
    methods: {
        onInputFocus() {
            this.$emit("update:suggestions-visible", true);
        },
        onInputBlur() {
            setTimeout(() => this.$emit("update:suggestions-visible", false), 200);
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                this.submitSearch();
            }
        },
        onKeyUp(e) {
            if (this.$refs.searchSuggestions) {
                this.$refs.searchSuggestions.onKeyUp(e);
            }
            this.$emit("update:suggestions-visible", true);
        },
        onSearchTextChange(newSearchText) {
            this.$emit("update:search-text", newSearchText);
            this.submitSearch();
        },
        clearSearchText() {
            this.$emit("update:search-text", "");
        },
        submitSearch() {
            this.$emit("submit");
        },
        focusInput() {
            this.$refs.searchInput.focus();
        },
    },
};
</script>

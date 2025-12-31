<template>
    <div
        v-show="isVisible && searchText && searchText.length >= 3"
        class="suggestions-container absolute top-full mt-1"
    >
        <ul>
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                @mouseover="onMouseOver(i)"
            >
                <router-link
                    class="suggestion"
                    :class="{ 'suggestion-selected': selected === i }"
                    :to="`/results?search_query=${encodeURIComponent(suggestion)}`"
                    @click="setSelected(i)"
                    >{{ suggestion }}</router-link
                >
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        searchText: { type: String, default: "" },
        isVisible: { type: Boolean, default: true },
    },
    emits: ["searchchange"],
    data() {
        return {
            selected: -1,
            searchSuggestions: [],
        };
    },
    methods: {
        onKeyUp(e) {
            if (e.key === "ArrowUp") {
                if (this.selected <= 0) {
                    this.setSelected(this.searchSuggestions.length - 1);
                } else {
                    this.setSelected(this.selected - 1);
                }
                e.preventDefault();
            } else if (e.key === "ArrowDown") {
                if (this.selected < 0 || this.selected >= this.searchSuggestions.length - 1) {
                    this.setSelected(0);
                } else {
                    this.setSelected(this.selected + 1);
                }
                e.preventDefault();
            } else {
                this.refreshSuggestions();
            }
        },
        async refreshSuggestions() {
            // Ensure searchText is defined and is a string
            const currentSearchText = this.searchText || "";

            if (currentSearchText && currentSearchText.length >= 3 && this.getPreferenceBoolean("searchSuggestions", true)) {
                this.searchSuggestions =
                    (
                        await this.fetchJson(this.apiUrl() + "/opensearch/suggestions", {
                            query: currentSearchText,
                        })
                    )?.[1] ?? [];
            } else {
                this.searchSuggestions = [];
            }



            // Limit total suggestions to 5 items
            if (this.searchSuggestions.length > 5) {
                this.searchSuggestions = this.searchSuggestions.slice(0, 5);
            }

            // Only set selected to 0 if there are suggestions and we're not just showing the current search text
            if (this.searchSuggestions.length > 0) {
                // Don't automatically select the first item (current search text) to allow users to continue typing
                this.selected = -1; // Set to -1 to indicate no selection
            }
        },
        onMouseOver(i) {
            if (i !== this.selected) {
                this.selected = i;
            }
        },
        setSelected(val) {
            this.selected = val;
            // Only emit searchchange if there's a valid suggestion selected
            if (val >= 0 && this.searchSuggestions && this.searchSuggestions[val] !== undefined) {
                this.$emit("searchchange", this.searchSuggestions[val]);
            }
        },
        getSearchHistory() {
            try {
                const history = localStorage.getItem("search_history");
                const parsedHistory = history ? JSON.parse(history) : [];

                // If the history is in the old format (just strings), convert it to the new format
                if (parsedHistory.length > 0 && typeof parsedHistory[0] === 'string') {
                    return parsedHistory.map(query => ({
                        query: query,
                        timestamp: new Date().toISOString() // Use current timestamp for old entries
                    }));
                }

                return parsedHistory;
            } catch {
                return [];
            }
        },
    },
};
</script>

<style>
.suggestions-container {
    @apply w-full box-border z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1;
}

/* Mobile-specific full-width styles */
@media (max-width: 767px) {
    .suggestions-container {
        border-radius: 0 !important;
    }
}

.dark .suggestions-container {
    @apply bg-dark-300 border-dark-100;
}

.suggestion {
    @apply block w-full px-4 py-3 text-sm leading-[1.65] text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-dark-400 cursor-pointer lt-md:px-4 lt-md:py-3;
}

.suggestion-selected {
    @apply bg-blue-100 dark:bg-blue-900 !important;
}

.dark .suggestion-selected {
    @apply bg-blue-900 !important;
}
</style>

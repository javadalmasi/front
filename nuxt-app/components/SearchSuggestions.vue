<template>
    <div v-show="isVisible" class="suggestions-container absolute left-0 right-0 top-full mt-1">
        <ul>
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                @mouseover="onMouseOver(i)"
                @click="setSelected(i)"
            >
                <NuxtLink
                    class="suggestion"
                    :class="{ 'suggestion-selected': selected === i }"
                    :to="`/results?search_query=${encodeURIComponent(suggestion)}`"
                    >{{ suggestion }}</NuxtLink
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

            if (!currentSearchText) {
                if (this.getPreferenceBoolean("searchHistory", false))
                    this.searchSuggestions = JSON.parse(localStorage.getItem("search_history")) ?? [];
                else this.searchSuggestions = [];
            } else if (this.getPreferenceBoolean("searchSuggestions", true)) {
                this.searchSuggestions =
                    (
                        await this.fetchJson(this.apiUrl() + "/opensearch/suggestions", {
                            query: currentSearchText,
                        })
                    )?.[1] ?? [];
            } else {
                this.searchSuggestions = [];
                return;
            }
            if (currentSearchText) {
                // Add current search text as first suggestion
                this.searchSuggestions.unshift(currentSearchText);
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
    },
};
</script>

<style>
.suggestions-container {
    @apply max-w-3xl w-full box-border z-10 lt-md:max-w-[calc(100%-0.5rem)] bg-white border border-gray-200 rounded-md shadow-lg mt-1;
}

.dark .suggestions-container {
    @apply bg-dark-300 border-dark-100;
}

.suggestion {
    @apply block w-full px-4 py-2 text-sm leading-[1.65] text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-dark-400 cursor-pointer;
}

.suggestion-selected {
    @apply bg-blue-100 dark:bg-blue-900 !important;
}

.dark .suggestion-selected {
    @apply bg-blue-900 !important;
}
</style>

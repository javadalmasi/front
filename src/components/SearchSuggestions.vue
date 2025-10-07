<template>
    <div v-show="isVisible" class="suggestions-container absolute left-0 right-0 top-full mt-1">
        <ul>
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                @mouseover="onMouseOver(i)"
                @click="setSelected(i)"
            >
                <router-link
                    class="suggestion"
                    :class="{ 'suggestion-selected': selected === i }"
                    :to="`/results?search_query=${encodeURIComponent(suggestion)}`"
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
            selected: 0,
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
                if (this.selected >= this.searchSuggestions.length - 1) {
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
            if (!this.searchText) {
                if (this.getPreferenceBoolean("searchHistory", false))
                    this.searchSuggestions = JSON.parse(localStorage.getItem("search_history")) ?? [];
                else this.searchSuggestions = [];
            } else if (this.getPreferenceBoolean("searchSuggestions", true)) {
                this.searchSuggestions =
                    (
                        await this.fetchJson(this.apiUrl() + "/opensearch/suggestions", {
                            query: this.searchText,
                        })
                    )?.[1] ?? [];
            } else {
                this.searchSuggestions = [];
                return;
            }
            if (this.searchText) {
                // Add current search text as first suggestion
                this.searchSuggestions.unshift(this.searchText);
            }
            this.setSelected(0);
        },
        onMouseOver(i) {
            if (i !== this.selected) {
                this.selected = i;
            }
        },
        setSelected(val) {
            this.selected = val;
            this.$emit("searchchange", this.searchSuggestions[this.selected]);
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

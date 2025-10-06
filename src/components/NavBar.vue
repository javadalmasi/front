<template>
    <nav class="sticky top-0 z-50 h-16 w-full border-b border-color bg-surface">
        <div class="mx-auto h-full flex items-center justify-between page-container">
            <!-- Left side: Menu button and Logo -->
            <div class="flex items-center gap-2">
                <button class="btn btn-icon btn-ghost" :aria-label="$t('sidebar.toggle')" @click="toggleSidebar">
                    <div class="i-fa6-solid:bars text-xl" />
                </button>
                <router-link :to="homePagePath" class="flex items-center gap-2 text-2xl font-bold">
                    <img alt="logo" src="/img/icons/logo.svg" height="32" width="32" class="h-8 w-8" />
                    <span class="hidden sm:inline">{{ $t("general.app_name") }}</span>
                </router-link>
            </div>

            <!-- Right side: User actions -->
            <div class="flex items-center">
                <!-- Search button -->
                <button
                    class="btn btn-icon btn-ghost"
                    :aria-label="$t('actions.search')"
                    @click="$router.push({ name: 'SearchResults' })"
                >
                    <div class="i-fa6-solid:magnifying-glass text-xl" />
                </button>

                <!-- Add other navbar buttons here if needed, e.g., login/profile -->
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    props: {
        sidebarState: {
            type: String,
            required: true,
        },
    },
    emits: ["toggle-sidebar"],
    data() {
        return {
            homePagePath: import.meta.env.BASE_URL,
        };
    },
    mounted() {
        this.homePagePath = this.getHomePage(this);
    },
    methods: {
        toggleSidebar() {
            this.$emit("toggle-sidebar");
        },
    },
};
</script>

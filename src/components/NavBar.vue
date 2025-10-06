<template>
    <nav class="bg-surface sticky top-0 z-50 h-16 w-full border-b border-color">
        <div class="page-container mx-auto h-full flex items-center justify-between">
            <!-- Left side: Menu button and Logo -->
            <div class="flex items-center gap-2">
                <button
                    class="btn btn-ghost btn-icon"
                    :aria-label="$t('sidebar.toggle')"
                    @click="toggleSidebar"
                >
                    <div class="i-fa6-solid:bars text-xl" />
                </button>
                <router-link :to="homePagePath" class="flex items-center gap-2 text-2xl font-bold">
                    <img alt="logo" src="/img/icons/logo.svg" height="32" width="32" class="w-8 h-8" />
                    <span class="hidden sm:inline">{{ $t("general.app_name") }}</span>
                </router-link>
            </div>

            <!-- Right side: User actions -->
            <div class="flex items-center">
                <!-- Search button -->
                <button
                    class="btn btn-ghost btn-icon"
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
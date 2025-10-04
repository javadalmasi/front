<template>
    <div
        :class="[
            'fixed top-16 right-0 h-full z-50 transition-all duration-300 ease-in-out',
            'bg-gray-50 dark:bg-dark-800 border-l border-gray-200 dark:border-dark-100',
            {
                'w-64': sidebarState === 'open',
                'w-20': sidebarState === 'semi-open' && !isWatchPage,
                'w-0 overflow-hidden': sidebarState === 'closed',
                'z-40': !isWatchPage, // Lower z-index on other pages
                'z-60': isWatchPage && sidebarState !== 'closed', // Higher z-index on watch page
            },
        ]"
        :style="{ height: 'calc(100vh - 4rem)', direction: 'rtl' }"
    >
        <!-- Scrollable content area -->
        <div class="h-full overflow-y-auto">
            <!-- Public items section -->
            <div class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    آیتم‌های عمومی
                </div>
                <div
                    v-for="item in publicItems"
                    :key="item.name"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo(item.route)"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div :class="item.icon" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">
                        {{ item.name }}
                    </span>
                </div>
            </div>

            <!-- Categories section -->
            <div v-if="sidebarState !== 'semi-open'" class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    دسته‌بندی‌ها
                </div>
                <div
                    v-for="category in visibleCategories"
                    :key="category.name"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="searchCategory(category.name)"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div :class="getIconForCategory(category.name)" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">{{ category.name }}</span>
                </div>

                <!-- Show more button -->
                <div
                    v-if="categories.length > 5 && sidebarState === 'open'"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="toggleShowMoreCategories"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[
                            sidebarState === 'open' ? 'text-xl' : 'text-2xl',
                            showMoreCategories ? 'i-fa6-solid:chevron-up' : 'i-fa6-solid:chevron-down',
                        ]"
                    />
                    <span class="mr-4 text-base">{{ showMoreCategories ? "نمایش کمتر" : "نمایش بیشتر" }}</span>
                </div>
            </div>

            <!-- Theme toggle section -->
            <div class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    حالت پوسته
                </div>
                <div
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    data-testid="theme-toggle"
                    @click="emitToggleTheme"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div :class="theme === 'light' ? 'i-fa6-solid:moon' : 'i-fa6-solid:sun'" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">
                        {{ theme === "light" ? "حالت تاریک" : "حالت روشن" }}
                    </span>
                </div>
            </div>

            <!-- Auth section -->
            <div class="mt-4">
                <div v-if="!authenticated && sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500">
                    حساب کاربری
                </div>
                <div
                    v-if="!authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo('/login')"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div class="i-fa6-solid:right-to-bracket" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">ورود</span>
                </div>
                <div
                    v-if="!authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo('/register')"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div class="i-fa6-solid:user-plus" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">ثبت نام</span>
                </div>
                <div
                    v-if="authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-medium hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="logout"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="[sidebarState === 'open' ? 'text-xl' : 'text-2xl']"
                    >
                        <div class="i-fa6-solid:right-from-bracket" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base">خروج از حساب</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Overlay for watch page and mobile -->
    <div
        v-if="(isWatchPage || isMobile) && sidebarState !== 'closed'"
        class="fixed inset-0 z-50 bg-black bg-opacity-50"
        @click="closeSidebar"
    ></div>
</template>

<script>
export default {
    name: "AppSidebar",
    props: {
        sidebarState: {
            type: String,
            required: true,
        },
        isWatchPage: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            required: true,
        },
    },
    emits: ["toggle-theme"],
    data() {
        return {
            showMoreCategories: false,
            publicItems: [
                { name: "صفحه اصلی", route: "/", icon: "i-fa6-solid:house" },
                { name: "خوراک", route: "/feed", icon: "i-fa6-solid:rss" },
                { name: "پرطرفدار", route: "/trending", icon: "i-fa6-solid:fire" },
                { name: "تاریخچه", route: "/history", icon: "i-fa6-solid:clock-rotate-left" },
                { name: "لیست‌پخش‌ها", route: "/playlists", icon: "i-fa6-solid:bars-staggered" },
                { name: "تنظیمات", route: "/preferences", icon: "i-fa6-solid:gear" },
            ],
            categories: [
                { name: "موسیقی" },
                { name: "ورزش" },
                { name: "بازی" },
                { name: "آموزش" },
                { name: "سرگرمی" },
                { name: "اخبار" },
                { name: "علمی" },
                { name: "کمدی" },
                { name: "سیاست" },
                { name: "فناوری" },
                { name: "هنر" },
                { name: "غذا" },
                { name: "سبک زندگی" },
                { name: "سفر" },
                { name: "مالی" },
                { name: "سلامت" },
                { name: "کودکان" },
                { name: "مستند" },
                { name: "فیلم و سریال" },
                { name: "انیمیشن" },
            ],
        };
    },
    computed: {
        authenticated() {
            return this.getAuthToken() !== undefined;
        },
        isRssFeedDisabled() {
            // Check if RSS feed button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
        },
        filteredPublicItems() {
            // Filter out the RSS feed item if RSS is disabled
            if (this.isRssFeedDisabled) {
                return this.publicItems.filter(item => item.route !== "/feed");
            }
            return this.publicItems;
        },
        visibleCategories() {
            if (this.showMoreCategories || this.sidebarState === "semi-open") {
                return this.categories;
            }
            return this.categories.slice(0, 5);
        },
        isMobile() {
            if (typeof window === "undefined") return false;
            return window.innerWidth < 768;
        },
    },
    methods: {
        closeSidebar() {
            window.dispatchEvent(
                new CustomEvent("sidebarStateChanged", {
                    detail: { state: "closed" },
                }),
            );
        },
        navigateTo(route) {
            this.$router.push(route);
            if (this.isMobile || this.isWatchPage) {
                this.closeSidebar();
            }
        },
        searchCategory(categoryName) {
            this.$router.push({
                name: "SearchResults",
                query: { search_query: categoryName },
            });
            if (this.isMobile || this.isWatchPage) {
                this.closeSidebar();
            }
        },
        toggleShowMoreCategories() {
            this.showMoreCategories = !this.showMoreCategories;
        },
        getIconForCategory(categoryName) {
            const iconMap = {
                موسیقی: "i-fa6-solid:music",
                ورزش: "i-fa6-solid:futbol",
                بازی: "i-fa6-solid:gamepad",
                آموزش: "i-fa6-solid:graduation-cap",
                سرگرمی: "i-fa6-solid:puzzle-piece",
                اخبار: "i-fa6-solid:newspaper",
                علمی: "i-fa6-solid:flask",
                کمدی: "i-fa6-solid:face-laugh-beam",
                سیاست: "i-fa6-solid:landmark",
                فناوری: "i-fa6-solid:laptop-code",
                هنر: "i-fa6-solid:palette",
                غذا: "i-fa6-solid:utensils",
                "سبک زندگی": "i-fa6-solid:heart-pulse",
                سفر: "i-fa6-solid:plane-departure",
                مالی: "i-fa6-solid:money-bill-wave",
                سلامت: "i-fa6-solid:briefcase-medical",
                کودکان: "i-fa6-solid:child-reaching",
                مستند: "i-fa6-solid:film",
                "فیلم و سریال": "i-fa6-solid:tv",
                انیمیشن: "i-fa6-solid:wand-magic-sparkles",
            };
            return iconMap[categoryName] || "i-fa6-solid:tag";
        },
        emitToggleTheme() {
            this.$emit("toggle-theme");
        },
        logout() {
            localStorage.removeItem("authToken" + this.hashCode(this.authApiUrl()));
            window.location = import.meta.env.BASE_URL;
        },
        getAuthToken() {
            const key = "authToken" + this.hashCode(this.authApiUrl());
            return localStorage.getItem(key) || undefined;
        },
        authApiUrl() {
            return import.meta.env.VITE_PIPED_API || "https://pipedapi.kavin.rocks";
        },
        hashCode(s) {
            return s.split("").reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
    },
};
</script>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>

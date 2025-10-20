<template>
    <div
        :class="[
            'fixed top-16 h-full z-50 transition-all duration-300 ease-in-out',
            'bg-gray-50 dark:bg-dark-800 border-l border-gray-200 dark:border-dark-100',
            {
                'right-0': !isMobile, // Desktop: align to right
                'right-0': isMobile, // Mobile: overlay from right for RTL
                'w-64': sidebarState === 'open' && !isMobile,
                'w-20': sidebarState === 'semi-open' && !isWatchPage && !isMobile,
                'w-screen': isMobile && sidebarState !== 'closed', // Mobile: full width when open
                'w-0 overflow-hidden': sidebarState === 'closed' || (isMobile && sidebarState === 'closed'),
                'z-50': !isMobile, // Consistent z-index on other pages
                'z-60': isWatchPage && sidebarState !== 'closed', // Higher z-index on watch page
            },
        ]"
        :style="{ height: isMobile ? '100vh' : 'calc(100vh - 4rem)', direction: 'rtl' }"
    >
        <!-- Scrollable content area -->
        <div class="h-full overflow-y-auto">
            <!-- Public items section -->
            <div class="mt-4">
                <div
                    v-if="sidebarState === 'open'"
                    class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
                >
                    آیتم‌های عمومی
                </div>
                <div
                    v-for="item in filteredPublicItems"
                    :key="item.name"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo(item.route)"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div :class="item.icon" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">
                        {{ item.name }}
                    </span>
                </div>
            </div>

            <!-- Categories section -->
            <div v-if="sidebarState !== 'semi-open'" class="mt-4">
                <div
                    v-if="sidebarState === 'open'"
                    class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
                >
                    دسته‌بندی‌ها
                </div>
                <div
                    v-for="category in visibleCategories"
                    :key="category.name"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="searchCategory(category.name)"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div :class="getIconForCategory(category.name)" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">{{
                        category.name
                    }}</span>
                </div>

                <!-- Show more button -->
                <div
                    v-if="categories.length > 5 && sidebarState === 'open'"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="toggleShowMoreCategories"
                >
                    <div
                        class="w-10 flex items-center justify-center text-lg"
                        :class="[showMoreCategories ? 'i-fa6-solid:chevron-up' : 'i-fa6-solid:chevron-down']"
                    />
                    <span class="mr-4 text-base leading-[1.65]">{{
                        showMoreCategories ? "نمایش کمتر" : "نمایش بیشتر"
                    }}</span>
                </div>
            </div>

            <!-- Theme toggle section -->
            <div class="mt-4">
                <div
                    v-if="sidebarState === 'open'"
                    class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
                >
                    حالت پوسته
                </div>
                <div
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    data-testid="theme-toggle"
                    @click="emitToggleTheme"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div :class="theme === 'light' ? 'i-fa6-solid:moon' : 'i-fa6-solid:sun'" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">
                        {{ theme === "light" ? "حالت تاریک" : "حالت روشن" }}
                    </span>
                </div>
            </div>

            <!-- Auth section -->
            <div class="mt-4">
                <div
                    v-if="!authenticated && sidebarState === 'open'"
                    class="px-4 py-2 text-sm text-gray-500 leading-[1.65]"
                >
                    حساب کاربری
                </div>
                <div
                    v-if="!authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo('/login')"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div class="i-fa6-solid:right-to-bracket" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">ورود</span>
                </div>
                <div
                    v-if="!authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="navigateTo('/register')"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div class="i-fa6-solid:user-plus" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">ثبت نام</span>
                </div>
                <div
                    v-if="authenticated"
                    class="mx-2 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
                    @click="logout"
                >
                    <div class="w-10 flex items-center justify-center text-lg leading-[1.7]" :class="[]">
                        <div class="i-fa6-solid:right-from-bracket" />
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">خروج از حساب</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Overlay for watch page and mobile (only show overlay when it should close the sidebar) -->
    <div
        v-if="(isWatchPage || isMobile) && sidebarState !== 'closed'"
        class="fixed inset-0 z-40 bg-black bg-opacity-50"
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
        isMobile: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["toggle-theme"],
    data() {
        return {
            showMoreCategories: false,
            publicItems: [
                { name: "صفحه اصلی", route: "/", icon: "i-fa6-solid:house" },
                { name: "خوراک", route: "/feed", icon: "i-fa6-solid:rss" },
                { name: "اشتراک‌ها", route: "/subscriptions", icon: "i-fa6-solid:bell" },
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
            // Use dedicated user API for authentication if available, fallback to main API
            return import.meta.env.VITE_USER_API || import.meta.env.VITE_PIPED_API || "https://pipedapi.kavin.rocks";
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

/* Sidebar navigation items styling */
.mx-2.flex.cursor-pointer.items-center.rounded-lg.px-4.py-3 {
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
    color: #000; /* black for light mode */
}

.mx-2.flex.cursor-pointer.items-center.rounded-lg.px-4.py-3:hover {
    color: #000; /* black for light mode */
    text-decoration-color: #000; /* underline appears on hover */
}

.dark .mx-2.flex.cursor-pointer.items-center.rounded-lg.px-4.py-3 {
    color: #fff; /* white for dark mode */
}

.dark .mx-2.flex.cursor-pointer.items-center.rounded-lg.px-4.py-3:hover {
    color: #fff; /* white for dark mode */
    text-decoration-color: #fff; /* underline appears on hover in dark mode */
}
</style>

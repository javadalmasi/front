<template>
    <div
        :class="[
            'fixed top-0 right-0 h-full z-50 transition-all duration-300 ease-in-out',
            'bg-gray-100 dark:bg-dark-900 border-l border-gray-200 dark:border-dark-100',
            sidebarState === 'closed' ? 'w-0 overflow-hidden' : sidebarState === 'semi-open' ? 'w-20' : 'w-64',
        ]"
        :style="{ height: '100vh', direction: 'rtl' }"
    >
        <!-- Sidebar header with collapse/expand toggle -->
        <div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-dark-100">
            <div v-if="sidebarState === 'open'" class="text-xl font-bold">فهرست</div>
            <button class="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-dark-100" @click="toggleSidebarState">
                <div v-if="sidebarState === 'semi-open'" class="i-fa6-solid:chevron-left text-lg"></div>
                <div v-else-if="sidebarState === 'open'" class="i-fa6-solid:chevron-right text-lg"></div>
            </button>
        </div>

        <!-- Scrollable content area -->
        <div class="overflow-y-auto" style="height: calc(100vh - 120px)">
            <!-- Public items section -->
            <div class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    آیتم‌های عمومی
                </div>
                <div
                    v-for="item in publicItems"
                    :key="item.name"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="navigateTo(item.route)"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div :class="[sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl', item.icon]"></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">
                        {{ item.name }}
                    </span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">{{ item.name }}</span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">{{ item.name }}</span>
                </div>
            </div>

            <!-- Categories section - only shown in open state -->
            <div v-if="sidebarState !== 'semi-open'" class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    دسته‌بندی‌ها
                </div>
                <div
                    v-for="category in visibleCategories"
                    :key="category.name"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="searchCategory(category.name)"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div
                            :class="[
                                sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl',
                                getIconForCategory(category.name),
                            ]"
                        ></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">{{ category.name }}</span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">{{ category.name }}</span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">{{ category.name }}</span>
                </div>

                <!-- Show more button if there are more categories -->
                <div
                    v-if="categories.length > 5 && sidebarState === 'open'"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="toggleShowMoreCategories"
                >
                    <div
                        class="text-xl"
                        :class="showMoreCategories ? 'i-fa6-solid:chevron-up' : 'i-fa6-solid:chevron-down'"
                    ></div>
                    <span class="mr-4">{{ showMoreCategories ? "نمایش کمتر" : "نمایش بیشتر" }}</span>
                </div>
            </div>

            <!-- Theme toggle section -->
            <div class="mt-4">
                <div v-if="sidebarState === 'open'" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    حالت پوسته
                </div>
                <!-- Single theme toggle button that cycles between light/dark -->
                <div
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="toggleTheme"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div
                            :class="[
                                sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl',
                                currentTheme === 'light' ? 'i-fa6-solid:moon' : 'i-fa6-solid:sun',
                            ]"
                        ></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">
                        {{ currentTheme === "light" ? "حالت تاریک" : "حالت روشن" }}
                    </span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">
                        {{ currentTheme === "light" ? "حالت تاریک" : "حالت روشن" }}
                    </span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">
                        {{ currentTheme === "light" ? "حالت تاریک" : "حالت روشن" }}
                    </span>
                </div>
            </div>

            <!-- Auth section - in line with other items -->
            <div class="mt-4">
                <div
                    v-if="!authenticated && sidebarState === 'open'"
                    class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
                >
                    حساب کاربری
                </div>
                <div
                    v-if="!authenticated"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="navigateTo('/login')"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div
                            :class="['i-fa6-solid:sign-in-alt', sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl']"
                        ></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">ورود</span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">ورود</span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">ورود</span>
                </div>
                <div
                    v-if="!authenticated"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="navigateTo('/register')"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div
                            :class="['i-fa6-solid:user-plus', sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl']"
                        ></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">ثبت نام</span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">ثبت نام</span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">ثبت نام</span>
                </div>

                <div
                    v-if="authenticated"
                    class="flex cursor-pointer items-center px-4 py-2 font-medium hover:bg-gray-200 dark:hover:bg-dark-100"
                    @click="logout"
                >
                    <div
                        class="w-10 flex items-center justify-center"
                        :class="sidebarState === 'semi-open' ? 'h-10' : 'h-auto'"
                    >
                        <div
                            :class="['i-fa6-solid:sign-out-alt', sidebarState === 'semi-open' ? 'text-2xl' : 'text-xl']"
                        ></div>
                    </div>
                    <span v-if="sidebarState === 'open'" class="mr-4">خروج از حساب</span>
                    <span v-if="sidebarState === 'closed'" class="sr-only">خروج از حساب</span>
                    <span v-if="sidebarState === 'semi-open'" class="sr-only">خروج از حساب</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Overlay for mobile view -->
    <div
        v-if="isMobile && sidebarState !== 'closed'"
        class="fixed inset-0 z-40 bg-black bg-opacity-50"
        @click="closeSidebar"
    ></div>
</template>

<script>
export default {
    name: "AppSidebar",
    data() {
        return {
            currentTheme: "dark", // Add current theme state
            sidebarState: "semi-open", // "closed", "semi-open", "open"
            showMoreCategories: false,
            isMobile: false,
            publicItems: [
                { name: "صفحه اصلی", route: "/", icon: "i-fa6-solid:house" },
                { name: "خوراک", route: "/feed", icon: "i-fa6-solid:rss" },
                { name: "پرطرفدار", route: "/trending", icon: "i-fa6-solid:fire" },
                { name: "تاریخچه", route: "/history", icon: "i-fa6-solid:history" },
                { name: "لیست‌پخش‌ها", route: "/playlists", icon: "i-fa6-solid:bars" },
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
        visibleCategories() {
            if (this.showMoreCategories || this.sidebarState === "semi-open") {
                return this.categories;
            } else {
                return this.categories.slice(0, 5);
            }
        },
    },
    mounted() {
        this.checkMobile();
        window.addEventListener("resize", this.checkMobile);
        window.addEventListener("toggleDesktopSidebar", this.handleDesktopToggle);
        // Apply theme after component is mounted
        this.applyTheme(this.currentTheme);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.checkMobile);
        window.removeEventListener("toggleDesktopSidebar", this.handleDesktopToggle);
    },
    created() {
        this.currentTheme = this.getCurrentTheme();
        this.applyTheme(this.currentTheme);
    },

    methods: {
        toggleSidebarState() {
            if (this.isMobile) {
                // On mobile, only toggle between open and closed
                this.sidebarState = this.sidebarState === "closed" ? "open" : "closed";
            } else {
                // On desktop, cycle through all three states
                if (this.sidebarState === "closed") {
                    this.sidebarState = "semi-open";
                } else if (this.sidebarState === "semi-open") {
                    this.sidebarState = "open";
                } else {
                    this.sidebarState = "closed";
                }
            }
            // Dispatch event to notify parent about state change
            window.dispatchEvent(
                new CustomEvent("sidebarStateChanged", {
                    detail: { state: this.sidebarState },
                }),
            );
        },
        closeSidebar() {
            this.sidebarState = "closed";
            // Dispatch event to notify parent about state change
            window.dispatchEvent(
                new CustomEvent("sidebarStateChanged", {
                    detail: { state: this.sidebarState },
                }),
            );
        },
        checkMobile() {
            this.isMobile = window.innerWidth < 768; // Using md breakpoint (768px)
            // On mobile, default to closed state
            if (this.isMobile && this.sidebarState === "semi-open") {
                this.sidebarState = "closed";
            }
        },
        navigateTo(route) {
            this.$router.push(route);
            if (this.isMobile) {
                this.closeSidebar(); // Close sidebar on mobile after navigation
            }
        },
        searchCategory(categoryName) {
            this.$router.push({
                name: "SearchResults",
                query: { search_query: categoryName },
            });
            if (this.isMobile) {
                this.closeSidebar(); // Close sidebar on mobile after search
            }
        },
        toggleShowMoreCategories() {
            this.showMoreCategories = !this.showMoreCategories;
        },
        getIconForCategory(categoryName) {
            // Map categories to appropriate icons
            const iconMap = {
                موسیقی: "i-fa6-solid:music",
                ورزش: "i-fa6-solid:football",
                بازی: "i-fa6-solid:gamepad",
                آموزش: "i-fa6-solid:graduation-cap",
                سرگرمی: "i-fa6-solid:gamepad",
                اخبار: "i-fa6-solid:newspaper",
                علمی: "i-fa6-solid:flask",
                کمدی: "i-fa6-solid:face-laugh",
                سیاست: "i-fa6-solid:landmark",
                فناوری: "i-fa6-solid:laptop",
                هنر: "i-fa6-solid:palette",
                غذا: "i-fa6-solid:utensils",
                "سبک زندگی": "i-fa6-solid:heart",
                سفر: "i-fa6-solid:plane",
                مالی: "i-fa6-solid:money-bill",
                سلامت: "i-fa6-solid:heart-pulse",
                کودکان: "i-fa6-solid:child",
                مستند: "i-fa6-solid:film",
                "فیلم و سریال": "i-fa6-solid:tv",
                انیمیشن: "i-fa6-solid:crown",
            };
            return iconMap[categoryName] || "i-fa6-solid:tag"; // Default to tag icon
        },
        logout() {
            // reset the auth token
            localStorage.removeItem("authToken" + this.hashCode(this.authApiUrl()));
            // redirect to trending page
            window.location = import.meta.env.BASE_URL;
        },
        handleDesktopToggle() {
            // On desktop, only toggle between semi-open and open
            if (!this.isMobile) {
                if (this.sidebarState === "semi-open") {
                    this.sidebarState = "open";
                } else if (this.sidebarState === "open") {
                    this.sidebarState = "semi-open";
                } else {
                    // If it's closed, open to semi-open
                    this.sidebarState = "semi-open";
                }
            } else {
                // On mobile, toggle between open and closed
                if (this.sidebarState === "closed") {
                    this.sidebarState = "open";
                } else {
                    this.sidebarState = "closed";
                }
            }
            // Dispatch event to notify parent about state change
            window.dispatchEvent(
                new CustomEvent("sidebarStateChanged", {
                    detail: { state: this.sidebarState },
                }),
            );
        },
        // The following methods need to be copied from the main mixin
        getAuthToken() {
            const key = "authToken" + this.hashCode(this.authApiUrl());
            return localStorage.getItem(key) || undefined;
        },
        authApiUrl() {
            return import.meta.env.VITE_PIPED_API || "https://pipedapi.kavin.rocks";
        },
        hashCode(s) {
            return s.split("").reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
        // Theme-related methods
        toggleTheme() {
            // Get current theme from localStorage or default to dark
            const currentTheme = localStorage.getItem("theme") || "dark";
            // Toggle between light and dark
            const newTheme = currentTheme === "light" ? "dark" : "light";

            localStorage.setItem("theme", newTheme);
            this.currentTheme = newTheme;
            this.applyTheme(newTheme);
        },
        applyTheme(theme) {
            // Get theme preference similar to the existing preferences functionality
            let themePref = theme;
            const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
            const themes = {
                dark: "dark",
                light: "light",
                auto: darkModePreference.matches ? "dark" : "light",
            };

            const effectiveTheme = themes[themePref];

            // Apply theme to document root
            const root = document.querySelector(":root");
            if (effectiveTheme === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }

            // Update theme color meta tag
            this.changeTitleBarColor(effectiveTheme);
        },
        // Initialize and get the current theme
        getCurrentTheme() {
            return localStorage.getItem("theme") || "dark"; // Get the stored preference (dark/light/auto)
        },
        changeTitleBarColor(theme) {
            const effectiveTheme = theme;
            const currentColor = { dark: "#0F0F0F", light: "#FFF" };
            const themeColor = document.querySelector("meta[name='theme-color']");
            themeColor.setAttribute("content", currentColor[effectiveTheme]);
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

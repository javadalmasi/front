<template>
    <div class="reset min-h-screen w-full flex flex-col antialiased" :class="[theme]">
        <div class="flex-1">
            <NavBar v-if="!isEmbedPage" :sidebar-state="sidebarState" :theme="theme" @toggle-sidebar="toggleSidebar" />
            <div class="flex">
                <app-sidebar
                    v-if="!isEmbedPage"
                    :sidebar-state="sidebarState"
                    :is-watch-page="isWatchPage"
                    :theme="theme"
                    :is-mobile="isMobile"
                    @toggle-theme="toggleTheme"
                />
                <div
                    class="flex-1"
                    :class="{
                        'md:pl-1vw md:pt-1 md:pb-5 p-0 m-0': !isEmbedPage,
                        'md:pr-64 md:mr-1vw': sidebarState === 'open' && !isWatchPage,
                        'md:pr-20 md:mr-1vw': sidebarState === 'semi-open' && !isWatchPage,
                        'md:pr-1vw p-0 m-0': sidebarState === 'closed' || isWatchPage,
                        'lt-md:pr-0 lt-md:pl-0': isMobile,
                    }"
                >
                    <slot />
                </div>
            </div>
        </div>

        <FooterComponent
            v-if="!isEmbedPage"
            :class="{
                'md:pr-64': sidebarState === 'open' && !isWatchPage,
                'md:pr-20': sidebarState === 'semi-open' && !isWatchPage,
                'pr-0': sidebarState === 'closed' || isWatchPage,
            }"
        />
    </div>
</template>

<script>
import NavBar from "~/components/NavBar.vue";
import FooterComponent from "~/components/FooterComponent.vue";
import AppSidebar from "~/components/Sidebar.vue";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

export default {
    components: {
        NavBar,
        FooterComponent,
        AppSidebar,
    },
    data() {
        return {
            theme: "dark",
            sidebarState: "semi-open",
            isWatchPage: false,
            isMobile: false,
            routeChangeTimeout: null,
            previousSidebarState: "semi-open", // Track previous state when leaving non-watch pages
        };
    },
    computed: {
        isEmbedPage() {
            return this.$route.path.startsWith("/embed");
        },
    },
    watch: {
        $route(to) {
            // Debounce to prevent rapid state changes
            if (this.routeChangeTimeout) {
                clearTimeout(this.routeChangeTimeout);
            }

            this.routeChangeTimeout = setTimeout(() => {
                const wasWatchPage = this.isWatchPage;
                const previousState = this.sidebarState; // Preserve current state before changing isWatchPage
                this.isWatchPage = to.name === "watch-v" || to.name === "results";

                if (this.isWatchPage) {
                    // On watch pages, always close the sidebar, but remember previous state
                    this.previousSidebarState = previousState;
                    this.sidebarState = "closed";
                } else if (wasWatchPage && !this.isMobile && this.previousSidebarState) {
                    // When returning from watch page, restore previous state (open or semi-open)
                    this.sidebarState = this.previousSidebarState;
                } else if (!wasWatchPage && this.sidebarState === "closed" && !this.isMobile && !this.isMobile) {
                    // Only set to semi-open if we're not coming from a watch page
                    // This prevents state conflicts when switching from watch to non-watch pages
                    this.sidebarState = "semi-open";
                }
            }, 100); // Small delay to prevent rapid toggling
        },
    },
    mounted() {
        window.addEventListener("sidebarStateChanged", this.updateSidebarState);
        this.setTheme();
        darkModePreference.addEventListener("change", this.setTheme);

        this.checkIsMobile();
        window.addEventListener("resize", this.checkIsMobile);

        this.isWatchPage = this.$route.name === "watch-v" || this.$route.name === "results";
        if (this.isWatchPage) {
            this.previousSidebarState = this.sidebarState; // Remember the state before switching to watch
            this.sidebarState = "closed";
        }

        if ("indexedDB" in window) {
            const request = indexedDB.open("piped-db", 6);
            request.onupgradeneeded = ev => {
                const db = request.result;
                console.log("Upgrading object store.");
                if (!db.objectStoreNames.contains("watch_history")) {
                    const store = db.createObjectStore("watch_history", { keyPath: "videoId" });
                    store.createIndex("video_id_idx", "videoId", { unique: true });
                    store.createIndex("id_idx", "id", { unique: true, autoIncrement: true });
                }
                if (ev.oldVersion < 2) {
                    const store = request.transaction.objectStore("watch_history");
                    store.createIndex("watchedAt", "watchedAt", { unique: false });
                }
                if (!db.objectStoreNames.contains("playlist_bookmarks")) {
                    const store = db.createObjectStore("playlist_bookmarks", { keyPath: "playlistId" });
                    store.createIndex("playlist_id_idx", "playlistId", { unique: true });
                    store.createIndex("id_idx", "id", { unique: true, autoIncrement: true });
                }
                if (!db.objectStoreNames.contains("channel_groups")) {
                    const store = db.createObjectStore("channel_groups", { keyPath: "groupName" });
                    store.createIndex("groupName", "groupName", { unique: true });
                }
                if (!db.objectStoreNames.contains("playlists")) {
                    const playlistStore = db.createObjectStore("playlists", { keyPath: "playlistId" });
                    playlistStore.createIndex("playlistId", "playlistId", { unique: true });
                    const playlistVideosStore = db.createObjectStore("playlist_videos", { keyPath: "videoId" });
                    playlistVideosStore.createIndex("videoId", "videoId", { unique: true });
                }
                // migration to fix an invalid previous length of channel ids: 11 -> 24
                (async () => {
                    if (ev.oldVersion < 6) {
                        const subscriptions = await this.fetchSubscriptions();
                        const channelGroups = await this.getChannelGroups();
                        for (let group of channelGroups) {
                            for (let i = 0; i < group.channels.length; i++) {
                                const tooShortChannelId = group.channels[i];
                                const foundChannel = subscriptions.find(
                                    channel => channel.url.substr(-11) == tooShortChannelId,
                                );
                                if (foundChannel) group.channels[i] = foundChannel.url.substr(-24);
                            }
                            this.createOrUpdateChannelGroup(group);
                        }
                    }
                })();
            };
            request.onsuccess = e => {
                window.db = e.target.result;
            };
        } else console.log("This browser doesn't support IndexedDB");

        const App = this;

        (async function () {
            const locale = "fa"; // Always use Persian
            if (locale !== App.TimeAgoConfig.locale) {
                const localeTime = await import(`~/node_modules/javascript-time-ago/locale/${locale}.json`)
                    .catch(() => null)
                    .then(module => module?.default);
                if (localeTime) {
                    App.TimeAgo.addLocale(localeTime);
                    App.TimeAgoConfig.locale = locale;
                }
            }
            if (window.i18n.global.locale.value !== locale) {
                if (!window.i18n.global.availableLocales.includes(locale)) {
                    const messages = await import(`~/locales/${locale}.json`).then(module => module.default);
                    window.i18n.global.setLocaleMessage(locale, messages);
                }
                window.i18n.global.locale.value = locale;
            }
        })();
    },
    beforeUnmount() {
        window.removeEventListener("sidebarStateChanged", this.updateSidebarState);
        darkModePreference.removeEventListener("change", this.setTheme);
        window.removeEventListener("resize", this.checkIsMobile);
        if (this.routeChangeTimeout) {
            clearTimeout(this.routeChangeTimeout);
        }
    },
    methods: {
        checkIsMobile() {
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile) {
                this.sidebarState = "closed";
            }
        },
        toggleSidebar() {
            if (this.isMobile || this.isWatchPage) {
                this.sidebarState = this.sidebarState === "closed" ? "open" : "closed";
            } else {
                const states = ["open", "semi-open", "closed"];
                const currentIndex = states.indexOf(this.sidebarState);
                this.sidebarState = states[(currentIndex + 1) % states.length];

                // Update previous state when toggling on non-watch pages
                if (!this.isWatchPage && this.sidebarState !== "closed") {
                    this.previousSidebarState = this.sidebarState;
                }
            }
        },
        updateSidebarState(event) {
            this.sidebarState = event.detail.state;
        },
        toggleTheme() {
            const newTheme = this.theme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", newTheme);
            this.setTheme();
        },
        setTheme() {
            // Default to 'dark' if no theme is saved in localStorage
            this.theme = localStorage.getItem("theme") || "dark";

            if (this.theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            this.changeTitleBarColor();
            this.updateFavicon();
        },
        changeTitleBarColor() {
            const currentColor = { dark: "#0F0F0F", light: "#FFF" };
            const themeColor = document.querySelector("meta[name='theme-color']");
            if (themeColor) {
                themeColor.setAttribute("content", currentColor[this.theme]);
            }
        },
        updateFavicon() {
            // Get the current favicon link element
            const favicon = document.querySelector("link[rel='icon']");
            if (favicon) {
                // Update the favicon based on current theme
                if (this.theme === "dark") {
                    favicon.href = "/img/icons/dark-logo-32x32.png"; // Use dark logo for dark theme
                } else {
                    favicon.href = "/img/icons/light-logo-32x32.png"; // Use light logo for light theme
                }
            }
        },
    },
};
</script>

<style>
/* RTL support */
:root {
    direction: rtl;
}

/* LTR elements that should remain LTR (like video player) */
.video-player,
.shaka-player-container,
.video-container,
.video-controls,
.shaka-text-container,
.shaka-bottom-controls,
.shaka-video-container,
.shaka-video-cast-button,
.shaka-overflow-menu,
.shaka-current-time,
.shaka-seek-bar,
.shaka-play-button,
.shaka-volume-bar,
.shaka-fullscreen-button,
.shaka-captions-button,
.shaka-quality-button,
.shaka-playback-rate-button,
.shaka-airplay-button,
.shaka-seek-live,
.shaka-mute-button,
.skip-segment-button,
#preview-container,
#preview {
    direction: ltr !important;
}
h1,
p,
a,
b {
    unicode-bidi: plaintext;
    text-align: start;
}

:root {
    color-scheme: only light;
}

::-webkit-scrollbar {
    background-color: #d1d5db;
}

::-webkit-scrollbar-thumb {
    background-color: #4b4f52;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #5b6469;
}

::-webkit-scrollbar-thumb:active {
    background-color: #485053;
}

::-webkit-scrollbar-corner {
    background-color: #0b0e0f;
}

:root {
    scrollbar-color: #4b4f52 #d1d5db;
}

.dark ::-webkit-scrollbar {
    background-color: #15191a;
}

.dark ::-webkit-scrollbar-thumb {
    background-color: #4b4f52;
}

.dark ::-webkit-scrollbar-thumb:hover {
    background-color: #5b6469;
}

.dark ::-webkit-scrollbar-thumb:active {
    background-color: #485053;
}

.dark ::-webkit-scrollbar-corner {
    background-color: #0b0e0f;
}

:root.dark {
    scrollbar-color: #4b4f52 #15191a;
}

* {
    @apply font-sans;
}

/* Persian Typography Standards - Updated for better readability */
h1 {
    @apply !text-[2.25rem] leading-[1.2] font-bold; /* Larger for Persian titles */
}
h2 {
    @apply !text-[1.875rem] leading-[1.25] font-bold; /* Larger for Persian subtitles */
}
h3 {
    @apply !text-[1.5rem] leading-[1.3] font-semibold; /* Larger for Persian headings */
}
h4 {
    @apply !text-[1.25rem] leading-[1.35] font-semibold; /* Larger for Persian subheadings */
}
h5 {
    @apply !text-[1.125rem] leading-[1.4] font-medium; /* Larger for Persian minor headings */
}
h6 {
    @apply !text-[1rem] leading-[1.45] font-medium; /* Larger for Persian text headings */
}

/* Persian body text standards */
.text-xs {
    @apply text-[0.75rem] leading-[1.6]; /* 12px, line height 1.6 for Persian */
}
.text-sm {
    @apply text-[0.875rem] leading-[1.65]; /* 14px, line height 1.65 for Persian */
}
.text-base {
    @apply text-[1rem] leading-[1.7]; /* 16px, line height 1.7 for Persian */
}
.text-lg {
    @apply text-[1.125rem] leading-[1.7]; /* 18px, line height 1.7 for Persian */
}
.text-xl {
    @apply text-[1.25rem] leading-[1.65]; /* 20px, line height 1.65 for Persian */
}
.text-2xl {
    @apply text-[1.5rem] leading-[1.55]; /* 24px, line height 1.55 for Persian */
}
.text-3xl {
    @apply text-[1.875rem] leading-[1.45]; /* 30px, line height 1.45 for Persian */
}
.text-4xl {
    @apply text-[2.25rem] leading-[1.35]; /* 36px, line height 1.35 for Persian */
}
.text-5xl {
    @apply text-[3rem] leading-[1.25]; /* 48px, line height 1.25 for Persian */
}
.text-9xl {
    @apply text-[4.5rem] leading-[1.15]; /* 72px, line height 1.15 for Persian */
}

/* Adjusted for Persian typography */
.table {
    @apply w-full text-lg leading-[1.7] text-left font-light border; /* Better line height for Persian */
}

.link {
    @apply focus:text-red-500 hover:text-red-500 leading-[1.5]; /* Better line height for Persian links */
}

.link-secondary {
    @apply hover:text-dark-400 focus:text-dark-400 underline underline-dark-400 leading-[1.5]; /* Better line height for Persian links */
}

.dark .link {
    @apply focus:text-red-400 hover:text-red-400 leading-[1.5]; /* Better line height for Persian links */
}

.dark .link-secondary {
    @apply text-gray-300 hover:(text-gray-400 underline underline-gray-400) leading-[1.5]; /* Better line height for Persian links */
}

.video-grid {
    @apply grid grid-cols-1 mx-2 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 col-auto lt-md:gap-x-3 md:gap-x-6 gap-y-5;
}

/* Base button styles with consistent sizing, spacing, and hover effects */
.btn {
    @apply py-2 px-4 rounded-xl cursor-pointer inline-block transition-all duration-200 ease-in-out;
}

.btn:hover {
    @apply bg-gray-400 text-white;
}

.btn:active {
    @apply transform scale-95;
}

/* Primary button variant - for main actions */
.btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* Secondary button variant - for supporting actions */
.btn-secondary {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800;
}

/* Danger button variant - for destructive actions */
.btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700;
}

/* Success button variant - for confirmation actions */
.btn-success {
    @apply bg-green-600 text-white hover:bg-green-700;
}

/* Warning button variant - for cautionary actions */
.btn-warning {
    @apply bg-yellow-500 text-white hover:bg-yellow-600;
}

/* Info button variant - for informational actions */
.btn-info {
    @apply bg-indigo-600 text-white hover:bg-indigo-700;
}

/* Outline button variant - for subtle actions */
.btn-outline {
    @apply border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200 hover:text-gray-900;
}

/* Small button size */
.btn-sm {
    @apply py-1 px-3 text-sm leading-[1.6];
}

/* Large button size */
.btn-lg {
    @apply py-3 px-6 text-lg leading-[1.7];
}

/* Extra small button size */
.btn-xs {
    @apply py-0.5 px-2 text-xs leading-[1.6];
}

/* Extra large button size */
.btn-xl {
    @apply py-4 px-8 text-xl leading-[1.65];
}

/* Block button - full width */
.btn-block {
    @apply w-full;
}

/* Rounded button - circular shape */
.btn-rounded {
    @apply rounded-full;
}

/* Square button - minimal padding */
.btn-square {
    @apply p-2 aspect-square;
}

/* Responsive button sizes for different screen sizes */
.btn-responsive-sm {
    @apply py-1 px-2 text-sm leading-[1.6] lt-md:py-0.5 lt-md:px-1.5 lt-md:text-xs;
}

.btn-responsive-md {
    @apply py-2 px-4 text-base leading-[1.65] lt-md:py-1.5 lt-md:px-3 lt-md:text-sm;
}

.btn-responsive-lg {
    @apply py-3 px-6 text-lg leading-[1.7] lt-md:py-2 lt-md:px-4 lt-md:text-base;
}

/* Full width button on mobile */
.btn-mobile-block {
    @apply w-full lt-md:w-full;
}

/* Responsive padding adjustments */
.btn-responsive-padding {
    @apply px-4 lt-md:px-3 sm:px-5;
}

/* Responsive margin adjustments */
.btn-responsive-margin {
    @apply mx-2 lt-md:mx-1 sm:mx-3;
}

/* Disabled button state */
.btn:disabled,
.btn.disabled {
    @apply opacity-50 cursor-not-allowed pointer-events-none;
}

/* Focus state for accessibility */
.btn:focus {
    @apply outline-none ring-2 ring-blue-500 ring-opacity-50;
}

/* Input and select base styles */
.input,
.btn {
    @apply w-auto text-gray-700 bg-gray-200 border border-gray-300;
}

.input {
    @apply h-8;
}

/* Enhanced select styling to match site appearance */
.select {
    @apply w-auto text-gray-700 bg-gray-200 border border-gray-300;
    @apply h-8 px-2.5 rounded-lg;
    /* Remove default appearance to customize */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
    padding-right: 2rem;
}

.select:focus {
    @apply outline-style: solid;
    outline-width: 2px;
}

.checkbox {
    @apply h-4 w-4;
}

/* Reset and dark theme styles */
.reset {
    @apply text-black bg-white;
}

.dark {
    @apply text-white bg-dark-900;
}

.dark .input,
.dark .btn {
    @apply text-gray-300 bg-dark-500 border-dark-400;
}

/* Dark theme select styles */
.dark .select {
    @apply text-gray-300 bg-dark-500 border-dark-400;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
}

.dark .select:focus {
    @apply outline-style: solid;
    outline-width: 2px;
}

.dark .btn:hover {
    @apply bg-dark-400 text-white;
}

/* Dark theme variants */
.dark .btn-primary {
    @apply bg-blue-700 text-white hover:bg-blue-600;
}

.dark .btn-secondary {
    @apply bg-dark-300 text-gray-200 hover:bg-dark-100 hover:text-gray-300;
}

.dark .btn-danger {
    @apply bg-red-700 text-white hover:bg-red-600;
}

.dark .btn-success {
    @apply bg-green-700 text-white hover:bg-green-600;
}

.dark .btn-warning {
    @apply bg-yellow-600 text-white hover:bg-yellow-500;
}

.dark .btn-info {
    @apply bg-indigo-700 text-white hover:bg-indigo-600;
}

.dark .btn-outline {
    @apply border-2 border-dark-400 bg-transparent text-gray-300 hover:bg-dark-400 hover:text-white;
}

.dark .btn:focus {
    @apply ring-2 ring-blue-400 ring-opacity-75;
}

.input {
    @apply px-2.5 rounded-3xl;
}

.input:focus {
    @apply outline-red-500;
    outline-style: solid;
    outline-width: 2px;
    box-shadow: 0 0 15px rgba(239, 68, 68, 1);
}

hr {
    @apply !mt-2 !mb-3 border-gray-300;
}

.dark hr {
    @apply border-dark-100;
}

h1,
h2 {
    @apply m-0 font-bold;
}

.table {
    @apply w-full text-lg text-left font-light border;
}

.line {
    @apply px-2.5 py-0.25 my-0.45 rounded-xl bg-dark-900;
}

.dark .line {
    @apply bg-white;
}

.thumbnail-overlay {
    @apply rounded-md absolute bg-black text-white bg-opacity-75 px-5px;
}

.thumbnail-right {
    @apply bottom-5px right-5px;
}
.thumbnail-left {
    @apply bottom-5px left-5px text-xs font-bold bg-red-600 uppercase;
}
</style>

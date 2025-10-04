<template>
    <div class="reset min-h-screen w-full flex flex-col antialiased" :class="[theme]">
        <div class="flex-1">
            <NavBar :sidebar-state="sidebarState" :theme="theme" @toggle-sidebar="toggleSidebar" />
            <div class="flex">
                <app-sidebar
                    :sidebar-state="sidebarState"
                    :is-watch-page="isWatchPage"
                    :theme="theme"
                    class="lt-md:hidden"
                    @toggle-theme="toggleTheme"
                />
                <div
                    class="flex-1 px-1vw py-5"
                    :class="{
                        'md:pr-64': sidebarState === 'open' && !isWatchPage,
                        'md:pr-20': sidebarState === 'semi-open' && !isWatchPage,
                        'pr-0': sidebarState === 'closed' || isWatchPage,
                    }"
                >
                    <router-view v-slot="{ Component }">
                        <keep-alive :max="5">
                            <component :is="Component" :key="$route.fullPath" />
                        </keep-alive>
                    </router-view>
                </div>
            </div>
        </div>

        <FooterComponent
            :class="{
                'md:pr-64': sidebarState === 'open' && !isWatchPage,
                'md:pr-20': sidebarState === 'semi-open' && !isWatchPage,
                'pr-0': sidebarState === 'closed' || isWatchPage,
            }"
        />
    </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import FooterComponent from "./components/FooterComponent.vue";
import AppSidebar from "./components/Sidebar.vue";

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
        };
    },
    watch: {
        $route(to) {
            this.isWatchPage = to.name === "WatchVideo";
            if (this.isWatchPage) {
                this.sidebarState = "closed";
            } else if (this.sidebarState === "closed" && !this.isMobile) {
                this.sidebarState = "semi-open";
            }
        },
    },
    mounted() {
        window.addEventListener("sidebarStateChanged", this.updateSidebarState);
        this.setTheme();
        darkModePreference.addEventListener("change", this.setTheme);

        this.checkIsMobile();
        window.addEventListener("resize", this.checkIsMobile);

        this.isWatchPage = this.$route.name === "WatchVideo";
        if (this.isWatchPage) {
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
                const localeTime = await import(`../node_modules/javascript-time-ago/locale/${locale}.json`)
                    .catch(() => null)
                    .then(module => module?.default);
                if (localeTime) {
                    App.TimeAgo.addLocale(localeTime);
                    App.TimeAgoConfig.locale = locale;
                }
            }
            if (window.i18n.global.locale.value !== locale) {
                if (!window.i18n.global.availableLocales.includes(locale)) {
                    const messages = await import(`./locales/${locale}.json`).then(module => module.default);
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
        },
        changeTitleBarColor() {
            const currentColor = { dark: "#0F0F0F", light: "#FFF" };
            const themeColor = document.querySelector("meta[name='theme-color']");
            if (themeColor) {
                themeColor.setAttribute("content", currentColor[this.theme]);
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

.video-grid {
    @apply grid grid-cols-1 mx-2 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 col-auto lt-md:gap-x-3 md:gap-x-6 gap-y-5;
}

.btn {
    @apply py-2 lt-md:px-2 md:px-4 rounded-3xl cursor-pointer inline-block hover:bg-gray-500 hover:text-white;
}

.reset {
    @apply text-black bg-white;
}

.dark {
    @apply text-white bg-dark-900;
}

.input,
.select,
.btn {
    @apply w-auto text-gray-600 bg-gray-300;
}

.input,
.select {
    @apply h-8;
}

.checkbox {
    @apply h-4 w-4;
}

.dark .input,
.dark .select,
.dark .btn {
    @apply text-gray-400 bg-dark-400;
}

.dark .btn {
    @apply hover:bg-dark-300;
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

h1 {
    @apply !text-5xl;
}

h2 {
    @apply !text-3xl;
}

.table {
    @apply w-full text-lg text-left font-light border;
}

.link {
    @apply focus:text-red-500 hover:text-red-500;
}

.link-secondary {
    @apply hover:text-dark-400 focus:text-dark-400 underline underline-dark-400;
}

.dark .link {
    @apply focus:text-red-400 hover:text-red-400;
}

.dark .link-secondary {
    @apply text-gray-300 hover:(text-gray-400 underline underline-gray-400);
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

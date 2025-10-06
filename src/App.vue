<template>
    <div class="bg-main text-main min-h-screen w-full flex flex-col antialiased">
        <div class="flex-1">
            <NavBar v-if="!isEmbedPage" :sidebar-state="sidebarState" :theme="theme" @toggle-sidebar="toggleSidebar" />
            <div class="flex">
                <app-sidebar
                    v-if="!isEmbedPage"
                    :sidebar-state="sidebarState"
                    :is-watch-page="isWatchPage"
                    :theme="theme"
                    class="lt-md:hidden"
                    @toggle-theme="toggleTheme"
                />
                <div
                    class="flex-1"
                    :class="{
                        'md:pl-1vw md:pt-1 md:pb-5 p-0 m-0': !isEmbedPage,
                        'md:pr-64 mr-1vw': sidebarState === 'open' && !isWatchPage,
                        'md:pr-20 mr-1vw': sidebarState === 'semi-open' && !isWatchPage,
                        'md:pr-1vw p-0 m-0': sidebarState === 'closed' || isWatchPage,
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
    computed: {
        isEmbedPage() {
            return this.$route.path.startsWith("/embed");
        },
    },
    watch: {
        $route(to) {
            this.isWatchPage = to.name === "WatchVideo" || to.name === "SearchResults";
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

        this.isWatchPage = this.$route.name === "WatchVideo" || this.$route.name === "SearchResults";
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
            // These colors should match the background colors in uno.config.js
            const themeColors = {
                light: "#F9FAFB", // theme.colors.background
                dark: "#111827", // theme.colors.dark.background
            };
            const themeColor = document.querySelector("meta[name='theme-color']");
            if (themeColor) {
                themeColor.setAttribute("content", themeColors[this.theme]);
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

/* Ensure text alignment respects the document direction */
h1, p, a, b {
    text-align: start;
}

/* Custom scrollbar styles that adapt to the theme */
::-webkit-scrollbar {
    background-color: #e5e7eb; /* gray-200 */
    width: 8px;
}
::-webkit-scrollbar-thumb {
    background-color: #9ca3af; /* gray-400 */
    border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280; /* gray-500 */
}

.dark::-webkit-scrollbar {
    background-color: #1f2937; /* gray-800 */
}
.dark::-webkit-scrollbar-thumb {
    background-color: #4b5563; /* gray-600 */
}
.dark::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280; /* gray-500 */
}


/* Apply the default sans-serif font to all elements */
* {
    @apply font-sans;
}

/* Global grid layout for videos */
.video-grid {
    @apply grid grid-cols-1 mx-2 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 col-auto lt-md:gap-x-3 md:gap-x-6 gap-y-5;
}

/* Global styles for horizontal rule */
hr {
    @apply !my-4 border-color; /* Using border-color shortcut from uno.config.js */
}

/* Thumbnail overlays */
.thumbnail-overlay {
    @apply rounded-md absolute bg-black text-white bg-opacity-75 px-1;
}
.thumbnail-right {
    @apply bottom-1 right-1;
}
.thumbnail-left {
    @apply bottom-1 left-1 text-xs font-bold bg-red-600 uppercase;
}
</style>

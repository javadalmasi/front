import { createApp } from "vue";
import router from "@/router/router.js";
import App from "./App.vue";

import TimeAgo from "javascript-time-ago";

import fa from "javascript-time-ago/locale/fa";
import { getOptimalThumbnailUrl, getProgressiveThumbnailUrls } from "./utils/ThumbnailUtils";

TimeAgo.addDefaultLocale(fa);

import { createI18n } from "vue-i18n";
import { defineAsyncComponent } from "vue";
import faLocale from "@/locales/fa.json";
import "vazirmatn/Vazirmatn-font-face.css";
import "@unocss/reset/tailwind.css";
import "uno.css";

// Import the i18n-t component and t directive directly
import { Translation } from "vue-i18n";

const timeAgo = new TimeAgo("en-US");

const mixin = {
    methods: {
        timeFormat: function (duration) {
            var pad = function (num, size) {
                return ("000" + num).slice(size * -1);
            };

            var time = parseFloat(duration).toFixed(3),
                hours = Math.floor(time / 60 / 60),
                minutes = Math.floor(time / 60) % 60,
                seconds = Math.floor(time - minutes * 60);

            var str = "";

            if (hours > 0) str += hours + ":";

            str += pad(minutes, 2) + ":" + pad(seconds, 2);

            return str;
        },
        numberFormat(num) {
            // var loc = `fa-${import.meta.env.VITE_COUNTRY_REGION || "US"}`;
            var loc = "fa";

            try {
                Intl.getCanonicalLocales(loc);
            } catch {
                loc = "fa"; // fallback to Persian
            }

            const formatter = Intl.NumberFormat(loc, {
                notation: "compact",
            });
            return formatter.format(num);
        },
        addCommas(num) {
            num = parseInt(num);
            return num.toLocaleString("fa");
        },
        fetchJson: function (url, params, options) {
            if (params) {
                url = new URL(url);
                for (var param in params) url.searchParams.set(param, params[param]);
            }

            // Ensure we're properly handling the options parameter
            const fetchOptions = options || {};

            // Set default headers if not provided
            if (!fetchOptions.headers) {
                fetchOptions.headers = {};
            }

            // Set Content-Type to application/json if we have a body and no Content-Type is set
            if (fetchOptions.body && !fetchOptions.headers["Content-Type"]) {
                fetchOptions.headers["Content-Type"] = "application/json";
            }

            return fetch(url, fetchOptions).then(response => {
                // Check if response status is 500 or greater (server error)
                if (!response.ok) {
                    // Try to parse the JSON response to get the error message
                    return response
                        .json()
                        .then(json => {
                            // If the response has a message field, return an error object
                            if (json.message) {
                                return {
                                    error: true,
                                    message: json.message,
                                    status: response.status,
                                };
                            }
                            // If no message field, return a generic error with status text
                            return {
                                error: true,
                                message: response.statusText || `HTTP ${response.status} Error`,
                                status: response.status,
                            };
                        })
                        .catch(() => {
                            // If JSON parsing fails, return error with status text
                            return {
                                error: true,
                                message: response.statusText || `HTTP ${response.status} Error`,
                                status: response.status,
                            };
                        });
                }
                return response.json();
            });
        },
        setPreference(key, value, disableAlert = false) {
            try {
                localStorage.setItem(key, value);
            } catch {
                if (!disableAlert) alert(this.$t("info.local_storage"));
            }
        },
        removePreference(key, disableAlert = false) {
            try {
                localStorage.removeItem(key);
            } catch {
                if (!disableAlert) alert(this.$t("info.local_storage"));
            }
        },
        getPreferenceBoolean(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                switch (String(value).toLowerCase()) {
                    case "true":
                    case "1":
                    case "on":
                    case "yes":
                        return true;
                    default:
                        return false;
                }
            } else return defaultVal;
        },
        getPreferenceString(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return value;
            } else return defaultVal;
        },
        getPreferenceNumber(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                const num = Number(value);
                return isNaN(num) ? defaultVal : num;
            } else return defaultVal;
        },
        getPreferenceJSON(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return JSON.parse(value);
            } else return defaultVal;
        },

        apiUrl() {
            return import.meta.env.VITE_PIPED_API;
        },

        timeAgo(time) {
            return timeAgo.format(time);
        },
        async updateWatched(videos) {
            if (window.db && this.getPreferenceBoolean("watchHistory", true)) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                videos.map(async video => {
                    var request = store.get(video.url.substr(-11));
                    request.onsuccess = function (event) {
                        if (event.target.result) {
                            video.watched = event.target.result.currentTime != 0;
                            video.currentTime = event.target.result.currentTime;
                        }
                    };
                });
            }
        },
        getLocalSubscriptions() {
            try {
                const subscriptions = JSON.parse(localStorage.getItem("localSubscriptions"));
                // If it's an array of strings (old format), convert to new format
                if (Array.isArray(subscriptions) && subscriptions.length > 0 && typeof subscriptions[0] === 'string') {
                    // Convert old format to new format by fetching full data if needed
                    console.warn("Detected old subscription format, consider updating stored data");
                    return subscriptions.map(id => ({ id: id }));
                }
                return subscriptions || [];
            } catch {
                return [];
            }
        },
        // Get full channel subscription data by ID
        getLocalSubscriptionById(channelId) {
            const localSubscriptions = this.getLocalSubscriptions();
            return localSubscriptions.find(sub => sub.id === channelId);
        },
        isSubscribedLocally(channelId) {
            const localSubscriptions = this.getLocalSubscriptions();
            if (localSubscriptions == null) return false;
            return localSubscriptions.some(sub => sub.id === channelId);
        },
        async handleLocalSubscriptions(channelId, channelData = null) {
            var localSubscriptions = this.getLocalSubscriptions();
            const existingIndex = localSubscriptions.findIndex(sub => sub.id === channelId);
            
            if (existingIndex > -1) {
                // Unsubscribe: remove the channel
                localSubscriptions.splice(existingIndex, 1);
            } else {
                // Subscribe: add the channel with full information
                if (channelData) {
                    // Use provided channel data
                    localSubscriptions.push({
                        id: channelData.id || channelId,
                        name: channelData.name,
                        avatar: channelData.avatar,
                        url: channelData.url
                    });
                } else {
                    // If no channel data provided, fetch it from API first
                    try {
                        const channelInfo = await this.fetchJson(this.apiUrl() + `/channels/${channelId}`);
                        if (!channelInfo.error) {
                            localSubscriptions.push({
                                id: channelInfo.id,
                                name: channelInfo.name,
                                avatar: channelInfo.avatar,
                                url: channelInfo.url
                            });
                        } else {
                            // Fallback: store with minimal info if API call fails
                            localSubscriptions.push({
                                id: channelId,
                                name: `Channel ${channelId}`,
                                avatar: "",
                                url: `/channel/${channelId}`
                            });
                        }
                    } catch (e) {
                        // If API fails, store with minimal info
                        localSubscriptions.push({
                            id: channelId,
                            name: `Channel ${channelId}`,
                            avatar: "",
                            url: `/channel/${channelId}`
                        });
                    }
                }
            }
            
            localSubscriptions.sort((a, b) => {
                const nameA = a.name || a.id || '';
                const nameB = b.name || b.id || '';
                return nameA.localeCompare(nameB);
            });
            try {
                localStorage.setItem("localSubscriptions", JSON.stringify(localSubscriptions));
                return true;
            } catch {
                alert(this.$t("info.local_storage"));
                // Restore previous state if storage fails
                localSubscriptions = this.getLocalSubscriptions();
                if (existingIndex > -1) {
                    // Was removing, add back
                    localSubscriptions.push({ id: channelId });
                } else {
                    // Was adding, remove it
                    localSubscriptions = localSubscriptions.filter(sub => sub.id !== channelId);
                }
                return false;
            }
        },
        getUnauthenticatedChannels() {
            const localSubscriptions = this.getLocalSubscriptions() ?? [];
            return localSubscriptions.map(sub => sub.id).join(",");
        },


        download(text, filename, mimeType) {
            var file = new Blob([text], { type: mimeType });
            const elem = document.createElement("a");
            elem.href = URL.createObjectURL(file);
            elem.download = filename;
            elem.click();
            elem.remove();
        },
        async getChannelGroups() {
            return new Promise(resolve => {
                let channelGroups = [];
                var tx = window.db.transaction("channel_groups", "readonly");
                var store = tx.objectStore("channel_groups");
                const cursor = store.index("groupName").openCursor();
                cursor.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const group = cursor.value;
                        channelGroups.push({
                            groupName: group.groupName,
                            channels: JSON.parse(group.channels),
                        });
                        cursor.continue();
                    } else {
                        resolve(channelGroups);
                    }
                };
            });
        },
        createOrUpdateChannelGroup(group) {
            var tx = window.db.transaction("channel_groups", "readwrite");
            var store = tx.objectStore("channel_groups");
            store.put({
                groupName: group.groupName,
                channels: JSON.stringify(group.channels),
            });
        },
        deleteChannelGroup(groupName) {
            var tx = window.db.transaction("channel_groups", "readwrite");
            var store = tx.objectStore("channel_groups");
            store.delete(groupName);
        },


        async getPlaylist(playlistId) {
            return await this.fetchJson(this.apiUrl() + "/playlists/" + playlistId);
        },
        getHomePage(_this) {
            switch (_this.getPreferenceString("homepage", "trending")) {
                case "trending":
                    return "/trending";
                case "feed":
                    return "/feed";
                default:
                    return undefined;
            }
        },
        isLiveStreamDisabled() {
            return import.meta.env.VITE_DISABLE_LIVESTREAMS === "true";
        },
        getOptimalThumbnailUrl(originalThumbnailUrl, additionalOptions = {}) {
            return getOptimalThumbnailUrl(originalThumbnailUrl, additionalOptions);
        },
        getPlayerThumbnailUrl(originalThumbnailUrl, additionalOptions = {}) {
            // Always return 1280x720 with quality 70 for player thumbnails
            const progressiveUrls = getProgressiveThumbnailUrls(originalThumbnailUrl, {
                ...additionalOptions,
                type: 'player'
            });
            return progressiveUrls.optimizedUrl;
        },
        filterLivestreams(items) {
            if (this.isLiveStreamDisabled()) {
                return items.filter(item => {
                    if (item.type === "stream") {
                        if (item.isShort === true) {
                            return true;
                        }
                        return !(
                            item.livestream === true ||
                            (item.duration !== undefined && item.duration <= 0) ||
                            (item.duration === undefined && item.isLive === true) ||
                            (item.duration !== undefined && item.duration === -1) ||
                            item.uploadedDate === null
                        );
                    }
                    return true;
                });
            }
            return items;
        },
        fetchDeArrowContent(content) {
            if (!this.getPreferenceBoolean("dearrow", false)) return;
            const videoIds = content
                .filter(item => item.type === "stream")
                .map(item => item.url.substr(-11))
                .sort();
            if (videoIds.length === 0) return;
            this.fetchJson(this.apiUrl() + "/dearrow", {
                videoIds: videoIds.join(","),
            }).then(json => {
                Object.keys(json).forEach(videoId => {
                    const item = content.find(item => item.url.endsWith(videoId));
                    if (item) item.dearrow = json[videoId];
                });
            });
        },
        async fetchSubscriptionStatus(channelId) {
            return this.isSubscribedLocally(channelId);
        },

        async toggleSubscriptionState(channelId, subscribed, channelData = null) {
            return this.handleLocalSubscriptions(channelId, channelData);
        },
        
        // Methods for managing like/dislike data
        getLikedVideos() {
            try {
                const likedData = localStorage.getItem("likes");  // Changed key to match components
                return likedData ? JSON.parse(likedData) : [];
            } catch {
                return [];
            }
        },

        getDislikedVideos() {
            try {
                const dislikedData = localStorage.getItem("dislikes");  // Changed key to match components
                return dislikedData ? JSON.parse(dislikedData) : [];
            } catch {
                return [];
            }
        },

        // Add video to likes, removing from dislikes if present
        likeVideo(video) {
            // Remove from dislikes if present
            this.unlikeVideo(video.videoId);

            // Get current liked videos
            const likedVideos = this.getLikedVideos();

            // Check if already liked
            const existingIndex = likedVideos.findIndex(v => v.videoId === video.videoId);
            if (existingIndex === -1) {
                // Add to likes with only necessary information (without uploader details)
                const videoData = {
                    videoId: video.videoId,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    duration: video.duration
                };
                likedVideos.push(videoData);
                localStorage.setItem("likes", JSON.stringify(likedVideos));  // Changed key to match components
                return true;
            }
            return false; // Already liked
        },

        // Add video to dislikes, removing from likes if present
        dislikeVideo(video) {
            // Remove from likes if present
            this.removeLike(video.videoId);

            // Get current disliked videos
            const dislikedVideos = this.getDislikedVideos();

            // Check if already disliked
            const existingIndex = dislikedVideos.findIndex(v => v.videoId === video.videoId);
            if (existingIndex === -1) {
                // Add to dislikes with only necessary information (without uploader details)
                const videoData = {
                    videoId: video.videoId,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    duration: video.duration
                };
                dislikedVideos.push(videoData);
                localStorage.setItem("dislikes", JSON.stringify(dislikedVideos));  // Changed key to match components
                return true;
            }
            return false; // Already disliked
        },

        // Remove video from likes
        removeLike(videoId) {
            const likedVideos = this.getLikedVideos();
            const filtered = likedVideos.filter(v => v.videoId !== videoId);
            if (filtered.length !== likedVideos.length) {
                localStorage.setItem("likes", JSON.stringify(filtered));  // Changed key to match components
                return true;
            }
            return false;
        },

        // Remove video from dislikes
        unlikeVideo(videoId) {
            const dislikedVideos = this.getDislikedVideos();
            const filtered = dislikedVideos.filter(v => v.videoId !== videoId);
            if (filtered.length !== dislikedVideos.length) {
                localStorage.setItem("dislikes", JSON.stringify(filtered));  // Changed key to match components
                return true;
            }
            return false;
        },
        
        // Check if video is liked
        isVideoLiked(videoId) {
            const likedVideos = this.getLikedVideos();
            return likedVideos.some(v => v.videoId === videoId);
        },

        // Check if video is disliked
        isVideoDisliked(videoId) {
            const dislikedVideos = this.getDislikedVideos();
            return dislikedVideos.some(v => v.videoId === videoId);
        },

        // Toggle like status
        toggleLike(video) {
            if (this.isVideoLiked(video.videoId)) {
                this.removeLike(video.videoId);
                return false; // Removed like
            } else {
                return this.likeVideo(video); // Added like
            }
        },

        // Toggle dislike status
        toggleDislike(video) {
            if (this.isVideoDisliked(video.videoId)) {
                this.unlikeVideo(video.videoId);
                return false; // Removed dislike
            } else {
                return this.dislikeVideo(video); // Added dislike
            }
        },

        // Migration function to update old storage keys to new ones
        migrateOldStorageKeys() {
            // Migrate old "likedVideos" to "likes"
            const oldLikedData = localStorage.getItem("likedVideos");
            if (oldLikedData) {
                localStorage.setItem("likes", oldLikedData);
                localStorage.removeItem("likedVideos");
            }

            // Migrate old "dislikedVideos" to "dislikes"
            const oldDislikedData = localStorage.getItem("dislikedVideos");
            if (oldDislikedData) {
                localStorage.setItem("dislikes", oldDislikedData);
                localStorage.removeItem("dislikedVideos");
            }
        },
        getCustomInstances() {
            return JSON.parse(window.localStorage.getItem("customInstances")) ?? [];
        },
        addCustomInstance(instance) {
            let customInstances = this.getCustomInstances();
            customInstances.push(instance);
            window.localStorage.setItem("customInstances", JSON.stringify(customInstances));
        },
        removeCustomInstance(instanceToDelete) {
            let customInstances = this.getCustomInstances().filter(
                instance => instance.api_url != instanceToDelete.api_url,
            );
            window.localStorage.setItem("customInstances", JSON.stringify(customInstances));
        },
        getSiteName() {
            return import.meta.env.VITE_SITE_NAME || "vidioo";
        },
    },
    computed: {
        testLocalStorage() {
            try {
                if (window.localStorage !== undefined) localStorage;
                return true;
            } catch {
                return false;
            }
        },
        async defaultLanguage() {
            // Always return Persian since it's the only language
            try {
                await import(`./locales/fa.json`);
                return "fa";
            } catch {
                return "fa";
            }
        },
    },
    data() {
        return {
            TimeAgo: TimeAgo,
            TimeAgoConfig: timeAgo,
        };
    },
};

const i18n = createI18n({
    legacy: false,
    locale: "fa",
    fallbackLocale: "fa",
    messages: {
        fa: faLocale,
    },
    globalInstall: true,  // Enable global component installation
    allowComposition: true,  // Allow composition API usage,
});

window.i18n = i18n;

window.appMixin = mixin;

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mixin(mixin);

// Register the i18n-t component globally
app.component('i18n-t', Translation);

// Register the v-t directive globally - custom implementation to handle translation
app.directive('t', {
  mounted(el, binding) {
    if (typeof binding.value === 'string') {
      el.textContent = window.i18n.global.t(binding.value);
    } else if (typeof binding.value === 'object' && binding.value.path) {
      el.textContent = window.i18n.global.t(binding.value.path, binding.value.params || {});
    }
  },
  updated(el, binding) {
    if (typeof binding.value === 'string') {
      el.textContent = window.i18n.global.t(binding.value);
    } else if (typeof binding.value === 'object' && binding.value.path) {
      el.textContent = window.i18n.global.t(binding.value.path, binding.value.params || {});
    }
  }
});

app.mount("#app");

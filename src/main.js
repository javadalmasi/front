import { createApp } from "vue";
import router from "@/router/router.js";
import App from "./App.vue";

import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import { getOptimalThumbnailUrl } from "./utils/ThumbnailUtils";

TimeAgo.addDefaultLocale(en);

import { createI18n } from "vue-i18n";
import faLocale from "@/locales/fa.json";
import "vazirmatn/Vazirmatn-font-face.css";
import "@unocss/reset/tailwind.css";
import "uno.css";

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
            return num.toLocaleString("en-US");
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
        async getLocalPlaylist(playlistId) {
            return new Promise(resolve => {
                var tx = window.db.transaction("playlists", "readonly");
                var store = tx.objectStore("playlists");
                const req = store.openCursor(playlistId);
                let playlist = null;
                req.onsuccess = e => {
                    playlist = e.target.result.value;
                    playlist.videos = JSON.parse(playlist.videoIds).length;
                    resolve(playlist);
                };
            });
        },
        createOrUpdateLocalPlaylist(playlist) {
            var tx = window.db.transaction("playlists", "readwrite");
            var store = tx.objectStore("playlists");
            store.put(playlist);
        },
        createLocalPlaylistVideo(videoId, videoInfo) {
            if (videoInfo === undefined || videoId === null || videoInfo?.error) return;
            var tx = window.db.transaction("playlist_videos", "readwrite");
            var store = tx.objectStore("playlist_videos");
            const video = {
                videoId: videoId,
                title: videoInfo.title,
                type: "stream",
                shortDescription: videoInfo.shortDescription ?? videoInfo.description,
                url: `/watch?v=${videoId}`,
                thumbnail: videoInfo.thumbnail ?? videoInfo.thumbnailUrl,
                uploaderVerified: videoInfo.uploaderVerified,
                duration: videoInfo.duration,
                uploaderAvatar: videoInfo.uploaderAvatar,
                uploaderUrl: videoInfo.uploaderUrl,
                uploaderName: videoInfo.uploaderName ?? videoInfo.uploader,
            };
            store.put(video);
        },
        async getLocalPlaylistVideo(videoId) {
            return new Promise(resolve => {
                var tx = window.db.transaction("playlist_videos", "readonly");
                var store = tx.objectStore("playlist_videos");
                const req = store.openCursor(videoId);
                req.onsuccess = e => {
                    resolve(e.target.result?.value);
                };
            });
        },
        async getPlaylists() {
            if (!window.db) return [];
            return new Promise(resolve => {
                let playlists = [];
                var tx = window.db.transaction("playlists", "readonly");
                var store = tx.objectStore("playlists");
                const cursorRequest = store.openCursor();
                cursorRequest.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        let playlist = cursor.value;
                        playlist.videos = JSON.parse(playlist.videoIds).length;
                        playlists.push(playlist);
                        cursor.continue();
                    } else {
                        resolve(playlists);
                    }
                };
            });
        },
        async getPlaylist(playlistId) {
            if (playlistId.startsWith("local")) {
                const playlist = await this.getLocalPlaylist(playlistId);
                const videoIds = JSON.parse(playlist.videoIds);
                const videosFuture = videoIds.map(videoId => this.getLocalPlaylistVideo(videoId));
                playlist.relatedStreams = (await Promise.all(videosFuture)).filter(video => video !== undefined);
                return playlist;
            }
            return await this.fetchJson(this.apiUrl() + "/playlists/" + playlistId);
        },
        async createPlaylist(name) {
            const uuid = crypto.randomUUID();
            const playlistId = `local-${uuid}`;
            this.createOrUpdateLocalPlaylist({
                playlistId: playlistId,
                id: playlistId,
                name: name,
                description: "",
                thumbnail: import.meta.env.VITE_PIPED_PROXY + "/?host=i.ytimg.com",
                videoIds: "[]",
            });
            return { playlistId: playlistId };
        },
        async deletePlaylist(playlistId) {
            const playlist = await this.getLocalPlaylist(playlistId);
            var tx = window.db.transaction("playlists", "readwrite");
            var store = tx.objectStore("playlists");
            store.delete(playlistId);
            const playlists = await this.getPlaylists();
            const usedVideoIds = playlists
                .filter(playlist => playlist.id != playlistId)
                .map(playlist => JSON.parse(playlist.videoIds))
                .flat();
            const potentialDeletableVideos = JSON.parse(playlist.videoIds);
            var videoTx = window.db.transaction("playlist_videos", "readwrite");
            var videoStore = videoTx.objectStore("playlist_videos");
            for (let videoId of potentialDeletableVideos) {
                if (!usedVideoIds.includes(videoId)) videoStore.delete(videoId);
            }
            return { message: "ok" };
        },
        async renamePlaylist(playlistId, newName) {
            const playlist = await this.getLocalPlaylist(playlistId);
            playlist.name = newName;
            this.createOrUpdateLocalPlaylist(playlist);
            return { message: "ok" };
        },
        async changePlaylistDescription(playlistId, newDescription) {
            const playlist = await this.getLocalPlaylist(playlistId);
            playlist.description = newDescription;
            this.createOrUpdateLocalPlaylist(playlist);
            return { message: "ok" };
        },
        async addVideosToPlaylist(playlistId, videoIds, videoInfos) {
            const playlist = await this.getLocalPlaylist(playlistId);
            const currentVideoIds = JSON.parse(playlist.videoIds);
            currentVideoIds.push(...videoIds);
            playlist.videoIds = JSON.stringify(currentVideoIds);
            let streamInfos =
                videoInfos ??
                (await Promise.all(videoIds.map(videoId => this.fetchJson(this.apiUrl() + "/streams/" + videoId))));
            playlist.thumbnail = streamInfos[0].thumbnail || streamInfos[0].thumbnailUrl;
            this.createOrUpdateLocalPlaylist(playlist);
            for (let i in videoIds) {
                if (streamInfos[i].error) continue;
                this.createLocalPlaylistVideo(videoIds[i], streamInfos[i]);
            }
            return { message: "ok" };
        },
        async removeVideoFromPlaylist(playlistId, index) {
            const playlist = await this.getLocalPlaylist(playlistId);
            const videoIds = JSON.parse(playlist.videoIds);
            videoIds.splice(index, 1);
            playlist.videoIds = JSON.stringify(videoIds);
            if (videoIds.length == 0) playlist.thumbnail = import.meta.env.VITE_PIPED_PROXY + "/?host=i.ytimg.com";
            this.createOrUpdateLocalPlaylist(playlist);
            return { message: "ok" };
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
                const likedData = localStorage.getItem("likedVideos");
                return likedData ? JSON.parse(likedData) : [];
            } catch {
                return [];
            }
        },
        
        getDislikedVideos() {
            try {
                const dislikedData = localStorage.getItem("dislikedVideos");
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
                localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
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
                localStorage.setItem("dislikedVideos", JSON.stringify(dislikedVideos));
                return true;
            }
            return false; // Already disliked
        },
        
        // Remove video from likes
        removeLike(videoId) {
            const likedVideos = this.getLikedVideos();
            const filtered = likedVideos.filter(v => v.videoId !== videoId);
            if (filtered.length !== likedVideos.length) {
                localStorage.setItem("likedVideos", JSON.stringify(filtered));
                return true;
            }
            return false;
        },
        
        // Remove video from dislikes
        unlikeVideo(videoId) {
            const dislikedVideos = this.getDislikedVideos();
            const filtered = dislikedVideos.filter(v => v.videoId !== videoId);
            if (filtered.length !== dislikedVideos.length) {
                localStorage.setItem("dislikedVideos", JSON.stringify(filtered));
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
            return import.meta.env.VITE_SITE_NAME || "Piped";
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
            const languages = window.navigator.languages;
            for (let i = 0; i < languages.length; i++) {
                if (languages[i].startsWith("fa")) {
                    try {
                        await import(`./locales/${languages[i]}.json`);
                        return languages[i];
                    } catch {
                        continue;
                    }
                }
            }
            if (import.meta.env.VITE_DEFAULT_LANGUAGE) {
                try {
                    await import(`./locales/${import.meta.env.VITE_DEFAULT_LANGUAGE}.json`);
                    return import.meta.env.VITE_DEFAULT_LANGUAGE;
                } catch {
                    try {
                        await import(`./locales/fa.json`);
                        return "fa";
                    } catch {
                        return "en";
                    }
                }
            }
            try {
                await import(`./locales/fa.json`);
                return "fa";
            } catch {
                return "en";
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
    globalInjection: true,
    legacy: false,
    locale: "fa",
    fallbackLocale: "fa",
    messages: {
        fa: faLocale,
    },
});

window.i18n = i18n;

window.appMixin = mixin;

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mixin(mixin);
app.mount("#app");

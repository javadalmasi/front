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
        userApiUrl() {
            if (import.meta.env.DEV) {
                return "/users-api";
            }
            return import.meta.env.VITE_IRONVEIN_USERS_API;
        },
        apiUrl() {
            return import.meta.env.VITE_PIPED_API;
        },
        getAuthToken() {
            return this.getPreferenceString("authToken" + this.hashCode(this.userApiUrl()));
        },
        hashCode(s) {
            return s.split("").reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
        timeAgo(time) {
            return timeAgo.format(time);
        },
        async updateWatched(videos) {
            if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
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
                return JSON.parse(localStorage.getItem("localSubscriptions"));
            } catch {
                return [];
            }
        },
        isSubscribedLocally(channelId) {
            const localSubscriptions = this.getLocalSubscriptions();
            if (localSubscriptions == null) return false;
            return localSubscriptions.includes(channelId);
        },
        handleLocalSubscriptions(channelId) {
            var localSubscriptions = this.getLocalSubscriptions() ?? [];
            if (localSubscriptions.includes(channelId))
                localSubscriptions.splice(localSubscriptions.indexOf(channelId), 1);
            else localSubscriptions.push(channelId);
            localSubscriptions.sort();
            try {
                localStorage.setItem("localSubscriptions", JSON.stringify(localSubscriptions));
                return true;
            } catch {
                alert(this.$t("info.local_storage"));
            }
            return false;
        },
        getUnauthenticatedChannels() {
            const localSubscriptions = this.getLocalSubscriptions() ?? [];
            return localSubscriptions.join(",");
        },
        async fetchSubscriptions() {
            if (this.authenticated) {
                return await this.fetchJson(this.userApiUrl() + "/api/user/subscriptions", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });
            } else {
                const channels = this.getUnauthenticatedChannels();
                const split = channels.split(",");
                if (split.length > 100) {
                    return await this.fetchJson(this.apiUrl() + "/subscriptions/unauthenticated", null, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(split),
                    });
                } else {
                    return await this.fetchJson(this.apiUrl() + "/subscriptions/unauthenticated", {
                        channels: this.getUnauthenticatedChannels(),
                    });
                }
            }
        },
        async fetchFeed() {
            if (this.authenticated) {
                return await this.fetchJson(this.apiUrl() + "/feed", {
                    authToken: this.getAuthToken(),
                });
            } else {
                const channels = this.getUnauthenticatedChannels();
                const split = channels.split(",");
                if (split.length > 100) {
                    return await this.fetchJson(this.apiUrl() + "/feed/unauthenticated", null, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(split),
                    });
                } else {
                    return await this.fetchJson(this.apiUrl() + "/feed/unauthenticated", {
                        channels: channels,
                    });
                }
            }
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
            if (!this.authenticated) {
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
            }
            return await this.fetchJson(this.userApiUrl() + "/api/user/playlists", null, {
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                },
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
            if (!this.authenticated) {
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
            }
            return await this.fetchJson(this.userApiUrl() + "/api/user/playlists", null, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                }),
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
        },
        async deletePlaylist(playlistId) {
            if (!this.authenticated) {
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
            }
            const response = await fetch(this.userApiUrl() + "/api/user/playlists/" + playlistId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + this.getAuthToken(),
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Delete playlist error:", errorText);
                throw new Error(errorText || "Failed to delete playlist");
            }
            return await response.json();
        },
        async renamePlaylist(playlistId, newName) {
            if (!this.authenticated) {
                const playlist = await this.getLocalPlaylist(playlistId);
                playlist.name = newName;
                this.createOrUpdateLocalPlaylist(playlist);
                return { message: "ok" };
            }
            return await this.fetchJson(this.userApiUrl() + "/api/user/playlists/" + playlistId, null, {
                method: "POST",
                body: JSON.stringify({
                    name: newName,
                }),
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
        },
        async changePlaylistDescription(playlistId, newDescription) {
            if (!this.authenticated) {
                const playlist = await this.getLocalPlaylist(playlistId);
                playlist.description = newDescription;
                this.createOrUpdateLocalPlaylist(playlist);
                return { message: "ok" };
            }
            return await this.fetchJson(this.userApiUrl() + "/api/user/playlists/" + playlistId, null, {
                method: "POST",
                body: JSON.stringify({
                    description: newDescription,
                }),
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
        },
        async addVideosToPlaylist(playlistId, videoIds, videoInfos) {
            if (!this.authenticated) {
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
            }
            const results = [];
            for (const videoId of videoIds) {
                const result = await this.fetchJson(
                    this.userApiUrl() + "/api/user/playlists/" + playlistId + "/add",
                    null,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            video_id: videoId,
                        }),
                        headers: {
                            Authorization: "Bearer " + this.getAuthToken(),
                            "Content-Type": "application/json",
                        },
                    },
                );
                results.push(result);
            }
            return results.every(r => r.success) ? { message: "ok" } : { error: "Some videos failed to add" };
        },
        async removeVideoFromPlaylist(playlistId, index) {
            if (!this.authenticated) {
                const playlist = await this.getLocalPlaylist(playlistId);
                const videoIds = JSON.parse(playlist.videoIds);
                videoIds.splice(index, 1);
                playlist.videoIds = JSON.stringify(videoIds);
                if (videoIds.length == 0) playlist.thumbnail = import.meta.env.VITE_PIPED_PROXY + "/?host=i.ytimg.com";
                this.createOrUpdateLocalPlaylist(playlist);
                return { message: "ok" };
            }
            console.error("Index-based removal not supported by current API. Use video_id instead.");
            return { error: "Not supported" };
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
            if (!this.authenticated) {
                return this.isSubscribedLocally(channelId);
            }
            const response = await this.fetchJson(this.userApiUrl() + "/api/user/subscriptions", null, {
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                },
            });
            if (response.success && response.data) {
                return response.data.includes(channelId);
            }
            return false;
        },
        async fetchAdminUsers(page = 1, limit = 10, search = null) {
            if (!this.authenticated) {
                throw new Error("User is not authenticated");
            }
            let url = `${this.userApiUrl()}/api/admin/users`;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) {
                params.append("search", search);
            }
            const fullUrl = `${url}?${params.toString()}`;
            return await this.fetchJson(fullUrl, null, {
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                },
            });
        },
        async fetchAdminUser(userId) {
            if (!this.authenticated) {
                throw new Error("User is not authenticated");
            }
            return await this.fetchJson(`${this.userApiUrl()}/api/admin/users/${userId}`, null, {
                headers: {
                    Authorization: "Bearer " + this.getAuthToken(),
                },
            });
        },
        async updateAdminUser(userId, userData) {
            if (!this.authenticated) {
                throw new Error("User is not authenticated");
            }
            const response = await fetch(`${this.userApiUrl()}/api/admin/users/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(userData),
            });
            return await response.json();
        },
        async deleteAdminUser(userId) {
            if (!this.authenticated) {
                throw new Error("User is not authenticated");
            }
            const response = await fetch(`${this.userApiUrl()}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getAuthToken()}`,
                },
            });
            return await response.json();
        },
        async createAdminUser(userData) {
            if (!this.authenticated) {
                throw new Error("User is not authenticated");
            }
            const response = await fetch(`${this.userApiUrl()}/api/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(userData),
            });
            return await response.json();
        },
        async toggleSubscriptionState(channelId, subscribed) {
            if (!this.authenticated) return this.handleLocalSubscriptions(channelId);
            const resp = await this.fetchJson(
                this.userApiUrl() +
                    (subscribed ? "/api/user/subscriptions/unsubscribe" : "/api/user/subscriptions/subscribe"),
                null,
                {
                    method: "POST",
                    body: JSON.stringify({
                        channel_id: channelId,
                    }),
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                },
            );
            return resp.success;
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
        showToast(message, type = "info") {
            window.dispatchEvent(
                new CustomEvent("show-toast", {
                    detail: {
                        message,
                        type,
                    },
                }),
            );
        },
    },
    computed: {
        authenticated(_this) {
            return _this.getAuthToken() !== undefined;
        },
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

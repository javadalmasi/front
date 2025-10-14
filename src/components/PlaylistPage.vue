<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <LoadingIndicatorPage v-show="!playlist?.error" :show-content="playlist">
        <h1 class="mb-1 mr-1 mt-4 text-3xl leading-[1.45]!" v-text="playlist.name" />

        <CollapsableText v-if="playlist?.description" :text="playlist.description" />

        <div class="mt-1 flex justify-between <md:flex-col md:items-center">
            <div>
                <router-link class="link flex items-center gap-3" :to="playlist.uploaderUrl || '/'">
                    <div class="relative inline-block">
                        <img
                            loading="lazy"
                            :src="playlist.uploaderAvatar"
                            :class="{ 'border-2 border-blue-700': playlist.uploaderVerified, 'rounded-full': true }"
                            class="h-32px w-32px"
                            width="68"
                            height="68"
                        />
                        <div
                            v-if="playlist.uploaderVerified"
                            class="absolute end-0.5 bottom-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-blue-700"
                        >
                            <i class="i-fa6-solid:check text-[8px] text-white" />
                        </div>
                    </div>
                    <strong v-text="playlist.uploader" />
                </router-link>
            </div>
            <div class="flex flex-wrap items-center gap-1">
                <strong
                    v-text="
                        `${playlist.videos} ${$t('video.videos')} - ${timeFormat(totalDuration)}${playlist.nextpage ? '+' : ''}`
                    "
                />
                <button v-if="!isPipedPlaylist" class="btn mx-1" @click="bookmarkPlaylist">
                    {{ $t(`actions.${isBookmarked ? "playlist_bookmarked" : "bookmark_playlist"}`)
                    }}<i class="i-fa6-solid:bookmark mr-3" />
                </button>
                <button v-if="authenticated && !isPipedPlaylist" class="btn btn-secondary mr-1" @click="clonePlaylist">
                    {{ $t("actions.clone_playlist") }}<i class="i-fa6-solid:clone mr-3" />
                </button>
                <button v-if="!isTxtDownloadDisabled" class="btn mr-1" @click="downloadPlaylistAsTxt">
                    {{ $t("actions.download_as_txt") }}
                </button>
                <a v-if="!isRssFeedDisabled" class="btn mr-1" :href="getRssUrl">
                    <i class="i-fa6-solid:rss" />
                </a>
                <WatchOnButton :link="`https://www.youtube.com/playlist?list=${$route.query.list}`" />
            </div>
        </div>

        <hr />

        <div class="video-grid">
            <VideoItem
                v-for="(video, index) in playlist.relatedStreams"
                :key="video.url"
                :item="video"
                :clamp-title-lines="true"
                :index="index"
                :playlist-id="$route.query.list"
                :admin="admin"
                height="94"
                width="168"
                @remove="removeVideo(index)"
            />
        </div>
    </LoadingIndicatorPage>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import VideoItem from "./VideoItem.vue";
import WatchOnButton from "./WatchOnButton.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
        WatchOnButton,
        LoadingIndicatorPage,
        CollapsableText,
    },
    data() {
        return {
            playlist: null,
            totalDuration: 0,
            admin: false,
            isBookmarked: false,
        };
    },
    computed: {
        getRssUrl: _this => {
            return _this.authApiUrl() + "/rss/playlists/" + _this.$route.query.list;
        },
        isRssFeedDisabled() {
            // Check if RSS feed button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
        },
        isTxtDownloadDisabled() {
            // Check if TXT download button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_PLAYLIST_TXT_DOWNLOAD === "true";
        },

        isPipedPlaylist: _this => {
            // regex to determine whether it's a Piped plalylist
            return /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/.test(
                _this.$route.query.list,
            );
        },
    },
    mounted() {
        const playlistId = this.$route.query.list;
        if (this.authenticated && playlistId?.length == 36)
            this.getPlaylists().then(json => {
                if (json.error) alert(json.error);
                else if (json.some(playlist => playlist.id === playlistId)) this.admin = true;
            });
        else if (playlistId.startsWith("local")) this.admin = true;
        this.isPlaylistBookmarked();
    },
    activated() {
        this.getPlaylistData();
        window.addEventListener("scroll", this.handleScroll);
        if (this.playlist) this.updateTitle();
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async getPlaylistData() {
            this.getPlaylist(this.$route.query.list)
                .then(data => (this.playlist = data))
                .then(() => {
                    this.updateTitle();
                    this.updateTotalDuration();
                    // Filter livestreams from playlist if they are disabled
                    if (this.filterLivestreams) {
                        this.playlist.relatedStreams = this.filterLivestreams(this.playlist.relatedStreams);
                    }
                    this.updateWatched(this.playlist.relatedStreams);
                    this.fetchDeArrowContent(this.playlist.relatedStreams);
                });
        },
        async updateTitle() {
            document.title = this.playlist.name + " - " + this.getSiteName();
        },
        handleScroll() {
            if (this.loading || !this.playlist || !this.playlist.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.authApiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.nextpage = json.nextpage;
                    this.loading = false;
                    // Filter livestreams from new items if they are disabled
                    if (this.filterLivestreams) {
                        json.relatedStreams = this.filterLivestreams(json.relatedStreams);
                    }

                    // Filter out duplicate items based on URL before adding them
                    const newItems = json.relatedStreams.filter(
                        newItem => !this.playlist.relatedStreams.some(existingItem => existingItem.url === newItem.url),
                    );

                    // Only add items if there are non-duplicate ones
                    if (newItems.length > 0) {
                        this.playlist.relatedStreams.push(...newItems);
                    }

                    this.updateTotalDuration();
                    this.fetchDeArrowContent(json.relatedStreams);
                });
            }
        },
        removeVideo(index) {
            this.playlist.relatedStreams.splice(index, 1);
        },
        updateTotalDuration() {
            this.totalDuration = this.playlist.relatedStreams.map(video => video.duration).reduce((a, b) => a + b);
        },
        async clonePlaylist() {
            this.fetchJson(this.authApiUrl() + "/import/playlist", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
                body: JSON.stringify({
                    playlistId: this.$route.query.list,
                }),
            }).then(resp => {
                if (!resp.error) {
                    alert(this.$t("actions.clone_playlist_success"));
                } else alert(resp.error);
            });
        },
        downloadPlaylistAsTxt() {
            const data = this.playlist.relatedStreams
                .map(video => {
                    return "https://piped.video" + video.url;
                })
                .join("\n");
            this.download(data, this.playlist.name + ".txt", "text/plain");
        },
        async bookmarkPlaylist() {
            if (!this.playlist) return;

            if (this.isBookmarked) {
                this.removePlaylistBookmark();
                return;
            }

            if (window.db) {
                const playlistId = this.$route.query.list;
                var tx = window.db.transaction("playlist_bookmarks", "readwrite");
                var store = tx.objectStore("playlist_bookmarks");
                store.put({
                    playlistId: playlistId,
                    name: this.playlist.name,
                    uploader: this.playlist.uploader,
                    uploaderUrl: this.playlist.uploaderUrl,
                    thumbnail: this.playlist.thumbnailUrl,
                    uploaderAvatar: this.playlist.uploaderAvatar,
                    videos: this.playlist.videos,
                });
                this.isBookmarked = true;
            }
        },
        async removePlaylistBookmark() {
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            store.delete(this.$route.query.list);
            this.isBookmarked = false;
        },
        async isPlaylistBookmarked() {
            // needed in order to change the is bookmarked var later
            const App = this;
            const playlistId = this.$route.query.list;
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            var req = store.openCursor(playlistId);
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                App.isBookmarked = cursor ? true : false;
            };
        },
    },
};
</script>

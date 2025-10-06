<template>
    <div
        v-if="video && isEmbed && !checkIfLivestreamDisabled(video)"
        class="absolute left-0 top-0 z-50 h-full w-full bg-black"
    >
        <VideoPlayer
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>
    <div
        v-else-if="video && isEmbed && checkIfLivestreamDisabled(video)"
        class="absolute left-0 top-0 z-50 h-full w-full flex items-center justify-center bg-black"
    >
        <PageNotFound />
    </div>
    <div id="theaterModeSpot" class="w-full bg-black -mx-1vw"></div>
    <PageNotFound v-if="video && checkIfLivestreamDisabled(video)" />
    <LoadingIndicatorPage v-else :show-content="video && !isEmbed && !checkIfLivestreamDisabled(video)" class="w-full">
        <div v-if="video && !checkIfLivestreamDisabled(video)" class="page-container py-8 flex flex-col lg:flex-row gap-8">
            <!-- Main Content: Player and Video Info -->
            <div class="flex-1 lg:max-w-[calc(100%-24rem-2rem)]">
                <!-- Video Player -->
                <Teleport defer to="#theaterModeSpot" :disabled="!theaterMode">
                     <div :class="{ 'relative': !theaterMode, 'fixed z-100 inset-0': theaterMode }">
                        <VideoPlayer
                            ref="videoPlayer"
                            :video="video"
                            :sponsors="sponsors"
                            :selected-auto-play="selectedAutoPlay"
                            :selected-auto-loop="selectedAutoLoop"
                            :theater-mode="theaterMode"
                            @timeupdate="onTimeUpdate"
                            @ended="onVideoEnded"
                            @navigate-next="navigateNext"
                            @toggle-theater="toggleTheaterMode"
                            @toggle-loop="selectedAutoLoop = !selectedAutoLoop"
                            @cycle-autoplay="cycleAutoplay"
                        />
                    </div>
                </Teleport>

                <!-- Video Metadata -->
                <div class="mt-4">
                    <h1 class="text-2xl font-bold text-main break-words">{{ video.title }}</h1>
                    <div class="mt-2 flex flex-col sm:flex-row sm:items-center text-soft gap-x-4 gap-y-2">
                        <span>{{ `${numberFormat(video.views)} ${$t("video.views", video.views)}` }}</span>
                        <span :title="new Date(video.uploadDate).toLocaleString()">{{ uploadDate }}</span>
                        <div v-if="likesDislikesEnabled && video.likes >= 0" class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <i class="i-fa6-solid:thumbs-up" />
                                <span>{{ numberFormat(video.likes) }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="i-fa6-solid:thumbs-down" />
                                <span>{{ video.dislikes >= 0 ? numberFormat(video.dislikes) : "?" }}</span>
                            </div>
                        </div>
                         <div v-if="likesDislikesEnabled && video.likes < 0">
                            <span>{{ $t('video.ratings_disabled') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Channel Info & Actions -->
                <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <router-link :to="video.uploaderUrl" class="flex items-center gap-3 self-start">
                        <img
                            loading="lazy"
                            :src="video.uploaderAvatar"
                            class="w-12 h-12 rounded-full bg-surface"
                            alt=""
                        />
                        <div>
                            <div class="font-semibold text-main flex items-center gap-2">
                                <span>{{ video.uploader }}</span>
                                <i v-if="video.uploaderVerified" class="i-fa6-solid:check-circle text-primary" :title="$t('channel.verified')"></i>
                            </div>
                            <span class="text-sm text-soft">{{ `${numberFormat(video.uploaderSubscriberCount)} ${$t("channel.subscribers", video.uploaderSubscriberCount)}` }}</span>
                        </div>
                    </router-link>

                    <div class="flex flex-wrap gap-2 items-center self-start sm:self-center">
                         <button
                            class="btn"
                            :class="subscribed ? 'btn-secondary' : 'btn-subscribe'"
                            @click="subscribeHandler"
                        >
                            <i v-if="!subscribed" class="i-fa6-solid:bell" />
                            <i v-else class="i-fa6-solid:bell-slash" />
                            <span>{{ $t(subscribed ? "actions.unsubscribe" : "actions.subscribe") }}</span>
                        </button>
                        <button class="btn btn-secondary" @click="showShareModal = !showShareModal">
                            <i class="i-fa6-solid:share" />
                            <span>{{ $t("actions.share") }}</span>
                        </button>
                        <button class="btn btn-secondary" @click="showModal = !showModal">
                            <i class="i-fa6-solid:plus" />
                            <span>{{ $t("actions.add_to_playlist") }}</span>
                        </button>
                         <button v-if="!isDownloadThumbnailDisabled" class="btn btn-secondary" @click="downloadCurrentFrame">
                            <i class="i-fa6-solid:download" />
                        </button>
                    </div>
                </div>

                <hr class="my-4" />

                <!-- Description -->
                <div class="bg-surface card p-4 rounded-lg cursor-pointer" @click="showDesc = !showDesc">
                    <div :class="{ 'line-clamp-3': !showDesc }" class="whitespace-pre-wrap">
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div class="description break-words text-sm" v-html="purifiedDescription" />
                    </div>
                     <a class="text-sm font-semibold mt-2 block">{{ $t(`actions.${showDesc ? 'minimize_description' : 'show_description'}`) }}</a>
                </div>


                <!-- Comments Section -->
                <div v-if="commentsEnabled" class="mt-6">
                    <h2 class="text-xl font-bold text-main mb-4">{{ $t('comment.comments') }} ({{ numberFormat(comments?.commentCount) }})</h2>
                    <div v-if="!comments" class="text-center text-soft py-8">
                        <p>{{ $t("comment.loading") }}</p>
                    </div>
                    <div v-else-if="comments.disabled" class="text-center text-soft py-8">
                        <p>{{ $t("comment.disabled") }}</p>
                    </div>
                    <div v-else ref="comments" class="flex flex-col gap-4">
                        <CommentItem
                            v-for="comment in comments.comments"
                            :key="comment.commentId"
                            :comment="comment"
                            :uploader="video.uploader"
                        />
                    </div>
                </div>
            </div>

            <!-- Sidebar: Recommendations, Chapters, Playlist -->
            <div class="w-full lg:w-96 flex-shrink-0">
                <div class="flex flex-col gap-4">
                     <ChaptersBar
                        v-if="video?.chapters?.length > 0"
                        :chapters="video.chapters"
                        :player-position="currentTime"
                        @seek="navigate"
                    />
                    <PlaylistVideos
                        v-if="playlist"
                        :playlist-id="playlistId"
                        :playlist="playlist"
                        :selected-index="index"
                        :prefer-listen="isListening"
                    />
                    <h3 class="text-lg font-semibold">{{ $t('video.recommendations') }}</h3>
                    <ContentItem
                        v-for="related in video.relatedStreams"
                        :key="related.url"
                        :item="related"
                        :prefer-listen="isListening"
                    />
                </div>
            </div>
        </div>
        <PlaylistAddModal v-if="showModal" :video-id="getVideoId()" :video-info="video" @close="showModal = false" />
        <ShareModal
            v-if="showShareModal"
            :video-id="getVideoId()"
            :current-time="currentTime"
            :playlist-id="playlistId"
            :playlist-index="index"
            @close="showShareModal = false"
        />
        <Transition>
            <ToastComponent v-if="shouldShowToast" @dismissed="dismiss">
                <i18n-t keypath="info.next_video_countdown">{{ counter }}</i18n-t>
            </ToastComponent>
        </Transition>
    </LoadingIndicatorPage>
</template>

<script>
import VideoPlayer from "./VideoPlayer.vue";
import ContentItem from "./ContentItem.vue";
import CommentItem from "./CommentItem.vue";
import ChaptersBar from "./ChaptersBar.vue";
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import PlaylistVideos from "./PlaylistVideos.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import ToastComponent from "./ToastComponent.vue";
import PageNotFound from "./PageNotFound.vue";
import { parseTimeParam } from "@/utils/Misc";
import { purifyHTML, rewriteDescription } from "@/utils/HtmlUtils";
import moment from "jalali-moment";

export default {
    name: "WatchVideo",
    components: {
        VideoPlayer,
        ContentItem,
        CommentItem,
        ChaptersBar,
        PlaylistAddModal,
        ShareModal,
        PlaylistVideos,
        LoadingIndicatorPage,
        ToastComponent,
        PageNotFound,
    },
    data() {
        return {
            video: null,
            playlistId: null,
            playlist: null,
            index: null,
            sponsors: null,
            selectedAutoLoop: false,
            selectedAutoPlay: 1, // Default to autoplay on
            showDesc: false,
            comments: null,
            subscribed: false,
            channelId: null,
            active: true,
            showModal: false,
            showShareModal: false,
            currentTime: 0,
            shouldShowToast: false,
            timeoutCounter: null,
            counter: 0,
            theaterMode: false,
        };
    },
    computed: {
        isListening() {
            return this.$route.query.listen === "1";
        },
        commentsEnabled() {
            return import.meta.env.VITE_DISABLE_COMMENTS !== "true";
        },
        isDownloadThumbnailDisabled() {
            return import.meta.env.VITE_DISABLE_DOWNLOAD_THUMBNAIL === "true";
        },
        likesDislikesEnabled() {
            return import.meta.env.VITE_DISABLE_LIKES_DISLIKES !== "true";
        },
        isEmbed() {
            return this.$route.path.startsWith("/embed/");
        },
        uploadDate() {
            if (!this.video?.uploadDate) return "";
            const date = new Date(this.video.uploadDate);
            if (import.meta.env.VITE_CALENDAR_TYPE === "jalali") {
                return moment(date).locale("fa").format("jYYYY/jMM/jDD");
            }
            return date.toLocaleDateString(undefined, {
                month: "short", day: "numeric", year: "numeric",
            });
        },
        purifiedDescription() {
            return purifyHTML(this.video.description);
        },
    },
    watch: {
        '$route.query.v': 'resetAndFetchData',
        '$route.query.list': 'resetAndFetchData',
    },
    mounted() {
        this.initialize();
    },
    activated() {
        this.active = true;
        this.initializePreferences();
        if (this.video?.duration) {
            document.title = this.video.title + " - " + this.getSiteName();
            this.$refs.videoPlayer?.loadVideo();
        }
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        this.active = false;
        window.removeEventListener("scroll", this.handleScroll);
        this.dismiss();
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
        this.dismiss();
    },
    methods: {
        initialize() {
            this.initializePreferences();
            this.getVideoData().then(() => {
                this.logToWatchHistory();
                if (this.active) this.$refs.videoPlayer?.loadVideo();
            });
            this.playlistId = this.$route.query.list;
            this.index = Number(this.$route.query.index);
            this.getPlaylistData();
            this.getSponsors();
            if (this.commentsEnabled) this.getComments();
            if (this.isEmbed) document.documentElement.style.overflow = "hidden";
        },
        initializePreferences() {
             this.theaterMode = this.getPreferenceBoolean("theaterMode", false);
             this.selectedAutoPlay = this.getPreferenceNumber("autoplay", 1);
        },
        resetAndFetchData() {
            this.video = null;
            this.playlist = null;
            this.comments = null;
            this.initialize();
        },
        toggleTheaterMode() {
            this.theaterMode = !this.theaterMode;
            this.setPreference('theaterMode', this.theaterMode);
        },
        cycleAutoplay() {
            this.selectedAutoPlay = (this.selectedAutoPlay + 1) % 3;
            this.setPreference('autoplay', this.selectedAutoPlay, true);
        },
        logToWatchHistory() {
             if (window.db && this.getPreferenceBoolean("watchHistory", false) && !this.video.error) {
                const videoId = this.getVideoId();
                const tx = window.db.transaction("watch_history", "readwrite");
                const store = tx.objectStore("watch_history");
                const request = store.get(videoId);
                request.onsuccess = (event) => {
                    let video = event.target.result;
                    if (video) {
                        video.watchedAt = Date.now();
                    } else {
                        video = {
                            videoId: videoId,
                            title: this.video.title,
                            duration: this.video.duration,
                            thumbnail: this.video.thumbnailUrl,
                            uploaderUrl: this.video.uploaderUrl,
                            uploaderName: this.video.uploader,
                            watchedAt: Date.now(),
                        };
                    }
                    store.put(video);
                };
            }
        },

        checkIfLivestreamDisabled(video) {
            // Don't consider short videos as livestreams to be disabled
            if (video.isShort === true) {
                return false; // Short videos should not be disabled
            }
            return (
                this.isLiveStreamDisabled &&
                (video.livestream === true ||
                    (video.duration !== undefined && video.duration <= 0) ||
                    (video.duration === undefined && video.isLive === true) ||
                    (video.duration !== undefined && video.duration === -1) ||
                    video.uploadedDate === null)
            );
        },
        fetchVideo() {
            return this.fetchJson(this.apiUrl() + "/streams/" + this.getVideoId());
        },
        async fetchSponsors() {
            var selectedSkip = this.getPreferenceString(
                "selectedSkip",
                "sponsor,interaction,selfpromo,music_offtopic",
            ).split(",");
            const skipOptions = this.getPreferenceJSON("skipOptions");
            if (skipOptions !== undefined) {
                selectedSkip = Object.keys(skipOptions).filter(
                    k => skipOptions[k] !== undefined && skipOptions[k] !== "no",
                );
            }

            const sponsors = await this.fetchJson(this.apiUrl() + "/sponsors/" + this.getVideoId(), {
                category: JSON.stringify(selectedSkip),
            });

            sponsors?.segments?.forEach(segment => {
                const option = skipOptions?.[segment.category];
                segment.autoskip = option === undefined || option === "auto";
            });

            const minSegmentLength = Math.max(this.getPreferenceNumber("minSegmentLength", 0), 0);
            sponsors.segments = sponsors.segments?.filter(segment => {
                const length = segment.segment[1] - segment.segment[0];
                return length >= minSegmentLength;
            });

            return sponsors;
        },
        toggleComments() {
            if (!this.commentsEnabled) return; // Don't allow toggling if comments are disabled
            this.showComments = !this.showComments;
            if (this.showComments && this.comments === null) {
                this.fetchComments();
            }
        },
        fetchComments() {
            if (!this.commentsEnabled) {
                // Return a disabled state instead of making API call
                return Promise.resolve({ disabled: true, comments: [] });
            }
            return this.fetchJson(this.apiUrl() + "/comments/" + this.getVideoId());
        },
        async getVideoData() {
            await this.fetchVideo()
                .then(data => {
                    this.video = data;
                    this.video.id = this.getVideoId();
                })
                .then(() => {
                    if (!this.video.error) {
                        // Check if video is a livestream and if livestreams are disabled
                        // Don't consider short videos as livestreams to be disabled
                        if (
                            this.isLiveStreamDisabled &&
                            this.video.isShort !== true && // Don't disable short videos
                            (this.video.livestream === true ||
                                (this.video.duration !== undefined && this.video.duration <= 0) ||
                                (this.video.duration === undefined && this.video.isLive === true) ||
                                (this.video.duration !== undefined && this.video.duration === -1) ||
                                this.video.uploadedDate === null)
                        ) {
                            this.video.error = true;
                            this.video.message = this.$t("info.livestreams_disabled");
                            document.title = this.$t("info.livestreams_disabled") + " - " + this.getSiteName();
                        } else {
                            document.title = this.video.title + " - " + this.getSiteName();
                            this.channelId = this.video.uploaderUrl.split("/")[2];
                            if (!this.isEmbed) this.fetchSubscribedStatus();

                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(this.video.description, "text/html");
                            xmlDoc.querySelectorAll("a").forEach(elem => {
                                if (!elem.innerText.match(/(?:[\d]{1,2}:)?(?:[\d]{1,2}):(?:[\d]{1,2})/))
                                    elem.outerHTML = elem.getAttribute("href");
                            });
                            xmlDoc.querySelectorAll("br").forEach(elem => (elem.outerHTML = "\n"));
                            this.video.description = rewriteDescription(xmlDoc.querySelector("body").innerHTML);
                            // Filter livestreams from related streams if they are disabled
                            if (this.filterLivestreams) {
                                this.video.relatedStreams = this.filterLivestreams(this.video.relatedStreams);
                            }
                            this.updateWatched(this.video.relatedStreams);

                            this.fetchDeArrowContent(this.video.relatedStreams);
                        }

                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(this.video.description, "text/html");
                        xmlDoc.querySelectorAll("a").forEach(elem => {
                            if (!elem.innerText.match(/(?:[\d]{1,2}:)?(?:[\d]{1,2}):(?:[\d]{1,2})/))
                                elem.outerHTML = elem.getAttribute("href");
                        });
                        xmlDoc.querySelectorAll("br").forEach(elem => (elem.outerHTML = "\n"));
                        this.video.description = rewriteDescription(xmlDoc.querySelector("body").innerHTML);
                        // Filter livestreams from related streams if they are disabled
                        if (this.filterLivestreams) {
                            this.video.relatedStreams = this.filterLivestreams(this.video.relatedStreams);
                        }
                        this.updateWatched(this.video.relatedStreams);

                        this.fetchDeArrowContent(this.video.relatedStreams);
                    }
                });
        },
        async getPlaylistData() {
            if (this.playlistId) {
                this.playlist = await this.getPlaylist(this.playlistId);
                await this.fetchPlaylistPages().then(() => {
                    if (!(this.index >= 0)) {
                        for (let i = 0; i < this.playlist.relatedStreams.length; i++)
                            if (this.playlist.relatedStreams[i].url.substr(-11) == this.getVideoId()) {
                                this.index = i + 1;
                                this.$router.replace({
                                    query: { ...this.$route.query, index: this.index },
                                });
                                break;
                            }
                    }
                });
                await this.fetchPlaylistPages();
            }
        },
        async fetchPlaylistPages() {
            if (this.playlist.nextpage) {
                await this.fetchJson(this.apiUrl() + "/nextpage/playlists/" + this.playlistId, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.relatedStreams.push(...json.relatedStreams);
                    this.playlist.nextpage = json.nextpage;
                    this.fetchDeArrowContent(json.relatedStreams);
                });
                await this.fetchPlaylistPages();
            }
        },
        async getSponsors() {
            if (this.getPreferenceBoolean("sponsorblock", true))
                this.fetchSponsors().then(data => (this.sponsors = data));
        },
        async getComments() {
            if (!this.commentsEnabled) {
                // If comments are disabled, set comments to disabled state
                this.comments = { disabled: true, comments: [] };
                return;
            }
            this.comments = await this.fetchComments();
        },
        async fetchSubscribedStatus() {
            if (!this.channelId) return;

            this.subscribed = await this.fetchSubscriptionStatus(this.channelId);
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channelId, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
        handleClick(event) {
            if (!event || !event.target) return;
            if (!event.target.matches("a[href]")) return;
            const target = event.target;
            if (!target.getAttribute("href")) return;
            if (this.handleTimestampLinks(target)) {
                event.preventDefault();
            }
        },
        handleTimestampLinks(target) {
            try {
                const url = new URL(target.getAttribute("href"), document.baseURI);
                if (
                    url.searchParams.size > 2 ||
                    url.searchParams.get("v") !== this.getVideoId() ||
                    !url.searchParams.has("t")
                ) {
                    return false;
                }
                const time = parseTimeParam(url.searchParams.get("t"));
                if (time) {
                    this.navigate(time);
                }
                return true;
            } catch (e) {
                console.error(e);
            }
            return false;
        },
        handleScroll() {
            if (this.loading || !this.commentsEnabled || !this.comments || !this.comments.nextpage) return;
            if (window.innerHeight + window.scrollY >= this.$refs.comments?.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.getVideoId(), {
                    nextpage: this.comments.nextpage,
                }).then(json => {
                    this.comments.nextpage = json.nextpage;
                    this.loading = false;
                    this.comments.comments = this.comments.comments.concat(json.comments);
                });
            }
        },
        getVideoId() {
            if (this.$route.query.video_ids) {
                const videos_list = this.$route.query.video_ids.split(",");
                this.index = Number(this.$route.query.index ?? 0);
                return videos_list[this.index];
            }

            return this.$route.query.v || this.$route.params.v;
        },
        navigate(time) {
            this.$refs.videoPlayer.seek(time);
        },
        onTimeUpdate(time) {
            this.currentTime = time;
        },
        onVideoEnded() {
            if (
                !this.selectedAutoLoop &&
                ((this.selectedAutoPlay >= 1 && this.playlist?.relatedStreams?.length > this.index) ||
                    (this.selectedAutoPlay >= 2 && this.video.relatedStreams.length > 0))
            ) {
                this.showToast();
            }
        },
        showToast() {
            this.counter = this.defaultCounter;
            if (this.counter < 1) {
                this.navigateNext();
                return;
            }
            if (this.timeoutCounter) clearInterval(this.timeoutCounter);
            this.timeoutCounter = setInterval(() => {
                this.counter--;
                if (this.counter === 0) {
                    this.dismiss();
                    this.navigateNext();
                }
            }, 1000);
            this.shouldShowToast = true;
        },
        dismiss() {
            clearInterval(this.timeoutCounter);
            this.shouldShowToast = false;
        },
        navigateNext() {
            const params = this.$route.query;
            const video_ids = this.$route.query.video_ids?.split(",") ?? [];
            let url;
            if (this.playlist) {
                url = this.playlist?.relatedStreams?.[this.index]?.url ?? this.video.relatedStreams[0].url;
            } else if (video_ids.length > this.index + 1) {
                url = `${this.$route.path}?index=${this.index + 1}`;
            } else {
                url = this.video.relatedStreams[0].url;
            }
            const searchParams = new URLSearchParams();
            for (var param in params)
                switch (param) {
                    case "v":
                    case "t":
                        break;
                    case "index":
                        if (this.playlist && this.index < this.playlist.relatedStreams.length)
                            searchParams.set("index", this.index + 1);
                        break;
                    case "list":
                        if (this.index < this.playlist.relatedStreams.length) searchParams.set("list", params.list);
                        break;
                    default:
                        searchParams.set(param, params[param]);
                        break;
                }
            // save the fullscreen state
            searchParams.set("fullscreen", this.$refs.videoPlayer.$ui.getControls().isFullScreenEnabled());
            const paramStr = searchParams.toString();
            if (paramStr.length > 0) url += "&" + paramStr;
            this.$router.push(url);
        },
        downloadCurrentFrame() {
            const video = document.querySelector("video");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            let link = document.createElement("a");
            const currentTime = Math.round(video.currentTime * 1000) / 1000;
            link.download = `${this.video.title}_${currentTime}s.png`;
            link.href = canvas.toDataURL();
            link.click();
        },
    },
};
</script>

<style>
.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.5);
}

.description a {
    text-decoration: underline;
    filter: brightness(0.75);
}
</style>

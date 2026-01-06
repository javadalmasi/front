<template>
    <div
        ref="container"
        data-shaka-player-container
        class="direction-ltr relative max-h-screen w-full flex justify-center overflow-hidden"
        :class="{ 'player-container': !isEmbed, 'theater-mode': theaterMode }"
        dir="ltr"
    >
        <video
            ref="videoEl"
            class="direction-ltr h-full w-full"
            data-shaka-player
            :autoplay="shouldAutoPlay"
            :loop="selectedAutoLoop"
            playsinline
            dir="ltr"
        />
        <span
            id="preview-container"
            ref="previewContainer"
            class="direction-ltr absolute bottom-12 z-[2000] mb-[3.5%] hidden flex-col items-center"
            dir="ltr"
        >
            <canvas id="preview" ref="preview" class="direction-ltr rounded-sm" dir="ltr" />
            <span
                v-if="(video?.chapters?.length ?? 0) > 1"
                class="direction-ltr mt-2 text-sm leading-[1.65] drop-shadow-[0_0_2px_white] -mb-2 dark:drop-shadow-[0_0_2px_black]"
                dir="ltr"
            >
                {{ video.chapters.findLast(chapter => chapter.start < currentTime)?.title }}
            </span>
            <span
                class="direction-ltr mt-2 w-min rounded-xl bg-white px-2 pb-1 pt-1.5 text-sm leading-[1.65] dark:bg-dark-700"
                dir="ltr"
                v-text="timeFormat(currentTime)"
            />
        </span>
        <button
            v-if="inSegment"
            class="skip-segment-button direction-ltr"
            type="button"
            :aria-label="$t('actions.skip_segment')"
            aria-pressed="false"
            dir="ltr"
            @click="onClickSkipSegment"
        >
            <span v-t="'actions.skip_segment'" />
            <i class="i-material-symbols:skip-next-rounded"></i>
        </button>
        <span
            v-if="error > 0"
            v-t="{ path: 'player.failed', args: [error] }"
            class="direction-rtl absolute top-8 rounded bg-white/80 p-2 text-lg text-black leading-[1.7] backdrop-blur-lg"
            dir="ltr"
        />
        <div
            v-if="showCurrentSpeed"
            class="direction-ltr text-l absolute left-1/2 top-1/2 flex flex-col transform items-center gap-6 rounded-8 bg-white/80 px-8 py-4 -translate-x-1/2 -translate-y-1/2 dark:bg-dark-700/80"
            dir="ltr"
        >
            <i class="i-fa6-solid:gauge-high h-25 w-25 p-5" />
            <span v-text="$refs.videoEl.playbackRate" />
        </div>
        <div
            v-if="showCurrentVolume"
            class="direction-ltr text-l absolute left-1/2 top-1/2 flex flex-col transform items-center gap-6 rounded-8 bg-white/80 px-8 py-4 -translate-x-1/2 -translate-y-1/2 dark:bg-dark-700/80"
            dir="ltr"
        >
            <i v-if="$refs.videoEl.volume > 0" class="i-fa6-solid:volume-high h-25 w-25 p-5" />
            <i v-else class="i-fa6-solid:volume-xmark h-25 w-25 p-5" />
            <span v-text="Math.round($refs.videoEl.volume * 100) / 100" />
        </div>
    </div>

    <ModalComponent v-if="showSpeedModal" @close="showSpeedModal = false">
        <h2 v-t="'actions.playback_speed'" />
        <div class="flex flex-col">
            <input
                v-model="playbackSpeedInput"
                class="input my-3"
                type="text"
                :placeholder="$t('actions.playback_speed')"
                @keyup.enter="setSpeedFromInput()"
            />
            <button v-t="'actions.okay'" class="btn mr-auto w-min" @click="setSpeedFromInput()" />
        </div>
    </ModalComponent>
</template>

<script>
import "shaka-player/dist/controls.css";
import { replaceWithCdnUrl } from "@/utils/CdnUtils.js";
import { parseTimeParam } from "@/utils/Misc.js";
import { transformThumbnailUrl, getPlayerThumbnailSettings } from "@/utils/ThumbnailUtils.js";
import { findClosestAllowedDimension } from "@/utils/ImageResizer.js";
import ModalComponent from "./ModalComponent.vue";

const shaka = import("shaka-player/dist/shaka-player.ui.js");
const hotkeys = import("hotkeys-js");

export default {
    components: { ModalComponent },
    props: {
        video: {
            type: Object,
            default: () => {
                return {};
            },
        },
        sponsors: {
            type: Object,
            default: () => {
                return {};
            },
        },
        selectedAutoPlay: {
            type: Number,
            default: 1,
        },
        selectedAutoLoop: Boolean,
        isEmbed: Boolean,
        theaterMode: Boolean,
    },
    emits: ["timeupdate", "ended", "navigateNext", "toggle-theater", "toggle-loop", "cycle-autoplay"],
    data() {
        return {
            lastUpdate: new Date().getTime(),
            initialSeekComplete: false,
            destroying: false,
            inSegment: false,
            isHoveringTimebar: false,
            showSpeedModal: false,
            showCurrentSpeed: false,
            hideCurrentSpeed: null,
            showCurrentVolume: false,
            hideCurrentVolume: null,
            playbackSpeedInput: null,
            currentTime: 0,
            seekbarPadding: 2,
            error: 0,
        };
    },
    computed: {
        shouldAutoPlay: _this => {
            return _this.getPreferenceBoolean("playerAutoPlay", true) && !_this.isEmbed;
        },
        preferredVideoCodecs: _this => {
            var preferredVideoCodecs = [];
            const enabledCodecs = _this.getPreferenceString("enabledCodecs", "vp9,avc").split(",");

            if (
                _this.$refs.videoEl.canPlayType('video/mp4; codecs="av01.0.08M.08"') !== "" &&
                enabledCodecs.includes("av1")
            )
                preferredVideoCodecs.push("av01");
            if (_this.$refs.videoEl.canPlayType('video/webm; codecs="vp9"') !== "" && enabledCodecs.includes("vp9"))
                preferredVideoCodecs.push("vp9");
            if (
                _this.$refs.videoEl.canPlayType('video/mp4; codecs="avc1.4d401f"') !== "" &&
                enabledCodecs.includes("avc")
            )
                preferredVideoCodecs.push("avc1");

            return preferredVideoCodecs;
        },
    },
    watch: {
        theaterMode() {
            this.updateTheaterButton();
        },
        selectedAutoLoop() {
            this.updateLoopButton();
        },
        selectedAutoPlay() {
            this.updateAutoPlayButton();
        },
    },
    mounted() {
        if (!this.$shaka) this.shakaPromise = shaka.then(shaka => shaka.default).then(shaka => (this.$shaka = shaka));
        if (!this.$hotkeys)
            this.hotkeysPromise = hotkeys.then(mod => mod.default).then(hotkeys => (this.$hotkeys = hotkeys));
    },
    activated() {
        this.destroying = false;
        this.sponsors?.segments?.forEach(segment => (segment.skipped = false));
        this.hotkeysPromise.then(() => {
            var self = this;
            this.$hotkeys(
                "f,m,j,k,l,c,space,up,down,left,right,ctrl+left,ctrl+right,home,end,0,1,2,3,4,5,6,7,8,9,shift+n,shift+s,shift+,,shift+.,alt+p,return,.,,",
                function (e, handler) {
                    const videoEl = self.$refs.videoEl;
                    switch (handler.key) {
                        case "f":
                            self.$ui.getControls().toggleFullScreen();
                            e.preventDefault();
                            break;
                        case "m":
                            videoEl.muted = !videoEl.muted;
                            e.preventDefault();
                            break;
                        case "j":
                            videoEl.currentTime = Math.max(videoEl.currentTime - 15, 0);
                            e.preventDefault();
                            break;
                        case "l":
                            videoEl.currentTime = videoEl.currentTime + 15;
                            e.preventDefault();
                            break;
                        case "c":
                            self.$player.setTextTrackVisibility(!self.$player.isTextTrackVisible());
                            e.preventDefault();
                            break;
                        case "k":
                        case "space":
                            if (videoEl.paused) videoEl.play();
                            else videoEl.pause();
                            e.preventDefault();
                            break;
                        case "up":
                            self.adjustPlaybackVolume(videoEl.volume + 0.05);
                            e.preventDefault();
                            break;
                        case "down":
                            self.adjustPlaybackVolume(videoEl.volume - 0.05);
                            e.preventDefault();
                            break;
                        case "left":
                            videoEl.currentTime = Math.max(videoEl.currentTime - 5, 0);
                            e.preventDefault();
                            break;
                        case "right":
                            videoEl.currentTime = videoEl.currentTime + 5;
                            e.preventDefault();
                            break;
                        case "ctrl+left": {
                            videoEl.currentTime = self.video.chapters.findLast(
                                chapter => chapter.start < videoEl.currentTime,
                            ).start;
                            e.preventDefault();
                            break;
                        }
                        case "ctrl+right": {
                            videoEl.currentTime =
                                self.video.chapters.find(chapter => chapter.start > videoEl.currentTime)?.start ||
                                videoEl.duration;
                            e.preventDefault();
                            break;
                        }
                        case "home":
                            videoEl.currentTime = 0;
                            e.preventDefault();
                            break;
                        case "end":
                            videoEl.currentTime = videoEl.duration;
                            e.preventDefault();
                            break;
                        case "0":
                            videoEl.currentTime = 0;
                            e.preventDefault();
                            break;
                        case "1":
                            videoEl.currentTime = videoEl.duration * 0.1;
                            e.preventDefault();
                            break;
                        case "2":
                            videoEl.currentTime = videoEl.duration * 0.2;
                            e.preventDefault();
                            break;
                        case "3":
                            videoEl.currentTime = videoEl.duration * 0.3;
                            e.preventDefault();
                            break;
                        case "4":
                            videoEl.currentTime = videoEl.duration * 0.4;
                            e.preventDefault();
                            break;
                        case "5":
                            videoEl.currentTime = videoEl.duration * 0.5;
                            e.preventDefault();
                            break;
                        case "6":
                            videoEl.currentTime = videoEl.duration * 0.6;
                            e.preventDefault();
                            break;
                        case "7":
                            videoEl.currentTime = videoEl.duration * 0.7;
                            e.preventDefault();
                            break;
                        case "8":
                            videoEl.currentTime = videoEl.duration * 0.8;
                            e.preventDefault();
                            break;
                        case "9":
                            videoEl.currentTime = videoEl.duration * 0.9;
                            e.preventDefault();
                            break;
                        case "shift+n":
                            self.$emit("navigateNext");
                            e.preventDefault();
                            break;
                        case "shift+s":
                            self.showSpeedModal = true;
                            break;
                        case "shift+,":
                            self.adjustPlaybackSpeed(videoEl.playbackRate - 0.25);
                            break;
                        case "shift+.":
                            self.adjustPlaybackSpeed(videoEl.playbackRate + 0.25);
                            break;
                        case "alt+p":
                            document.pictureInPictureElement
                                ? document.exitPictureInPicture()
                                : videoEl.requestPictureInPicture();
                            break;
                        case "return":
                            self.skipSegment(videoEl);
                            break;
                        case ".":
                            videoEl.currentTime += 0.04;
                            e.preventDefault();
                            break;
                        case ",":
                            videoEl.currentTime -= 0.04;
                            e.preventDefault();
                            break;
                    }
                },
            );
        });
    },
    deactivated() {
        this.destroying = true;
        this.destroy(true);
    },
    unmounted() {
        this.destroying = true;
        this.destroy(true);
    },
    methods: {
        updateAutoPlayButton() {
            const button = this.$refs.container.querySelector("[data-shaka-autoplay]");
            if (!button) return;

            const icon = button.querySelector("i");
            const span = button.querySelector("span");
            const states = ["Never", "Playlists Only", "Always"];

            span.textContent = `Autoplay: ${states[this.selectedAutoPlay]}`;

            if (this.selectedAutoPlay > 0) {
                icon.textContent = "playlist_play";
            } else {
                icon.textContent = "playlist_remove";
            }
        },
        updateLoopButton() {
            const button = this.$refs.container.querySelector("[data-shaka-loop]");
            if (!button) return;

            const icon = button.querySelector("i");
            const span = button.querySelector("span");

            if (this.selectedAutoLoop) {
                icon.textContent = "repeat_one";
                span.textContent = "Looping";
            } else {
                icon.textContent = "repeat";
                span.textContent = "Loop";
            }
        },
        updateTheaterButton() {
            const button = this.$refs.container.querySelector("[data-shaka-theater-mode]");
            if (!button) return;

            const icon = button.querySelector("i");
            const span = button.querySelector("span");

            if (this.theaterMode) {
                icon.textContent = "fullscreen_exit";
                span.textContent = "Exit Theater Mode";
            } else {
                icon.textContent = "fullscreen";
                span.textContent = "Enter Theater Mode";
            }
        },
        getOptimalThumbnailUrlForPlayer(originalThumbnailUrl) {
            // For the video player, always use 1280x720 with quality 70 on all devices as requested
            const settings = getPlayerThumbnailSettings();

            // Use transformThumbnailUrl with the fixed player settings
            return transformThumbnailUrl(originalThumbnailUrl, {
                width: settings.width,
                height: settings.height,
                quality: settings.quality,
                type: 'player'
            });
        },
        async loadVideo() {
            this.updateSponsors();

            const component = this;
            const videoEl = this.$refs.videoEl;

            // Transform the thumbnail URL to use the CDN with 16:9 aspect ratio suitable for displays
            const cdnThumbnailUrl = this.getOptimalThumbnailUrlForPlayer(this.video.thumbnailUrl);
            videoEl.setAttribute("poster", cdnThumbnailUrl);

            const noPrevPlayer = !this.$player;

            var streams = [];

            streams.push(...this.video.audioStreams);
            streams.push(...this.video.videoStreams);

            const MseSupport = window.MediaSource !== undefined || window.ManagedMediaSource !== undefined;

            const lbry = null;

            var uri;
            var mime;

            if (this.video.livestream) {
                uri = this.video.hls;
                mime = "application/x-mpegURL";
            } else if (
                this.video.audioStreams.length > 0 &&
                !lbry &&
                MseSupport &&
                !this.getPreferenceBoolean("preferHls", false)
            ) {
                if (!this.video.dash) {

                    const dash = (await import("../utils/DashUtils.js")).generate_dash_file_from_formats(
                        streams,
                        this.video.duration,
                    );

                    uri = "data:application/dash+xml;charset=utf-8;base64," + btoa(dash);
                } else {
                    const url = new URL(this.video.dash);
                    url.searchParams.set("rewrite", false);
                    uri = url.toString();
                }
                mime = "application/dash+xml";
            } else if (lbry) {
                uri = lbry.url;
                const contentType = await fetch(uri, {
                    method: "HEAD",
                }).then(response => {
                    uri = response.url;
                    return response.headers.get("Content-Type");
                });
                mime = contentType;
            } else if (this.video.dash && !this.getPreferenceBoolean("preferHls", false)) {
                uri = this.video.dash;
                mime = "application/dash+xml";
            } else if (this.video.hls) {
                uri = this.video.hls;
                mime = "application/x-mpegURL";
            } else {
                uri = this.video.videoStreams.findLast(stream => stream.codec == null).url;
                mime = "video/mp4";
            }

            if (noPrevPlayer)
                this.shakaPromise.then(async () => {
                    if (this.destroying) return;
                    this.$shaka.polyfill.installAll();

                    const localPlayer = new this.$shaka.Player();
                    await localPlayer.attach(videoEl);

                    // Store the current CDN URL for this player instance
                    let currentCdnUrl = import.meta.env.VITE_CDN_URL || "https://storage.vidioo.ir/gl/";

                    localPlayer.getNetworkingEngine().registerRequestFilter((_type, request) => {
                        const uri = request.uris[0];
                        var url = new URL(uri);
                        const headers = request.headers;

                        // Handle range requests for googlevideo.com URLs
                        if (url.host.endsWith(".googlevideo.com") && headers.Range) {
                            url.searchParams.set("range", headers.Range.split("=")[1]);
                            request.headers = {};
                            request.uris[0] = url.toString();
                        }

                        // Apply CDN replacement if enabled
                        if (import.meta.env.VITE_ENABLE_CDN && import.meta.env.VITE_ENABLE_CDN === "true") {
                            const processedUrl = replaceWithCdnUrl(request.uris[0], "", currentCdnUrl);
                            request.uris[0] = processedUrl;
                        }
                    });

                    // Add error handling for CDN fallback
                    localPlayer.addEventListener('error', (event) => {
                        const error = event.detail;
                        console.error('Player error:', error);

                        // Check if the error is related to network/CDN issues
                        if (error.category === 2 || error.code === 1001 || error.code === 1002) { // NETWORK_ERROR or variants
                            console.warn('CDN error detected, switching to fallback CDN...');

                            // Get a new random CDN URL that's different from the current one
                            const allCdnUrls = (import.meta.env.VITE_CDN_URL || "https://storage.vidioo.ir/gl/").split(',').map(url => url.trim()).filter(url => url);

                            // Filter out the current CDN URL to get potential fallbacks
                            const fallbackCdnUrls = allCdnUrls.filter(url => url !== currentCdnUrl);

                            if (fallbackCdnUrls.length > 0) {
                                // Select a random fallback CDN URL
                                const randomFallbackCdn = fallbackCdnUrls[Math.floor(Math.random() * fallbackCdnUrls.length)];
                                currentCdnUrl = randomFallbackCdn;

                                console.log(`Switched to fallback CDN: ${currentCdnUrl}`);

                                // Reload the player with the new CDN
                                this.$nextTick(() => {
                                    const currentTime = this.$player.getPlayheadTime();
                                    const isPaused = this.$refs.videoEl.paused;

                                    // Reload the same content with the new CDN
                                    localPlayer.load(uri, currentTime).then(() => {
                                        if (isPaused) {
                                            this.$refs.videoEl.pause();
                                        }
                                    }).catch(reloadError => {
                                        console.error('Failed to reload with fallback CDN:', reloadError);
                                    });
                                });
                            } else {
                                console.warn('No more fallback CDN URLs available');
                            }
                        }
                    });

                    localPlayer.configure(
                        "streaming.bufferingGoal",
                        Math.max(this.getPreferenceNumber("bufferGoal", 10), 10),
                    );
                    localPlayer.configure("streaming.bufferBehind", 300);

                    this.setPlayerAttrs(localPlayer, videoEl, uri, mime, this.$shaka);
                });
            else this.setPlayerAttrs(this.$player, videoEl, uri, mime, this.$shaka);

            if (noPrevPlayer) {
                videoEl.addEventListener("loadeddata", () => {
                    if (document.pictureInPictureElement) videoEl.requestPictureInPicture();
                });
                videoEl.addEventListener("timeupdate", () => {
                    const time = videoEl.currentTime;
                    this.$emit("timeupdate", time);
                    this.updateProgressDatabase(time);
                    if (this.sponsors && this.sponsors.segments) {
                        const segment = this.findCurrentSegment(time);
                        this.inSegment = !!segment;
                        if (segment?.autoskip && (!segment.skipped || this.selectedAutoLoop)) {
                            this.skipSegment(videoEl, segment);
                        }
                    }
                });

                videoEl.addEventListener("volumechange", () => {
                    this.setPreference("volume", videoEl.volume, true);
                    this.setPreference("muted", videoEl.muted, true);
                });

                videoEl.addEventListener("ratechange", e => {
                    const rate = videoEl.playbackRate;
                    if (rate > 0 && !isNaN(videoEl.duration) && !isNaN(videoEl.duration - e.timeStamp / 1000))
                        this.setPreference("rate", rate, true);
                });

                videoEl.addEventListener("ended", () => {
                    this.$emit("ended");
                });

                videoEl.addEventListener("toggle-theater", () => {
                    this.$emit("toggle-theater");
                });

                videoEl.addEventListener("toggle-loop", () => {
                    this.$emit("toggle-loop");
                });

                videoEl.addEventListener("cycle-autoplay", () => {
                    this.$emit("cycle-autoplay");
                });
            }
            //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
        },
        findCurrentSegment(time) {
            return this.sponsors?.segments?.find(s => time >= s.segment[0] && time < s.segment[1]);
        },
        onClickSkipSegment() {
            const videoEl = this.$refs.videoEl;
            this.skipSegment(videoEl);
        },
        skipSegment(videoEl, segment) {
            const time = videoEl.currentTime;
            if (!segment) segment = this.findCurrentSegment(time);
            if (!segment) return;
            console.log("Skipped segment at " + time);
            videoEl.currentTime = segment.segment[1];
            segment.skipped = true;
        },
        async setPlayerAttrs(localPlayer, videoEl, uri, mime, shaka) {
            const url = "/watch?v=" + this.video.id;

            if (!this.$ui) {
                this.destroy();
                const OpenButton = class extends shaka.ui.Element {
                    constructor(parent, controls) {
                        super(parent, controls);

                        this.newTabButton_ = document.createElement("button");
                        this.newTabButton_.classList.add("shaka-cast-button");
                        this.newTabButton_.classList.add("shaka-tooltip");
                        this.newTabButton_.ariaPressed = "false";

                        this.newTabIcon_ = document.createElement("i");
                        this.newTabIcon_.classList.add("i-material-symbols:launch-rounded");
                        this.newTabButton_.appendChild(this.newTabIcon_);

                        const label = document.createElement("label");
                        label.classList.add("shaka-overflow-button-label");
                        label.classList.add("shaka-overflow-menu-only");
                        this.newTabNameSpan_ = document.createElement("span");
                        this.newTabNameSpan_.innerText = "Open in new tab";
                        label.appendChild(this.newTabNameSpan_);

                        this.newTabButton_.appendChild(label);
                        this.parent.appendChild(this.newTabButton_);

                        this.eventManager.listen(this.newTabButton_, "click", () => {
                            this.video.pause();
                            window.open(url);
                        });
                    }
                };

                OpenButton.Factory = class {
                    create(rootElement, controls) {
                        return new OpenButton(rootElement, controls);
                    }
                };

                shaka.ui.OverflowMenu.registerElement("open_new_tab", new OpenButton.Factory());

                const TheaterModeButton = class extends shaka.ui.Element {
                    constructor(parent, controls) {
                        super(parent, controls);

                        this.button = document.createElement("button");
                        this.button.classList.add("shaka-cast-button");
                        this.button.classList.add("shaka-tooltip");
                        this.button.setAttribute("data-shaka-theater-mode", "true");

                        this.icon = document.createElement("i");
                        this.icon.classList.add("i-material-symbols:fullscreen-rounded");
                        this.button.appendChild(this.icon);

                        const label = document.createElement("label");
                        label.classList.add("shaka-overflow-button-label");
                        label.classList.add("shaka-overflow-menu-only");
                        this.span = document.createElement("span");
                        this.span.textContent = "Enter Theater Mode";
                        label.appendChild(this.span);

                        this.button.appendChild(label);
                        this.parent.appendChild(this.button);

                        this.eventManager.listen(this.button, "click", () => {
                            this.video.dispatchEvent(new Event("toggle-theater"));
                        });
                    }
                };

                TheaterModeButton.Factory = class {
                    create(rootElement, controls) {
                        return new TheaterModeButton(rootElement, controls);
                    }
                };

                shaka.ui.OverflowMenu.registerElement("theater_mode", new TheaterModeButton.Factory());

                const LoopButton = class extends shaka.ui.Element {
                    constructor(parent, controls) {
                        super(parent, controls);

                        this.button = document.createElement("button");
                        this.button.classList.add("shaka-cast-button");
                        this.button.classList.add("shaka-tooltip");
                        this.button.setAttribute("data-shaka-loop", "true");

                        this.icon = document.createElement("i");
                        this.icon.classList.add("i-material-symbols:repeat-rounded");
                        this.button.appendChild(this.icon);

                        const label = document.createElement("label");
                        label.classList.add("shaka-overflow-button-label");
                        label.classList.add("shaka-overflow-menu-only");
                        this.span = document.createElement("span");
                        this.span.textContent = "Loop";
                        label.appendChild(this.span);

                        this.button.appendChild(label);
                        this.parent.appendChild(this.button);

                        this.eventManager.listen(this.button, "click", () => {
                            this.video.dispatchEvent(new Event("toggle-loop"));
                        });
                    }
                };

                LoopButton.Factory = class {
                    create(rootElement, controls) {
                        return new LoopButton(rootElement, controls);
                    }
                };

                shaka.ui.OverflowMenu.registerElement("loop", new LoopButton.Factory());

                const AutoPlayButton = class extends shaka.ui.Element {
                    constructor(parent, controls) {
                        super(parent, controls);

                        this.button = document.createElement("button");
                        this.button.classList.add("shaka-cast-button");
                        this.button.classList.add("shaka-tooltip");
                        this.button.setAttribute("data-shaka-autoplay", "true");

                        this.icon = document.createElement("i");
                        this.icon.classList.add("i-material-symbols:playlist-play-rounded");
                        this.button.appendChild(this.icon);

                        const label = document.createElement("label");
                        label.classList.add("shaka-overflow-button-label");
                        label.classList.add("shaka-overflow-menu-only");
                        this.span = document.createElement("span");
                        this.span.textContent = "Autoplay";
                        label.appendChild(this.span);

                        this.button.appendChild(label);
                        this.parent.appendChild(this.button);

                        this.eventManager.listen(this.button, "click", () => {
                            this.video.dispatchEvent(new Event("cycle-autoplay"));
                        });
                    }
                };

                AutoPlayButton.Factory = class {
                    create(rootElement, controls) {
                        return new AutoPlayButton(rootElement, controls);
                    }
                };

                shaka.ui.OverflowMenu.registerElement("autoplay", new AutoPlayButton.Factory());

                this.$ui = new shaka.ui.Overlay(localPlayer, this.$refs.container, videoEl);

                // Set the UI language to the application's current locale
                this.$ui.getControls().getLocalization().changeLocale([this.$i18n.locale]);

                var overflowMenuButtons = [
                    "loop",
                    "quality",
                    "captions",
                    "picture_in_picture",
                    "playback_rate",
                    "airplay",
                ];

                if (!this.isEmbed) {
                    overflowMenuButtons = ["theater_mode", ...overflowMenuButtons];
                    overflowMenuButtons = ["autoplay", ...overflowMenuButtons];
                }

                if (this.isEmbed) {
                    overflowMenuButtons.push("open_new_tab");
                }

                const config = {
                    overflowMenuButtons: overflowMenuButtons,
                    seekBarColors: {
                        base: "var(--player-base)",
                        buffered: "var(--player-buffered)",
                        played: "var(--player-played)",
                    },
                };

                this.$ui.configure(config);
                this.updateTheaterButton();
                this.updateLoopButton();
                this.updateAutoPlayButton();
            }

            this.updateMarkers();

            const event = new Event("playerInit");
            window.dispatchEvent(event);

            const player = this.$ui.getControls().getPlayer();

            this.$player = player;

            // Delay calling DOM-dependent functions until the UI is fully rendered
            this.$nextTick(() => {
                // Ensure the player and UI have been fully initialized before setting up DOM features
                if (this.$player && this.$ui) {
                    this.setupSeekbarPreview();
                }
            });

            const disableVideo = this.getPreferenceBoolean("listen", false) && !this.video.livestream;

            const prefetchLimit = Math.min(Math.max(this.getPreferenceNumber("prefetchLimit", 2), 0), 10);

            this.$player.configure({
                preferredVideoCodecs: this.preferredVideoCodecs,
                preferredAudioCodecs: ["opus", "mp4a"],
                manifest: {
                    disableVideo: disableVideo,
                },
                streaming: {
                    segmentPrefetchLimit: prefetchLimit,
                    retryParameters: {
                        maxAttempts: Infinity,
                        baseDelay: 250,
                        backoffFactor: 1.5,
                    },
                },
                abr: {
                    enabled: true, // Explicitly enable ABR by default
                },
            });

            const quality = this.getPreferenceNumber("quality", 0);
            // Enable ABR by default for adaptive streaming
            this.$player.configure("abr.enabled", true);

            // Determine if we have video streams available to apply quality selection
            const hasVideoStreams = this.video.videoStreams && this.video.videoStreams.length > 0;
            const hasAudioStreams = this.video.audioStreams && this.video.audioStreams.length > 0;
            const isLivestream = this.video.livestream;

            // Check if quality has been explicitly set in preferences (not auto/0)
            const qualityExplicitlySet = quality > 0;

            // Apply quality selection if quality is explicitly set and we have streams
            if (qualityExplicitlySet && (hasVideoStreams || isLivestream) && !disableVideo) {
                // If a specific quality is selected, disable ABR to respect user preference
                this.$player.configure("abr.enabled", false);
            } else {
                // Ensure ABR is enabled when no specific quality is selected or no video streams available
                this.$player.configure("abr.enabled", true);
                // Additional ABR configurations for optimal performance
                this.$player.configure({
                    abr: {
                        restrictions: {
                            maxBandwidth: Infinity, // Allow highest bandwidth when ABR is active
                            minBandwidth: 0, // Allow lowest bandwidth when ABR is active
                        },
                    },
                });
            }

            const time = this.$route.query.t ?? this.$route.query.start;

            var startTime = 0;

            if (time) {
                startTime = parseTimeParam(time);
                this.initialSeekComplete = true;
            } else if (window.db && this.getPreferenceBoolean("watchHistory", true)) {
                await new Promise(resolve => {
                    var tx = window.db.transaction("watch_history", "readonly");
                    var store = tx.objectStore("watch_history");
                    var request = store.get(this.video.id);
                    request.onsuccess = function (event) {
                        var video = event.target.result;
                        const currentTime = video?.currentTime;
                        if (currentTime) {
                            if (currentTime < video.duration * 0.9) {
                                startTime = currentTime;
                            }
                        }
                        resolve();
                    };

                    tx.oncomplete = () => {
                        this.initialSeekComplete = true;
                    };
                });
            } else {
                this.initialSeekComplete = true;
            }

            player
                .load(uri, startTime, mime)
                .then(() => {
                    const isSafari = window.navigator?.vendor?.includes("Apple");

                    let lang = "en";
                    if (!isSafari) {
                        // Set the audio language to the application's current locale
                        const prefLang = this.$i18n.locale.substr(0, 2);
                        if (player.getAudioLanguages().includes(prefLang)) lang = prefLang;
                        else if (player.getAudioLanguages().includes("en")) lang = "en"; // fallback to English
                        player.selectAudioLanguage(lang);
                    }

                    const audioLanguages = player.getAudioLanguages();
                    if (audioLanguages.length > 1) {
                        const overflowMenuButtons = this.$ui.getConfiguration().overflowMenuButtons;
                        // append language menu on index 1
                        const newOverflowMenuButtons = [
                            ...overflowMenuButtons.slice(0, 1),
                            "language",
                            ...overflowMenuButtons.slice(1),
                        ];
                        this.$ui.configure("overflowMenuButtons", newOverflowMenuButtons);
                    }

                    if (qualityExplicitlySet && (hasVideoStreams || isLivestream) && !disableVideo) {
                        var leastDiff = Number.MAX_VALUE;
                        var bestStream = null;

                        var bestAudio = 0;

                        const tracks = player
                            .getVariantTracks()
                            .filter(track => track.language == lang || track.language == "und");

                        // Choose the best audio stream
                        if (quality >= 480)
                            tracks.forEach(track => {
                                const audioBandwidth = track.audioBandwidth;
                                if (audioBandwidth > bestAudio) bestAudio = audioBandwidth;
                            });

                        // Find best matching stream based on resolution and bitrate
                        tracks
                            .sort((a, b) => a.bandwidth - b.bandwidth)
                            .forEach(stream => {
                                if (stream.audioBandwidth < bestAudio) return;

                                const diff = Math.abs(quality - stream.height);
                                if (diff < leastDiff) {
                                    leastDiff = diff;
                                    bestStream = stream;
                                }
                            });

                        player.selectVariantTrack(bestStream, true);
                    }

                    this.video.subtitles.map(subtitle => {
                        player.addTextTrackAsync(
                            subtitle.url,
                            subtitle.code,
                            "subtitles",
                            subtitle.mimeType,
                            null,
                            subtitle.name,
                        );
                    });
                    // Set volume with 50% as default if no user preference exists
                    const volume = this.getPreferenceNumber("volume", 0.5);
                    videoEl.volume = volume;
                    // Ensure the volume preference is saved if it wasn't previously set
                    if (localStorage.getItem("volume") === null) {
                        this.setPreference("volume", volume, true);
                    }
                    // Set muted state from preferences, defaulting to false
                    const muted = this.getPreferenceBoolean("muted", false);
                    videoEl.muted = muted;
                    // Ensure the muted preference is saved if it wasn't previously set
                    if (localStorage.getItem("muted") === null) {
                        this.setPreference("muted", muted, true);
                    }
                    const rate = this.getPreferenceNumber("rate", 1);
                    videoEl.playbackRate = rate;
                    videoEl.defaultPlaybackRate = rate;

                    const autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
                    this.$player.setTextTrackVisibility(autoDisplayCaptions);

                    const prefSubtitles = this.getPreferenceString("subtitles", "");
                    if (prefSubtitles !== "") {
                        const textTracks = this.$player.getTextTracks();
                        const subtitleIdx = textTracks.findIndex(textTrack => textTrack.language == prefSubtitles);
                        if (subtitleIdx != -1) {
                            this.$player.setTextTrackVisibility(true);
                            this.$player.selectTextTrack(textTracks[subtitleIdx]);
                        }
                    }
                })
                .catch(e => {
                    console.error(e);
                    this.error = e.code;
                });

            // expand the player to fullscreen when the fullscreen query equals true
            if (this.$route.query.fullscreen === "true" && !this.$ui.getControls().isFullScreenEnabled())
                this.$ui.getControls().toggleFullScreen();

            const seekbar = this.$refs.container.querySelector(".shaka-seek-bar");
            if (!seekbar) {
                console.warn("Seek bar not found in DOM when updating markers");
                return;
            }
            const array = ["to right"];
            for (const chapter of this.video.chapters) {
                const start = (chapter.start / this.video.duration) * 100;
                if (start === 0) {
                    continue;
                }
                array.push(`transparent ${start}%`);
                array.push(`black ${start}%`);
                array.push(`black calc(${start}% + 1px)`);
                array.push(`transparent calc(${start}% + 1px)`);
            }
            seekbar.style.background = `linear-gradient(${array.join(",")})`;

            seekbar.addEventListener("mouseup", () => {
                this.$refs.videoEl.focus();
            });
        },
        async updateProgressDatabase(time) {
            // debounce
            if (new Date().getTime() - this.lastUpdate < 500) return;
            this.lastUpdate = new Date().getTime();

            if (!this.initialSeekComplete || !this.video.id || !window.db) return;

            var tx = window.db.transaction("watch_history", "readwrite");
            var store = tx.objectStore("watch_history");
            var request = store.get(this.video.id);
            request.onsuccess = function (event) {
                var video = event.target.result;
                if (video) {
                    video.currentTime = time;
                    store.put(video);
                }
            };
        },
        seek(time) {
            if (this.$refs.videoEl) {
                this.$refs.videoEl.currentTime = time;
            }
        },
        adjustPlaybackSpeed(newSpeed) {
            const normalizedSpeed = Math.min(4, Math.max(0.25, newSpeed));
            this.$player.trickPlay(normalizedSpeed);
            if (this.hideCurrentSpeed) window.clearTimeout(this.hideCurrentSpeed);
            this.showCurrentSpeed = false;
            this.showCurrentSpeed = true;
            this.hideCurrentSpeed = window.setTimeout(() => (this.showCurrentSpeed = false), 1500);
        },
        adjustPlaybackVolume(newVolume) {
            const normalizedVolume = Math.min(1, Math.max(0, newVolume));
            this.$refs.videoEl.volume = normalizedVolume;
            // Save the volume to localStorage
            this.setPreference("volume", normalizedVolume, true);
            if (this.hideCurrentVolume) window.clearTimeout(this.hideCurrentVolume);
            this.showCurrentVolume = false;
            this.showCurrentVolume = true;
            this.hideCurrentVolume = window.setTimeout(() => (this.showCurrentVolume = false), 1500);
        },
        setSpeedFromInput() {
            try {
                const newSpeed = Number(this.playbackSpeedInput);
                this.adjustPlaybackSpeed(newSpeed);
            } catch (err) {
                alert(this.$t("actions.invalid_input"));
            }
            this.showSpeedModal = false;
        },
        updateMarkers() {
            const markers = this.$refs.container.querySelector(".shaka-ad-markers");
            const array = ["to right"];
            this.sponsors?.segments?.forEach(segment => {
                const start = (segment.segment[0] / this.video.duration) * 100;
                const end = (segment.segment[1] / this.video.duration) * 100;

                var color = [
                    "sponsor",
                    "selfpromo",
                    "interaction",
                    "poi_highlight",
                    "intro",
                    "outro",
                    "preview",
                    "filler",
                    "music_offtopic",
                ].includes(segment.category)
                    ? `var(--spon-seg-${segment.category})`
                    : "var(--spon-seg-default)";

                array.push(`transparent ${start}%`);
                array.push(`${color} ${start}%`);
                array.push(`${color} ${end}%`);
                array.push(`transparent ${end}%`);
            });

            if (array.length <= 1) {
                return;
            }

            if (markers) markers.style.background = `linear-gradient(${array.join(",")})`;
        },
        updateSponsors() {
            if (this.getPreferenceBoolean("showMarkers", true)) {
                this.shakaPromise.then(() => {
                    this.updateMarkers();
                });
            }
        },
        setupSeekbarPreview() {
            if (!this.video.previewFrames) return;

            // Use nextTick to ensure DOM is fully rendered before accessing elements
            this.$nextTick(() => {
                let seekBar = document.querySelector(".shaka-seek-bar");
                // Check if seekBar exists before trying to add event listeners
                if (!seekBar) {
                    console.warn("Seek bar not found in DOM when setting up preview");
                    return;
                }

                // Check if preview container exists before trying to access it
                if (!this.$refs.previewContainer) {
                    console.warn("$refs.previewContainer not found when setting up preview");
                    return;
                }

                // Remove any existing event listeners to prevent duplicates
                seekBar.removeEventListener("mousemove", this.handleSeekbarMouseMove);
                seekBar.removeEventListener("mouseout", this.handleSeekbarMouseOut);

                // Add event listeners with bound methods
                seekBar.addEventListener("mousemove", this.handleSeekbarMouseMove);
                seekBar.addEventListener("mouseout", this.handleSeekbarMouseOut);
            });
        },
        async showSeekbarPreview(position) {
            const frame = this.getFrame(position);
            if (!frame) return;
            const originalImage = await this.loadImage(frame.url);
            if (!this.isHoveringTimebar) return;

            const seekBar = document.querySelector(".shaka-seek-bar");
            if (!seekBar) {
                console.warn("Seek bar not found in DOM when showing preview");
                return;
            }

            if (!this.$refs.previewContainer || !this.$refs.preview) {
                console.warn("$refs not found when showing preview");
                return;
            }

            const container = this.$refs.previewContainer;
            const canvas = this.$refs.preview;
            const ctx = canvas.getContext("2d");

            const offsetX = frame.positionX * frame.frameWidth;
            const offsetY = frame.positionY * frame.frameHeight;

            canvas.width = frame.frameWidth > 100 ? frame.frameWidth : frame.frameWidth * 2;
            canvas.height = frame.frameWidth > 100 ? frame.frameHeight : frame.frameHeight * 2;
            // draw the thumbnail preview into the canvas by cropping only the relevant part
            ctx.drawImage(
                originalImage,
                offsetX,
                offsetY,
                frame.frameWidth,
                frame.frameHeight,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            // calculate the thumbnail preview offset and display it
            const centerOffset = position / this.video.duration / 10;
            const left = centerOffset - ((0.5 * canvas.width) / seekBar.clientWidth) * 100;
            const maxLeft =
                ((seekBar.clientWidth - canvas.clientWidth) / seekBar.clientWidth) * 100 - this.seekbarPadding;

            this.currentTime = position / 1000;

            container.style.left = `max(${this.seekbarPadding}%, min(${left}%, ${maxLeft}%))`;
            container.style.display = "flex";
        },
        handleSeekbarMouseMove(e) {
            this.isHoveringTimebar = true;
            const position = (e.offsetX / e.target.offsetWidth) * this.video.duration;
            this.showSeekbarPreview(position * 1000);
        },
        handleSeekbarMouseOut() {
            this.isHoveringTimebar = false;
            if (this.$refs.previewContainer) {
                this.$refs.previewContainer.style.display = "none";
            }
        },
        // algorithm to find the thumbnail corresponding to the currently hovered position in the video
        getFrame(position) {
            const framePage = this.video.previewFrames?.at(-1);
            if (!framePage) {
                return null;
            }

            const { durationPerFrame, framesPerPageX, framesPerPageY, urls, frameWidth, frameHeight } = framePage;

            const framesPerUrl = framesPerPageX * framesPerPageY;

            const frameIndex = Math.floor(position / durationPerFrame);

            const urlIndex = Math.floor(frameIndex / framesPerUrl);
            if (urlIndex >= urls.length) {
                return null; // Position is out of bounds
            }

            const frameIndexInUrl = frameIndex % framesPerUrl;

            const positionY = Math.floor(frameIndexInUrl / framesPerPageX);
            const positionX = frameIndexInUrl % framesPerPageX;

            return {
                url: urls[urlIndex],
                positionX,
                positionY,
                frameWidth,
                frameHeight,
            };
        },
        // creates a new image from an URL
        loadImage(url) {
            return new Promise(r => {
                const i = new Image();
                i.onload = () => r(i);
                i.src = url;
            });
        },
        async destroy(hotkeys) {
            try {
                // Remove event listeners first to prevent errors during destruction
                if (this.$refs.container) {
                    const seekBar = this.$refs.container.querySelector(".shaka-seek-bar");
                    if (seekBar && this.handleSeekbarMouseMove && this.handleSeekbarMouseOut) {
                        seekBar.removeEventListener("mousemove", this.handleSeekbarMouseMove);
                        seekBar.removeEventListener("mouseout", this.handleSeekbarMouseOut);
                    }
                }

                if (this.$ui && !document.pictureInPictureElement) {
                    await this.$ui.destroy();
                    this.$ui = undefined;
                }

                if (this.$player) {
                    await this.$player.destroy();
                    this.$player = undefined;
                }

                if (hotkeys) this.$hotkeys?.unbind();

                // Safely remove child nodes only if they are actually children
                if (this.$refs.container) {
                    const childDivs = this.$refs.container.querySelectorAll("div");
                    for (let i = childDivs.length - 1; i >= 0; i--) {
                        const div = childDivs[i];
                        if (div.parentNode === this.$refs.container) {
                            div.remove();
                        }
                    }
                }
            } catch (error) {
                console.warn("Error during player destruction:", error);
                // Set to undefined anyway to prevent further issues
                this.$ui = undefined;
                this.$player = undefined;
            }
        },
    },
};
</script>

<style>
:root {
    --player-base: rgba(255, 255, 255, 0.3);
    --player-buffered: rgba(255, 255, 255, 0.54);
    --player-played: rgba(255, 0, 0);

    --spon-seg-sponsor: #00d400;
    --spon-seg-selfpromo: #ffff00;
    --spon-seg-interaction: #cc00ff;
    --spon-seg-poi_highlight: #ff1684;
    --spon-seg-intro: #00ffff;
    --spon-seg-outro: #0202ed;
    --spon-seg-preview: #008fd6;
    --spon-seg-filler: #7300ff;
    --spon-seg-music_offtopic: #ff9900;
    --spon-seg-default: white;
}

.player-container {
    @apply max-h-75vh min-h-64 bg-black w-full;
    aspect-ratio: 16 / 9;
    position: relative;
    max-width: 100%;
    margin: 0;
    padding: 0;
}

/* Ensure proper constraints on mobile devices */
@media (max-width: 767px) {
    .player-container {
        width: 100vw !important;
        max-width: 100vw !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
}

.player-container video {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* Apply rounded corners only on desktop (not on mobile) and not in theater mode */
@media (min-width: 1024px) {
    .player-container:not(.theater-mode) {
        @apply rounded-xl;
    }
    .player-container:not(.theater-mode) video {
        @apply rounded-xl;
    }
}

/* Override rounded corners on mobile and in theater mode */
@media (max-width: 1023px) {
    .player-container {
        @apply rounded-none;
    }
    .player-container video {
        @apply rounded-none;
    }
}

.player-container.theater-mode,
.player-container.theater-mode video {
    @apply rounded-none;
}

.shaka-video-container i[class*='i-material-symbols'] {
    @apply !text-base leading-[1.65];
    font-size: 1em !important;
    margin-right: 10px;
}

.shaka-current-time {
    @apply !text-base leading-[1.65];
}

.shaka-video-container:-webkit-full-screen {
    max-height: none !important;
}

/* captions style */
.shaka-text-wrapper * {
    text-align: left !important;
}

.shaka-text-wrapper > span > span {
    background-color: transparent !important;
}

/* apply to all spans that don't include multiple other spans to avoid the style being applied to the text container too when the subtitles are two lines */
.shaka-text-wrapper > span > span *:first-child:last-child {
    background-color: rgba(0, 0, 0, 0.6) !important;
    padding: 0.09em 0;
}

#shaka-player-ui-time-container {
    display: none !important;
}

.skip-segment-button {
    /* position button above player overlay */
    z-index: 1000;

    position: absolute;
    transform: translate(0, -50%);
    top: 50%;
    right: 0;

    background-color: rgb(0 0 0 / 0.5);
    border: 2px rgba(255, 255, 255, 0.75) solid;
    border-right: 0;
    border-radius: 0.75em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 0.5em;

    /* center text vertically */
    display: flex;
    align-items: center;
    justify-content: center;

    color: #fff;
    line-height: 1.5em;
}

.skip-segment-button i[class*='i-material-symbols'] {
    font-size: 1.6em !important;
    line-height: inherit !important;
}

.direction-ltr {
    direction: ltr !important;
    text-align: left !important;
}

@media (max-width: 1024px) {
    [data-shaka-theater-mode] {
        display: none !important;
    }
}
</style>

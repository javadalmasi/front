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
    <div id="theaterModeSpot" class="mx-0"></div>
    <PageNotFound v-if="video && checkIfLivestreamDisabled(video)" />
    <div v-else-if="video && video.error" class="min-h-[80vh] flex flex-col items-center justify-center">
        <h1 v-t="'info.error'" class="text-3xl font-bold"></h1>
        <p class="mt-4 text-xl">{{ video.message || $t("info.video_not_found") }}</p>
        <a v-t="'actions.back_to_home'" :href="homeUrl" class="btn mt-4"></a>
    </div>
    <LoadingIndicatorPage v-else :show-content="video && !isEmbed && !checkIfLivestreamDisabled(video)" class="w-full">
        <Transition>
            <ToastComponent v-if="shouldShowToast" @dismissed="dismiss">
                <i18n-t keypath="info.next_video_countdown">{{ counter }}</i18n-t>
            </ToastComponent>
        </Transition>
        <div v-if="video && !checkIfLivestreamDisabled(video)" class="flex gap-5">
            <div class="flex-auto">
                <div>
                    <Teleport defer to="#theaterModeSpot" :disabled="!theaterMode">
                        <div class="flex flex-row">
                            <keep-alive>
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
                                    @toggle-theater="
                                        theaterMode = !theaterMode;
                                        setPreference('theaterMode', theaterMode);
                                    "
                                    @toggle-loop="selectedAutoLoop = !selectedAutoLoop"
                                    @cycle-autoplay="
                                        selectedAutoPlay = (selectedAutoPlay + 1) % 3;
                                        setPreference('autoplay', selectedAutoPlay, true);
                                    "
                                />
                            </keep-alive>
                        </div>
                    </Teleport>
                    <div v-if="video && isMobile" class="px-2">
                        <ChaptersBar
                            v-if="video?.chapters?.length > 0 && showChapters && !chaptersDisabled"
                            :mobile-layout="isMobile"
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
                    </div>
                    <!-- video title -->
                    <div class="mt-2 break-words px-2 text-2xl font-bold leading-[1.55]" v-text="video.title" />
                    <div class="mb-3 mt-3 flex flex-wrap px-2">
                        <!-- views / date -->
                        <div class="flex flex-auto gap-2">
                            <span v-t="{ path: 'video.views', args: { views: addCommas(video.views) } }" />
                            <span> | </span>
                            <span :title="new Date(video.uploadDate).toLocaleString()" v-text="uploadDate" />
                        </div>
                        <!-- Likes/disilikes -->
                        <div v-if="likesDislikesEnabled" class="flex gap-2">
                            <template v-if="video.likes >= 0">
                                <div class="flex items-center">
                                    <div class="i-fa6-solid:thumbs-up" />
                                    <strong class="mr-1" v-text="addCommas(video.likes)" />
                                </div>
                                <div class="flex items-center">
                                    <div class="i-fa6-solid:thumbs-down" />
                                    <strong
                                        class="mr-1"
                                        v-text="video.dislikes >= 0 ? addCommas(video.dislikes) : '?'"
                                    />
                                </div>
                            </template>
                            <template v-if="video.likes < 0">
                                <div>
                                    <strong v-t="'video.ratings_disabled'" />
                                </div>
                            </template>
                        </div>
                    </div>
                    <!-- Channel info & options flex container -->
                    <div class="flex flex-wrap gap-1 px-2">
                        <!-- Channel Image & Info -->
                        <div class="flex items-center gap-3">
                            <router-link :to="video.uploaderUrl" class="mr-1.5">
                                <div class="relative inline-block">
                                    <img
                                        loading="lazy"
                                        :src="video.uploaderAvatar"
                                        :class="{
                                            'border-2 border-blue-700': video.uploaderVerified,
                                            'rounded-full': true,
                                        }"
                                        class="h-48px w-48px"
                                        width="48"
                                        height="48"
                                    />
                                    <div
                                        v-if="video.uploaderVerified"
                                        class="absolute end-0 bottom-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-700"
                                    >
                                        <i class="i-fa6-solid:check text-[10px] text-white" />
                                    </div>
                                </div>
                            </router-link>
                            <router-link v-if="video.uploaderUrl" class="link" :to="video.uploaderUrl">{{
                                video.uploader
                            }}</router-link>
                        </div>

                        <ShareModal
                            v-if="showShareModal"
                            :video-id="getVideoId()"
                            :current-time="currentTime"
                            :playlist-id="playlistId"
                            :playlist-index="index"
                            @close="showShareModal = !showShareModal"
                        />
                        <div class="mr-auto flex flex-wrap gap-1">
                            <!-- Download Frame Button -->
                            <button
                                v-if="!isDownloadThumbnailDisabled"
                                class="btn btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 <md:hidden"
                                @click="downloadCurrentFrame"
                                :title="$t('actions.download_frame')"
                                aria-label="Download frame"
                            >
                                <i class="i-fa6-solid:download" />
                            </button>

                            <!-- Subscribe/Unsubscribe Button -->
                            <button
                                :class="`btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 ${subscribed ? 'btn btn-unsubscribe' : 'btn btn-danger'}`"
                                @click="subscribeHandler"
                                :title="$t('actions.' + (subscribed ? 'unsubscribe' : 'subscribe'))"
                                aria-label="Subscribe/Unsubscribe"
                            >
                                <i v-if="!subscribed" class="i-fa6-solid:bell" />
                                <i v-if="subscribed" class="i-fa6-solid:bell-slash" />
                            </button>
                            
                            <!-- Like/Dislike Buttons -->
                            <button
                                v-if="!isLikeDislikeDisabled"
                                :class="`btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 ${(isVideoLiked(video.id) ? 'btn btn-success active' : 'btn btn-secondary')}`"
                                @click="handleLike"
                                :title="$t('actions.like')"
                                aria-label="Like"
                            >
                                <i class="i-fa6-solid:thumbs-up" />
                            </button>
                            <button
                                v-if="!isLikeDislikeDisabled"
                                :class="`btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 ${isVideoDisliked(video.id) ? 'btn btn-error active' : 'btn btn-secondary'}`"
                                @click="handleDislike"
                                :title="$t('actions.dislike')"
                                aria-label="Dislike"
                            >
                                <i class="i-fa6-solid:thumbs-down" />
                            </button>
                            
                            <div class="flex flex-wrap gap-1">
                                <!-- RSS Feed button -->
                                <a
                                    v-if="video.uploaderUrl && !isRssFeedDisabled"
                                    :href="`${apiUrl()}/feed/unauthenticated/rss?channels=${video.uploaderUrl.split('/')[2]}`"
                                    target="_blank"
                                    class="btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 btn btn-secondary"
                                    :title="$t('actions.rss_feed')"
                                    aria-label="RSS feed"
                                >
                                    <i class="i-fa6-solid:rss" />
                                </a>
                                <!-- Share Dialog -->
                                <button
                                    class="btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 btn btn-secondary"
                                    @click="showShareModal = !showShareModal"
                                    :title="$t('actions.share')"
                                    aria-label="Share"
                                >
                                    <i class="i-fa6-solid:share" />
                                </button>
                                <!-- YouTube -->
                                <WatchOnButton :link="youtubeVideoHref" />
                                <!-- Odysee -->
                                <WatchOnButton
                                    v-if="video.lbryId"
                                    :link="`https://odysee.com/${video.lbryId}`"
                                    platform="Odysee"
                                />
                                <!-- listen / watch toggle -->
                                <router-link
                                    :to="toggleListenUrl"
                                    :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                                    :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                                    class="btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 btn btn-secondary"
                                >
                                    <i
                                        :class="isListening ? 'i-fa6-solid:tv' : 'i-fa6-solid:headphones'"
                                    />
                                </router-link>

                            </div>
                        </div>
                    </div>

                    <hr class="mb-2 px-2" />

                    <div
                        v-for="metaInfo in video?.metaInfo ?? []"
                        :key="metaInfo.title"
                        class="btn btn-secondary mx-2 my-3 flex flex-wrap cursor-default gap-2 px-2 py-2"
                    >
                        <span>{{ metaInfo.description ?? metaInfo.title }}</span>
                        <a v-for="(link, linkIndex) in metaInfo.urls" :key="linkIndex" :href="link" class="underline">{{
                            metaInfo.urlTexts[linkIndex]
                        }}</a>
                        <br />
                    </div>

                    <div class="px-2">
                        <!-- Description, tags, category, and license section -->
                        <div class="mt-2 rounded-lg bg-gray-100 p-4 dark:bg-dark-800">
                            <!-- Show description if it exists -->
                            <div v-if="hasDescription" class="mb-3">
                                <CollapsableText
                                    :text="processedDescription"
                                    :visible-limit="150"
                                    @expanded="onDescriptionExpanded"
                                />
                            </div>

                            <!-- Show additional info (category, license, tags) when description is expanded -->
                            <div
                                v-if="hasDescription && showAdditionalInfo"
                                class="mt-3 border-t border-gray-300 pt-3 dark:border-gray-700"
                            >
                                <div
                                    v-if="video.category"
                                    class="mb-2"
                                    v-text="`${$t('video.category')}: ${video.category}`"
                                />
                                <div
                                    v-if="!isLicenseInfoDisabled"
                                    class="mb-2"
                                    v-text="`${$t('video.license')}: ${video.license}`"
                                />
                                <div
                                    v-if="!isLicenseInfoDisabled"
                                    class="mb-2 capitalize"
                                    v-text="`${$t('video.visibility')}: ${video.visibility}`"
                                />

                                <!-- Show tags if they exist (original + extracted) -->
                                <div v-if="allTags.length > 0" class="mt-3 flex flex-wrap gap-2">
                                    <router-link
                                        v-for="tag in allTags"
                                        :key="tag"
                                        class="btn btn-secondary line-clamp-1 rounded-2xl px-4 py-1 text-sm"
                                        :to="`/results?search_query=${encodeURIComponent(tag)}`"
                                        >{{ tag }}</router-link
                                    >
                                </div>
                            </div>

                            <!-- Show other info when there's no description -->
                            <div v-if="!hasDescription">
                                <div
                                    v-if="video.category"
                                    class="mb-2"
                                    v-text="`${$t('video.category')}: ${video.category}`"
                                />
                                <div
                                    v-if="!isLicenseInfoDisabled"
                                    class="mb-2"
                                    v-text="`${$t('video.license')}: ${video.license}`"
                                />
                                <div
                                    v-if="!isLicenseInfoDisabled"
                                    class="mb-2 capitalize"
                                    v-text="`${$t('video.visibility')}: ${video.visibility}`"
                                />

                                <!-- Show tags if they exist (original + extracted) -->
                                <div v-if="allTags.length > 0" class="mt-3 flex flex-wrap gap-2">
                                    <router-link
                                        v-for="tag in allTags"
                                        :key="tag"
                                        class="btn btn-secondary line-clamp-1 rounded-2xl px-4 py-1 text-sm"
                                        :to="`/results?search_query=${encodeURIComponent(tag)}`"
                                        >{{ tag }}</router-link
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="px-2" />
                <div v-if="isMobile">
                    <a
                        v-if="!isRecommendationsToggleDisabled"
                        v-t="`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`"
                        class="btn btn-secondary mb-2 mt-2 px-2"
                        @click="showRecs = !showRecs"
                    />
                    <hr v-show="showRecs" class="px-2" />
                    <div v-show="showRecs" class="px-2">
                        <ContentItem
                            v-for="related in video.relatedStreams"
                            :key="related.url"
                            :item="related"
                            :prefer-listen="isListening"
                            :clamp-title-lines="false"
                            class="mb-4"
                            height="94"
                            width="168"
                        />
                    </div>
                    <hr class="" />
                </div>

                <div v-if="commentsEnabled" class="flex flex-col px-2">
                    <div class="mt-2">
                        <button
                            v-if="!comments?.disabled"
                            class="btn btn-secondary mb-2"
                            @click="toggleComments"
                            v-text="
                                `${$t(showComments ? 'actions.minimize_comments' : 'actions.show_comments')} (${numberFormat(
                                    comments?.commentCount,
                                )})`
                            "
                        />
                    </div>
                    <div v-if="!showComments" class=""></div>
                    <div v-else-if="!comments" class="">
                        <p v-t="'comment.loading'" class="mt-8 text-center"></p>
                    </div>
                    <div v-else-if="comments.disabled" class="">
                        <p v-t="'comment.disabled'" class="mt-8 text-center"></p>
                    </div>
                    <div v-else ref="comments" class="">
                        <CommentItem
                            v-for="comment in comments.comments"
                            :key="comment.commentId"
                            :comment="comment"
                            :uploader="video.uploader"
                            :uploader-avatar-url="video.uploaderAvatar"
                            :video-id="getVideoId()"
                            :comments-disabled="!commentsEnabled"
                        />
                    </div>
                </div>
            </div>
            <div v-if="video && !isMobile" class="max-w-96 flex-none">
                <ChaptersBar
                    v-if="video?.chapters?.length > 0 && showChapters && !chaptersDisabled"
                    :mobile-layout="isMobile"
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
                <a
                    v-if="!isRecommendationsToggleDisabled"
                    v-t="`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`"
                    class="btn btn-secondary mb-2"
                    @click="showRecs = !showRecs"
                />
                <hr v-show="showRecs" />
                <div v-show="showRecs">
                    <ContentItem
                        v-for="related in video.relatedStreams"
                        :key="related.url"
                        :item="related"
                        :prefer-listen="isListening"
                        :clamp-title-lines="false"
                        class="mb-4"
                        height="94"
                        width="168"
                    />
                </div>
            </div>
        </div>
    </LoadingIndicatorPage>
</template>

<script>
import VideoPlayer from "./VideoPlayer.vue";
import ContentItem from "./ContentItem.vue";
import CommentItem from "./CommentItem.vue";
import ChaptersBar from "./ChaptersBar.vue";


import ShareModal from "./ShareModal.vue";
import PlaylistVideos from "./PlaylistVideos.vue";
import WatchOnButton from "./WatchOnButton.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import ToastComponent from "./ToastComponent.vue";
import PageNotFound from "./PageNotFound.vue";
import CollapsableText from "./CollapsableText.vue";
import { purifyHTML, rewriteDescription } from "@/utils/HtmlUtils";

// Import Jalali moment for date conversion
import moment from "jalali-moment";

export default {
    name: "App",
    components: {
        VideoPlayer,
        ContentItem,
        CommentItem,
        ChaptersBar,

        ShareModal,
        PlaylistVideos,
        WatchOnButton,
        LoadingIndicatorPage,
        ToastComponent,
        PageNotFound,
        CollapsableText,
    },
    data() {
        const smallViewQuery = window.matchMedia("(max-width: 640px)");
        return {
            video: null,
            playlistId: null,
            playlist: null,
            index: null,
            sponsors: null,
            selectedAutoLoop: false,
            selectedAutoPlay: null,
            showComments: true,
            showDesc: true, // Now always enabled since we use CollapsableText
            showRecs: true,
            showChapters: true,
            comments: null,
            subscribed: false,
            channelId: null,
            active: true,
            smallViewQuery: smallViewQuery,
            smallView: smallViewQuery.matches,

            showShareModal: false,
            isMobile: true,
            currentTime: 0,
            shouldShowToast: false,
            timeoutCounter: null,
            counter: 0,
            theaterMode: false,
            showAdditionalInfo: false,
        };
    },
    computed: {
        isListening(_this) {
            return _this.getPreferenceBoolean("listen", false);
        },
        commentsEnabled() {
            // Check if comments are disabled via environment variable
            return !import.meta.env.VITE_DISABLE_COMMENTS || import.meta.env.VITE_DISABLE_COMMENTS === "false";
        },
        isDownloadThumbnailDisabled() {
            // Check if download thumbnail button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_DOWNLOAD_THUMBNAIL === "true";
        },
        isRssFeedDisabled() {
            // Check if RSS feed button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RSS_FEED === "true";
        },
        isRecommendationsToggleDisabled() {
            // Check if recommendations toggle button is disabled via environment variable
            return import.meta.env.VITE_DISABLE_RECOMMENDATIONS_TOGGLE === "true";
        },
        chaptersDisabled() {
            // Check if chapters are disabled via environment variable
            return import.meta.env.VITE_DISABLE_CHAPTERS === "true";
        },
        likesDislikesEnabled() {
            // Check if likes/dislikes are disabled via environment variable
            return (
                !import.meta.env.VITE_DISABLE_LIKES_DISLIKES || import.meta.env.VITE_DISABLE_LIKES_DISLIKES === "false"
            );
        },
        isLicenseInfoDisabled() {
            // Check if license info is disabled via environment variable
            return import.meta.env.VITE_DISABLE_LICENSE_INFO === "true";
        },
        isSponsorBlockDisabled() {
            // Check if SponsorBlock is disabled via environment variable
            return import.meta.env.VITE_DISABLE_SPONSORBLOCK === "true";
        },
        isLikeDislikeDisabled() {
            // Check if like/dislike functionality is disabled via environment variable
            return import.meta.env.VITE_DISABLE_LIKE_DISLIKE === "true";
        },
        toggleListenUrl(_this) {
            const url = new URL(window.location.href);
            url.searchParams.set("listen", _this.isListening ? "0" : "1");
            url.searchParams.set("t", Math.floor(this.currentTime));
            return url.pathname + url.search;
        },
        isEmbed(_this) {
            return String(_this.$route.path).indexOf("/embed/") == 0;
        },
        uploadDate(_this) {
            if (!_this.video) return "";

            const date = new Date(_this.video.uploadDate);

            // Check if we should use Jalali calendar based on environment variable
            if (import.meta.env.VITE_CALENDAR_TYPE === "jalali") {
                // Convert Gregorian date to Jalali
                return moment(date).locale("fa").format("jYYYY/jMM/jDD");
            } else {
                // Use Gregorian calendar (default)
                return date.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            }
        },
        defaultCounter(_this) {
            return _this.getPreferenceNumber("autoPlayNextCountdown", 5);
        },
        purifiedDescription() {
            return purifyHTML(this.processedDescription);
        },
        extractedTags() {
            // Extract hashtags from description and return unique tags only
            if (!this.video?.description) return [];

            // Find hashtag text that appears after hashtag links have been converted to text content
            // This captures the hashtag text that remains after HTML processing (e.g., #hashtag_text)
            const hashtagRegex = /#([^\s\n\r\t.,;:!?()[\]{}'"!@#$%^&*+=|\\<>`~]+)/g;
            let match;
            const newTags = [];
            let description = this.video.description;

            while ((match = hashtagRegex.exec(description)) !== null) {
                let tag = match[1];
                // Decode URL-encoded tags if they appear in the text content (like %D9%88%D8%A7%D9%84%DA%A9%D8%B3 -> والکس)
                try {
                    tag = decodeURIComponent(tag);
                } catch (e) {
                    // If decoding fails, use the original tag
                    console.warn("Could not decode hashtag:", tag);
                }

                // Clean up tag to remove any potential encoded characters or HTML artifacts that might have been processed incorrectly
                tag = tag.replace(/<[^>]*>/g, "").trim(); // Remove any HTML tags that might have been included
                tag = tag
                    .replace(/&lt;br&gt;/gi, "")
                    .replace(/&lt;br\/&gt;/gi, "")
                    .replace(/&lt;.*?&gt;/g, "")
                    .trim(); // Remove HTML entities that might be in the tag

                if (!this.video.tags?.includes(tag) && !newTags.includes(tag)) {
                    newTags.push(tag);
                }
            }

            return [...new Set(newTags)];
        },
        allTags() {
            // Combine original tags and extracted tags, ensuring uniqueness
            const all = [...(this.video?.tags || []), ...this.extractedTags];
            return [...new Set(all)];
        },
        processedDescription() {
            if (!this.video?.description) return "";

            // Remove hashtag text from description (that was extracted by extractedTags)
            // This captures the hashtag text that remains after HTML processing (e.g., #hashtag_text)
            let processedDesc = this.video.description;

            // Remove hashtag text patterns like #hashtag_text from the description
            const hashtagTextRegex = /#[^\s\n\r\t.,;:!?()[\]{}'"!@#$%^&*+=|\\<>`~]+/g;
            processedDesc = processedDesc.replace(hashtagTextRegex, "");

            // Clean up excessive whitespace that may result from hashtag removal
            // Replace multiple consecutive whitespace characters with a single space or newline
            processedDesc = processedDesc.replace(/\s+/g, " ").trim();
            // Then normalize to proper newlines
            processedDesc = processedDesc.replace(/\n\s*\n/g, "\n").trim();

            return processedDesc;
        },
        hasDescription() {
            return this.processedDescription.trim().length > 0;
        },
        descriptionWithAdditionalInfo() {
            let fullDescription = this.processedDescription;

            // Add category, license, and visibility to the description
            if (this.video?.category) {
                fullDescription += `\n\n${this.$t("video.category")}: ${this.video.category}`;
            }
            if (!this.isLicenseInfoDisabled && this.video?.license) {
                fullDescription += `\n${this.$t("video.license")}: ${this.video.license}`;
            }
            if (!this.isLicenseInfoDisabled && this.video?.visibility) {
                fullDescription += `\n${this.$t("video.visibility")}: ${this.video.visibility}`;
            }

            // Add tags at the end
            if (this.allTags.length > 0) {
                const tagLinks = this.allTags
                    .map(
                        tag => `<a href="/results?search_query=${encodeURIComponent(tag)}" class="tag-link">${tag}</a>`,
                    )
                    .join(" ");
                fullDescription += `\n\n${tagLinks}`;
            }

            return fullDescription;
        },
        youtubeVideoHref() {
            let link = `https://youtu.be/${this.getVideoId()}?t=${Math.round(this.currentTime)}`;
            if (this.playlistId) link += `&list=${this.playlistId}`;
            return link;
        },
    },
    mounted() {
        // check screen size
        this.isMobile = window.innerWidth < 1024;
        // add an event listener to watch for screen size changes
        window.addEventListener("resize", () => {
            this.isMobile = window.innerWidth < 1024;
        });
        this.getVideoData().then(() => {
            // Check if the current video is disliked and show alert if user wants it
            const videoId = this.getVideoId();
            if (this.isVideoDisliked(videoId) && this.getPreferenceBoolean("showAlertOnDislikedVideos", true)) {
                // Show alert that this video is disliked
                const toast = document.createElement("div");
                toast.className = "toast toast-top toast-center";
                toast.innerHTML = `
                    <div class="alert alert-warning">
                        <span>${this.$t("info.this_video_is_disliked")}</span>
                    </div>
                `;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 5000); // Show for 5 seconds
            }
            
            (async () => {                
                const instance = this;
                if (window.db && this.getPreferenceBoolean("watchHistory", true) && !this.video.error) {
                    var tx = window.db.transaction("watch_history", "readwrite");
                    var store = tx.objectStore("watch_history");
                    var request = store.get(videoId);
                    request.onsuccess = function (event) {
                        var video = event.target.result;
                        if (video) {
                            video.watchedAt = Date.now();
                        } else {
                            video = {
                                videoId: videoId,
                                title: instance.video.title,
                                duration: instance.video.duration,
                                thumbnail: instance.video.thumbnailUrl,
                                uploaderUrl: instance.video.uploaderUrl,
                                uploaderName: instance.video.uploader,
                                watchedAt: Date.now(),
                            };
                        }
                        store.put(video);
                    };
                }
            })();
            if (this.active) this.$refs.videoPlayer.loadVideo();
        });
        this.playlistId = this.$route.query.list;
        this.index = Number(this.$route.query.index);
        this.getPlaylistData();
        this.getSponsors();
        if (!this.isEmbed && this.showComments && this.commentsEnabled) this.getComments();
        if (this.isEmbed) document.querySelector("html").style.overflow = "hidden";
        window.addEventListener("click", this.handleClick);
        window.addEventListener("resize", () => {
            this.smallView = this.smallViewQuery.matches;
        });
    },
    activated() {
        this.active = true;
        this.theaterMode = this.getPreferenceBoolean(
            "theaterMode",
            false // Default to false instead of based on screen size
        );
        this.selectedAutoPlay = this.getPreferenceNumber("autoplay", 1);
        this.showComments = !this.getPreferenceBoolean("minimizeComments", false);
        this.showRecs = this.isRecommendationsToggleDisabled
            ? true
            : !this.getPreferenceBoolean("minimizeRecommendations", false);
        this.showChapters = !this.chaptersDisabled && !this.getPreferenceBoolean("minimizeChapters", false);
        if (this.video?.duration) {
            document.title = this.video.title + " - " + this.getSiteName();
            this.$refs.videoPlayer.loadVideo();
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
        window.removeEventListener("click", this.handleClick);
        this.dismiss();
    },
    methods: {
        onDescriptionExpanded(isExpanded) {
            this.showAdditionalInfo = isExpanded;
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
                                const href = elem.getAttribute("href");
                                // Skip hashtag links to preserve their text content for extraction
                                if (href && href.includes("/hashtag/")) {
                                    // Keep hashtag links as-is so their text content remains available for extraction
                                    // Convert to text content without the link, preserving just the hashtag text
                                    elem.outerHTML = elem.innerText || "";
                                } else if (!elem.innerText.match(/(?:[\d]{1,2}:)?(?:[\d]{1,2}):(?:[\d]{1,2})/)) {
                                    // Convert other links to their href values (original behavior for non-hashtag links)
                                    elem.outerHTML = elem.getAttribute("href");
                                }
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
                            const href = elem.getAttribute("href");
                            // Skip hashtag links to preserve their text content for extraction
                            if (href && href.includes("/hashtag/")) {
                                // Keep hashtag links as-is so their text content remains available for extraction
                                // Convert to text content without the link, preserving just the hashtag text
                                elem.outerHTML = elem.innerText || "";
                            } else if (!elem.innerText.match(/(?:[\d]{1,2}:)?(?:[\d]{1,2}):(?:[\d]{1,2})/)) {
                                // Convert other links to their href values (original behavior for non-hashtag links)
                                elem.outerHTML = elem.getAttribute("href");
                            }
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
                    // Filter out duplicate items based on URL before adding them
                    const newItems = json.relatedStreams.filter(
                        newItem => !this.playlist.relatedStreams.some(existingItem => existingItem.url === newItem.url),
                    );

                    // Only add items if there are non-duplicate ones
                    if (newItems.length > 0) {
                        this.playlist.relatedStreams.push(...newItems);
                    }

                    this.playlist.nextpage = json.nextpage;
                    this.fetchDeArrowContent(json.relatedStreams);
                });
                await this.fetchPlaylistPages();
            }
        },
        async getSponsors() {
            if (!this.isSponsorBlockDisabled && this.getPreferenceBoolean("sponsorblock", true))
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
            // Pass channel data when subscribing so we can store full information
            const channelData = {
                id: this.channelId,
                name: this.video.uploader,
                avatar: this.video.uploaderAvatar,
                url: this.video.uploaderUrl
            };
            this.toggleSubscriptionState(this.channelId, this.subscribed, channelData).then(success => {
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
                const time = 0; // The parseTimeParam function was removed, so we'll just start at 0
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
        
        handleLike() {
            if (!this.video) return;
            
            // Create video object with necessary data
            const videoData = {
                videoId: this.video.id,
                title: this.video.title,
                uploaderName: this.video.uploader,
                thumbnail: this.video.thumbnailUrl,
                duration: this.video.duration
            };
            
            // Toggle like status and get result
            const result = this.toggleLike(videoData);
            
            if (result) {
                // Show success toast
                this.showToastMessage(this.$t("info.video_liked"));
            } else {
                // If video was unliked, show different message
                if (this.isVideoLiked(this.video.id)) {
                    this.showToastMessage(this.$t("info.video_liked"));
                } else {
                    this.showToastMessage(this.$t("info.video_removed_from_likes"));
                }
            }
        },
        
        handleDislike() {
            if (!this.video) return;
            
            // Create video object with necessary data
            const videoData = {
                videoId: this.video.id,
                title: this.video.title,
                uploaderName: this.video.uploader,
                thumbnail: this.video.thumbnailUrl,
                duration: this.video.duration
            };
            
            // Toggle dislike status and get result
            const result = this.toggleDislike(videoData);
            
            if (result) {
                // Show success toast
                this.showToastMessage(this.$t("info.video_disliked"));
            } else {
                // If video was un-disliked, show different message
                if (this.isVideoDisliked(this.video.id)) {
                    this.showToastMessage(this.$t("info.video_disliked"));
                } else {
                    this.showToastMessage(this.$t("info.video_removed_from_dislikes"));
                }
            }
        },
        
        showToastMessage(message) {
            // Create and show toast notification
            const toast = document.createElement("div");
            toast.className = "toast toast-top toast-center";
            toast.innerHTML = `
                <div class="alert alert-success">
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
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

.description-box {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 16px;
}

.description-box a {
    text-decoration: none;
    color: #039be5;
}

.description-box a:hover {
    text-decoration: underline;
}

.tag-link {
    display: inline-block;
    background-color: #e0e0e0;
    border-radius: 12px;
    padding: 4px 12px;
    margin: 2px;
    text-decoration: none;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.btn-icon {
    width: 2.5rem !important; /* 40px */
    height: 2.5rem !important; /* 40px */
    min-height: 2.5rem !important; /* Fixed height */
    border-radius: 50% !important; /* Circular shape */
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important; /* Smooth transitions for hover/click */
    transform: scale(1) !important; /* Initial scale */
}

.btn-icon:hover {
    transform: scale(1.05) !important; /* Slight scale on hover */
}

.btn-icon:active {
    transform: scale(0.95) !important; /* Scale down on click for press effect */
    transition: all 0.1s ease !important; /* Quick transition for click */
}

/* Active state colors for various button types */
.btn-icon.btn-success {
    background-color: #28a745 !important; /* Green for like when active */
    color: white !important;
}

.btn-icon.btn-error {
    background-color: #dc3545 !important; /* Red for dislike when active */
    color: white !important;
}

.btn-icon.btn-danger {
    background-color: #ff0000 !important; /* Red for subscribe */
    color: white !important;
}

.btn-icon.btn-secondary {
    background-color: #6c757d !important; /* Gray for general buttons */
    color: white !important;
}

.btn-icon.btn-unsubscribe {
    background-color: #6c757d !important; /* Gray for unsubscribe */
    color: white !important;
}

/* Inactive/normal state colors */
.btn-icon.btn-secondary:not(.btn-success):not(.btn-error):not(.btn-danger):not(.btn-unsubscribe) {
    background-color: rgba(108, 117, 125, 0.5) !important; /* Semi-transparent gray */
    color: white !important;
}

.btn-icon.btn-success:not(.active) {
    background-color: rgba(40, 167, 69, 0.3) !important; /* Semi-transparent green */
    color: white !important;
}

.btn-icon.btn-error:not(.active) {
    background-color: rgba(220, 53, 69, 0.3) !important; /* Semi-transparent red */
    color: white !important;
}

.btn-icon.btn-danger:not(.subscribed) {
    background-color: rgba(255, 0, 0, 0.3) !important; /* Semi-transparent red */
    color: white !important;
}
</style>

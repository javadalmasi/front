<template>
    <div class="flex">
        <button @click="$router.go(-1) || $router.push('/')">
            <i class="i-fa6-solid:chevron-left" /><span v-t="'actions.back'" class="mr-1.5" />
        </button>
    </div>
    <h1 v-t="'titles.preferences'" class="text-center font-bold" />
    <hr />
    <label v-if="!isThemeSelectorDisabled" for="ddlTheme" class="pref">
        <strong v-t="'actions.theme'" class="tooltip-hover" :title="$t('tooltips.theme')" />
        <select id="ddlTheme" v-model="selectedTheme" class="select w-auto" @change="onChange($event)">
            <option v-t="'actions.auto'" value="auto" />
            <option v-t="'actions.dark'" value="dark" />
            <option v-t="'actions.light'" value="light" />
        </select>
    </label>
    <h2 v-t="'titles.player'" class="text-center" />
    <label class="pref" for="chkAutoPlayVideo">
        <strong v-t="'actions.autoplay_video'" class="tooltip-hover" :title="$t('tooltips.autoplay_video')" />
        <input
            id="chkAutoPlayVideo"
            v-model="autoPlayVideo"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAutoDisplayCaptions">
        <strong
            v-t="'actions.auto_display_captions'"
            class="tooltip-hover"
            :title="$t('tooltips.auto_display_captions')"
        />
        <input
            id="chkAutoDisplayCaptions"
            v-model="autoDisplayCaptions"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAutoPlayNextCountdown">
        <strong
            v-t="'actions.autoplay_next_countdown'"
            class="tooltip-hover"
            :title="$t('tooltips.autoplay_next_countdown')"
        />
        <input
            id="chkAutoPlayNextCountdown"
            v-model="autoPlayNextCountdown"
            class="input w-24"
            type="number"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAudioOnly">
        <strong v-t="'actions.audio_only'" class="tooltip-hover" :title="$t('tooltips.audio_only')" />
        <input id="chkAudioOnly" v-model="listen" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="chkPreferHls">
        <strong v-t="'actions.prefer_hls'" class="tooltip-hover" :title="$t('tooltips.prefer_hls')" />
        <input id="chkPreferHls" v-model="preferHls" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="ddlDefaultQuality">
        <strong v-t="'actions.default_quality'" class="tooltip-hover" :title="$t('tooltips.default_quality')" />
        <select id="ddlDefaultQuality" v-model="defaultQuality" class="select w-auto" @change="onChange($event)">
            <option v-t="'actions.auto'" value="0" />
            <option v-for="resolution in resolutions" :key="resolution" :value="resolution" v-text="`${resolution}p`" />
        </select>
    </label>
    <label class="pref" for="txtBufferingGoal">
        <strong v-t="'actions.buffering_goal'" class="tooltip-hover" :title="$t('tooltips.buffering_goal')" />
        <input
            id="txtBufferingGoal"
            v-model="bufferingGoal"
            class="input w-24"
            type="text"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeComments">
        <strong
            v-t="'actions.minimize_comments_default'"
            class="tooltip-hover"
            :title="$t('tooltips.minimize_comments_default')"
        />
        <input
            id="chkMinimizeComments"
            v-model="minimizeComments"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeDescription">
        <strong
            v-t="'actions.minimize_description_default'"
            class="tooltip-hover"
            :title="$t('tooltips.minimize_description_default')"
        />
        <input
            id="chkMinimizeDescription"
            v-model="minimizeDescription"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeRecommendations">
        <strong
            v-t="'actions.minimize_recommendations_default'"
            class="tooltip-hover"
            :title="$t('tooltips.minimize_recommendations_default')"
        />
        <input
            id="chkMinimizeRecommendations"
            v-model="minimizeRecommendations"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeChapters">
        <strong
            v-t="'actions.minimize_chapters_default'"
            class="tooltip-hover"
            :title="$t('tooltips.minimize_chapters_default')"
        />
        <input
            id="chkMinimizeChapters"
            v-model="minimizeChapters"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <!-- chapters layout on mobile -->
    <label class="pref lg:invisible" for="chkMinimizeChapters">
        <strong
            v-t="'actions.chapters_layout_mobile'"
            class="tooltip-hover"
            :title="$t('tooltips.chapters_layout_mobile')"
        />

        <select id="ddlDefaultHomepage" v-model="mobileChapterLayout" class="select w-auto" @change="onChange($event)">
            <option v-t="'video.chapters_horizontal'" value="Horizontal" />
            <option v-t="'video.chapters_vertical'" value="Vertical" />
        </select>
    </label>
    <label v-if="!isWatchOnYouTubeDisabled" class="pref" for="chkShowWatchOnYouTube">
        <strong
            v-t="'actions.show_watch_on_youtube'"
            class="tooltip-hover"
            :title="$t('tooltips.show_watch_on_youtube')"
        />
        <input
            id="chkShowWatchOnYouTube"
            v-model="showWatchOnYouTube"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="!isSearchSuggestionsDisabled" class="pref" for="chkShowSearchSuggestions">
        <strong
            v-t="'actions.show_search_suggestions'"
            class="tooltip-hover"
            :title="$t('tooltips.show_search_suggestions')"
        />
        <input
            id="chkShowSearchSuggestions"
            v-model="searchSuggestions"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="!isSearchHistoryStorageDisabled" class="pref" for="chkStoreSearchHistory">
        <strong
            v-t="'actions.store_search_history'"
            class="tooltip-hover"
            :title="$t('tooltips.store_search_history')"
        />
        <input
            id="chkStoreSearchHistory"
            v-model="searchHistory"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="!isWatchHistoryStorageDisabled" class="pref" for="chkStoreWatchHistory">
        <strong v-t="'actions.store_watch_history'" class="tooltip-hover" :title="$t('tooltips.store_watch_history')" />
        <input
            id="chkStoreWatchHistory"
            v-model="watchHistory"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="watchHistory" class="pref" for="chkHideWatched">
        <strong v-t="'actions.hide_watched'" class="tooltip-hover" :title="$t('tooltips.hide_watched')" />
        <input id="chkHideWatched" v-model="hideWatched" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="ddlEnabledCodecs">
        <strong v-t="'actions.enabled_codecs'" class="tooltip-hover" :title="$t('tooltips.enabled_codecs')" />
        <select
            id="ddlEnabledCodecs"
            v-model="enabledCodecs"
            class="select h-auto w-auto"
            multiple
            @change="onChange($event)"
        >
            <option value="av1">AV1</option>
            <option value="vp9">VP9</option>
            <option value="avc">AVC (h.264)</option>
        </select>
    </label>
    <label v-if="!isLBRYIntegrationDisabled" class="pref" for="chkDisableLBRY">
        <strong v-t="'actions.disable_lbry'" class="tooltip-hover" :title="$t('tooltips.disable_lbry')" />
        <input id="chkDisableLBRY" v-model="disableLBRY" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label v-if="!isLBRYProxyDisabled" class="pref" for="chkEnableLBRYProxy">
        <strong v-t="'actions.enable_lbry_proxy'" class="tooltip-hover" :title="$t('tooltips.enable_lbry_proxy')" />
        <input
            id="chkEnableLBRYProxy"
            v-model="proxyLBRY"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="!isPrefetchLimitDisabled" class="pref" for="txtPrefetchLimit">
        <strong
            v-t="'actions.concurrent_prefetch_limit'"
            class="tooltip-hover"
            :title="$t('tooltips.concurrent_prefetch_limit')"
        />
        <input
            id="txtPrefetchLimit"
            v-model="prefetchLimit"
            class="input w-24"
            type="text"
            @change="onChange($event)"
        />
    </label>

    <h2 class="text-center">SponsorBlock</h2>
    <p class="text-center">
        <span v-t="'actions.uses_api_from'" /><a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
    </p>
    <label class="pref" for="chkEnableSponsorblock">
        <strong v-t="'actions.enable_sponsorblock'" class="tooltip-hover" :title="$t('tooltips.enable_sponsorblock')" />
        <input
            id="chkEnableSponsorblock"
            v-model="sponsorBlock"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <div v-if="sponsorBlock">
        <label v-for="[name, item] in skipOptions" :key="name" class="pref" :for="'ddlSkip_' + name">
            <strong v-t="item.label" class="tooltip-hover" :title="getTooltipByActionLabel(item.label)" />
            <select :id="'ddlSkip_' + name" v-model="item.value" class="select w-auto" @change="onChange($event)">
                <option v-t="'actions.no'" value="no" />
                <option v-t="'actions.skip_button_only'" value="button" />
                <option v-t="'actions.skip_automatically'" value="auto" />
            </select>
        </label>
        <label class="pref" for="chkShowMarkers">
            <strong v-t="'actions.show_markers'" class="tooltip-hover" :title="$t('tooltips.show_markers')" />
            <input
                id="chkShowMarkers"
                v-model="showMarkers"
                class="checkbox"
                type="checkbox"
                @change="onChange($event)"
            />
        </label>
        <label class="pref" for="txtMinSegmentLength">
            <strong
                v-t="'actions.min_segment_length'"
                class="tooltip-hover"
                :title="$t('tooltips.min_segment_length')"
            />
            <input
                id="txtMinSegmentLength"
                v-model="minSegmentLength"
                class="input w-24"
                type="text"
                @change="onChange($event)"
            />
        </label>
    </div>

    <h2 v-if="!isDeArrowIntegrationDisabled" v-t="'titles.dearrow'" class="text-center" />
    <p v-if="!isDeArrowIntegrationDisabled" class="text-center">
        <span v-t="'actions.uses_api_from'" /><a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
    </p>
    <label v-if="!isDeArrowIntegrationDisabled" class="pref" for="chkDeArrow">
        <strong v-t="'actions.enable_dearrow'" class="tooltip-hover" :title="$t('tooltips.enable_dearrow')" />
        <input id="chkDeArrow" v-model="dearrow" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>

    <!-- options that are visible only when logged in -->
    <div v-if="authenticated">
        <h2 v-t="'titles.account'" class="text-center"></h2>
        <label class="pref" for="txtDeleteAccountPassword">
            <strong v-t="'actions.delete_account'" class="tooltip-hover" :title="$t('tooltips.delete_account')" />
            <div class="flex items-center">
                <input
                    id="txtDeleteAccountPassword"
                    ref="txtDeleteAccountPassword"
                    v-model="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    class="input mr-2 w-auto"
                    type="password"
                    @keyup.enter="deleteAccount"
                />
                <a v-t="'actions.delete_account'" class="btn btn-danger" @click="deleteAccount" />
            </div>
        </label>
        <div class="pref">
            <a v-t="'actions.logout'" class="btn btn-secondary" @click="logout" />
            <a
                v-t="'actions.invalidate_session'"
                class="btn btn-warning"
                style="margin-left: 0.5em"
                @click="invalidateSession"
            />
        </div>
        <br />
    </div>
    <br />
    <p v-t="'info.preferences_note'" />
    <br />
    <button v-t="'actions.reset_preferences'" class="btn btn-warning" @click="showConfirmResetPrefsDialog = true" />
    <button v-t="'actions.backup_preferences'" class="btn btn-secondary mx-4" @click="backupPreferences()" />
    <label
        v-t="'actions.restore_preferences'"
        for="fileSelector"
        class="btn btn-secondary"
        @click="restorePreferences()"
    />
    <input id="fileSelector" ref="fileSelector" class="hidden" type="file" @change="restorePreferences()" />
    <ConfirmModal
        v-if="showConfirmResetPrefsDialog"
        :message="$t('actions.confirm_reset_preferences')"
        @close="showConfirmResetPrefsDialog = false"
        @confirm="resetPreferences()"
    />
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
export default {
    components: {
        ConfirmModal,
    },
    data() {
        return {
            mobileChapterLayout: "Vertical",
            sponsorBlock: true,
            skipOptions: new Map([
                ["sponsor", { value: "auto", label: "actions.skip_sponsors" }],
                ["intro", { value: "no", label: "actions.skip_intro" }],
                ["outro", { value: "no", label: "actions.skip_outro" }],
                ["preview", { value: "no", label: "actions.skip_preview" }],
                ["interaction", { value: "auto", label: "actions.skip_interaction" }],
                ["selfpromo", { value: "auto", label: "actions.skip_self_promo" }],
                ["music_offtopic", { value: "auto", label: "actions.skip_non_music" }],
                ["poi_highlight", { value: "no", label: "actions.skip_highlight" }],
                ["filler", { value: "no", label: "actions.skip_filler_tangent" }],
            ]),
            showMarkers: true,
            minSegmentLength: 0,
            dearrow: false,
            selectedTheme: "dark",
            autoPlayVideo: true,
            autoDisplayCaptions: false,
            autoPlayNextCountdown: 5,
            listen: false,
            resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
            preferHls: false,
            defaultQuality: 0,
            bufferingGoal: import.meta.env.VITE_BUFFERING_GOAL || 10,
            minimizeComments: false,
            minimizeDescription: true,
            minimizeRecommendations: false,
            minimizeChapters: false,
            showWatchOnYouTube: false,
            searchSuggestions: true,
            watchHistory: false,
            searchHistory: false,
            hideWatched: false,
            enabledCodecs: ["vp9", "avc"],
            disableLBRY: false,
            proxyLBRY: false,
            prefetchLimit: 2,
            password: null,
            showConfirmResetPrefsDialog: false,
        };
    },
    computed: {
        // instances are removed as we're using a fixed custom instance
        isThemeSelectorDisabled() {
            return import.meta.env.VITE_DISABLE_THEME_SELECTOR === "true";
        },
        isWatchOnYouTubeDisabled() {
            return import.meta.env.VITE_DISABLE_WATCH_ON_YOUTUBE === "true";
        },
        isWatchHistoryStorageDisabled() {
            return import.meta.env.VITE_DISABLE_WATCH_HISTORY_STORAGE === "true";
        },
        isSearchHistoryStorageDisabled() {
            return import.meta.env.VITE_DISABLE_SEARCH_HISTORY_STORAGE === "true";
        },
        isSearchSuggestionsDisabled() {
            return import.meta.env.VITE_DISABLE_SEARCH_SUGGESTIONS === "true";
        },
        isLBRYIntegrationDisabled() {
            return import.meta.env.VITE_DISABLE_LBRY_INTEGRATION === "true";
        },
        isLBRYProxyDisabled() {
            return import.meta.env.VITE_DISABLE_LBRY_PROXY === "true";
        },
        isPrefetchLimitDisabled() {
            return import.meta.env.VITE_DISABLE_PREFETCH_LIMIT === "true";
        },
        isDeArrowIntegrationDisabled() {
            return import.meta.env.VITE_DISABLE_DEARROW_INTEGRATION === "true";
        },
    },
    activated() {
        document.title = this.$t("titles.preferences") + " - " + this.getSiteName();
    },
    async mounted() {
        if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

        if (this.testLocalStorage) {
            this.sponsorBlock = this.getPreferenceBoolean("sponsorblock", true);
            var skipOptions, skipList;
            if ((skipOptions = this.getPreferenceJSON("skipOptions")) !== undefined) {
                Object.entries(skipOptions).forEach(([key, value]) => {
                    var opt = this.skipOptions.get(key);
                    if (opt !== undefined) opt.value = value;
                    else console.log("Unknown sponsor type: " + key);
                });
            } else if ((skipList = this.getPreferenceString("selectedSkip")) !== undefined) {
                skipList = skipList.split(",");
                this.skipOptions.forEach(opt => (opt.value = "no"));
                skipList.forEach(skip => {
                    var opt = this.skipOptions.get(skip);
                    if (opt !== undefined) opt.value = "auto";
                    else console.log("Unknown sponsor type: " + skip);
                });
            }

            this.showMarkers = this.getPreferenceBoolean("showMarkers", true);
            this.minSegmentLength = Math.max(this.getPreferenceNumber("minSegmentLength", 0), 0);
            this.dearrow = this.getPreferenceBoolean("dearrow", false);
            this.selectedTheme = this.getPreferenceString("theme", "dark");
            this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
            this.autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
            this.autoPlayNextCountdown = this.getPreferenceNumber("autoPlayNextCountdown", 5);
            this.listen = this.getPreferenceBoolean("listen", false);
            this.defaultQuality = Number(localStorage.getItem("quality"));
            this.bufferingGoal = Math.max(
                Number(localStorage.getItem("bufferGoal")),
                import.meta.env.VITE_BUFFERING_GOAL || 10,
            );
            this.minimizeComments = this.getPreferenceBoolean("minimizeComments", false);
            this.minimizeDescription = this.getPreferenceBoolean("minimizeDescription", true);
            this.minimizeRecommendations = this.getPreferenceBoolean("minimizeRecommendations", false);
            this.minimizeChapters = this.getPreferenceBoolean("minimizeChapters", false);
            this.showWatchOnYouTube = this.getPreferenceBoolean("showWatchOnYouTube", false);
            this.searchSuggestions = this.getPreferenceBoolean("searchSuggestions", true);
            this.watchHistory = this.getPreferenceBoolean("watchHistory", false);
            this.searchHistory = this.getPreferenceBoolean("searchHistory", false);
            // Persian (fa) is the default language, no need to save in local storage
            this.enabledCodecs = this.getPreferenceString("enabledCodecs", "vp9,avc").split(",");
            this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
            this.proxyLBRY = this.getPreferenceBoolean("proxyLBRY", false);
            this.prefetchLimit = this.getPreferenceNumber("prefetchLimit", 2);
            this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
            this.mobileChapterLayout = this.getPreferenceString("mobileChapterLayout", "Vertical");
            // Load Persian country map
            try {
                this.CountryMap = await import(`../utils/CountryMaps/fa.json`).then(val => val.default);
            } catch (e) {
                console.error("Countries not translated into fa");
            }
        }
    },
    methods: {
        async onChange() {
            if (this.testLocalStorage) {
                var shouldReload = false;

                if (
                    this.getPreferenceString("theme", "dark") !== this.selectedTheme ||
                    this.getPreferenceBoolean("watchHistory", false) != this.watchHistory ||
                    this.getPreferenceString("enabledCodecs", "vp9,avc") !== this.enabledCodecs.join(",")
                )
                    shouldReload = true;

                localStorage.setItem("sponsorblock", this.sponsorBlock);

                var skipOptions = {};
                this.skipOptions.forEach((v, k) => (skipOptions[k] = v.value));
                localStorage.setItem("skipOptions", JSON.stringify(skipOptions));

                localStorage.setItem("showMarkers", this.showMarkers);
                localStorage.setItem("minSegmentLength", this.minSegmentLength);

                localStorage.setItem("dearrow", this.dearrow);

                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
                localStorage.setItem("autoDisplayCaptions", this.autoDisplayCaptions);
                localStorage.setItem("autoPlayNextCountdown", this.autoPlayNextCountdown);
                localStorage.setItem("listen", this.listen);
                localStorage.setItem("preferHls", this.preferHls);
                localStorage.setItem("quality", this.defaultQuality);
                localStorage.setItem("bufferGoal", this.bufferingGoal);
                localStorage.setItem("minimizeComments", this.minimizeComments);
                localStorage.setItem("minimizeDescription", this.minimizeDescription);
                localStorage.setItem("minimizeRecommendations", this.minimizeRecommendations);
                localStorage.setItem("minimizeChapters", this.minimizeChapters);
                localStorage.setItem("showWatchOnYouTube", this.showWatchOnYouTube);
                localStorage.setItem("searchSuggestions", this.searchSuggestions);
                localStorage.setItem("watchHistory", this.watchHistory);
                localStorage.setItem("searchHistory", this.searchHistory);
                if (!this.searchHistory) localStorage.removeItem("search_history");
                localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
                localStorage.setItem("disableLBRY", this.disableLBRY);
                localStorage.setItem("proxyLBRY", this.proxyLBRY);
                localStorage.setItem("prefetchLimit", this.prefetchLimit);
                localStorage.setItem("hideWatched", this.hideWatched);
                localStorage.setItem("mobileChapterLayout", this.mobileChapterLayout);

                if (shouldReload) window.location.reload();
            }
        },
        logout() {
            // reset the auth token
            localStorage.removeItem("authToken" + this.hashCode(this.authApiUrl()));
            // redirect to trending page
            window.location = import.meta.env.BASE_URL;
        },
        resetPreferences() {
            this.showConfirmResetPrefsDialog = false;
            // clear the local storage
            localStorage.clear();
            // redirect to the home page
            window.location = import.meta.env.BASE_URL;
        },
        async invalidateSession() {
            this.fetchJson(this.authApiUrl() + "/logout", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(resp => {
                if (!resp.error) {
                    this.logout();
                } else alert(resp.error);
            });
        },
        backupPreferences() {
            const data = JSON.stringify(localStorage);
            this.download(data, "preferences.json", "application/json");
        },
        restorePreferences() {
            var file = this.$refs.fileSelector.files[0];
            file.text().then(text => {
                const data = JSON.parse(text);
                Object.keys(data).forEach(function (key) {
                    localStorage.setItem(key, data[key]);
                });
                window.location.reload();
            });
        },
        getTooltipByActionLabel(label) {
            // Extract the action key from the label (removing 'actions.' prefix)
            const actionKey = label.replace("actions.", "");
            // Try to get the specific tooltip for the action
            const specificTooltip = this.$t("tooltips." + actionKey);
            // If the specific tooltip exists and is different from the key, return it
            if (specificTooltip && specificTooltip !== actionKey) {
                return specificTooltip;
            }
            // Fallback to the action label itself if no specific tooltip exists
            return this.$t(label);
        },
    },
};
</script>

<style>
.pref {
    @apply flex justify-between items-center my-2 mx-[15vw] lt-md:mx-2;
}
.pref:nth-child(odd) {
    @apply bg-gray-200;
}
.dark .pref:nth-child(odd) {
    @apply bg-dark-800;
}

.tooltip-hover {
    @apply relative inline-block border-b border-dotted border-current cursor-help align-middle;
}

.tooltip-hover:hover::after {
    @apply absolute bottom-full left-1/2 z-50 px-4 py-1.5 text-sm leading-[1.65] font-normal text-white bg-[#333] rounded shadow-lg -translate-x-1/2 mb-2 min-w-[200px] max-w-[350px] text-center break-words border border-gray-500;
    content: attr(title);
    word-wrap: break-word;
    hyphens: auto;
}

/* Tooltip indicator */
.tooltip-hover:hover::before {
    @apply absolute bottom-full left-1/2 z-50 w-0 h-0 border-4 border-transparent -translate-x-1/2 border-t-[#333] mb-1;
    content: "";
}
</style>

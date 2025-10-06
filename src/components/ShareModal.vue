<template>
    <ModalComponent>
        <div v-t="'actions.share'" class="mb-5 text-2xl font-bold" />

        <!-- Timecode and playlist options -->
        <div class="flex justify-between">
            <label v-t="'actions.with_timecode'" for="withTimeCode" />
            <input id="withTimeCode" v-model="withTimeCode" type="checkbox" @change="onChange" />
        </div>
        <div v-if="hasPlaylist" class="mt-2 flex justify-between">
            <label v-t="'actions.with_playlist'" />
            <input v-model="withPlaylist" type="checkbox" @change="onChange" />
        </div>
        <div v-if="withTimeCode" class="mt-2 flex items-center justify-between">
            <label v-t="'actions.time_code'" />
            <input v-model="timeStamp" class="input w-12" type="text" @change="onChange" />
        </div>
        <hr class="my-3" />

        <!-- Share options -->
        <div class="mb-3 flex justify-between">
            <label v-t="'actions.piped_link'" class="font-bold" />
        </div>

        <!-- Generated share link -->
        <div class="mb-3 overflow-x-auto rounded bg-gray-100 p-2 dark:bg-dark-700">
            <a :href="generatedLink" target="_blank" class="break-all text-blue-500 hover:underline">
                <div class="text-sm font-bold" v-text="generatedLink" />
            </a>
        </div>

        <!-- Social sharing buttons -->
        <div class="grid grid-cols-2 mb-3 gap-3">
            <a
                :href="`https://wa.me/?text=${encodeURIComponent(generatedLink)}`"
                target="_blank"
                class="btn-success btn flex items-center justify-center"
            >
                <i class="i-fa6-brands:whatsapp mr-2" />
                <span v-t="'actions.share_on_whatsapp'" />
            </a>
            <a
                :href="`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}`"
                target="_blank"
                class="btn flex items-center justify-center btn-primary"
            >
                <i class="i-fa6-brands:telegram mr-2" />
                <span v-t="'actions.share_on_telegram'" />
            </a>
        </div>

        <!-- Copy link button -->
        <button
            v-t="'actions.copy_link'"
            class="mb-3 w-full btn flex items-center justify-center btn-primary"
            @click="copyLink()"
        >
            <i class="i-fa6-solid:link mr-2" />
        </button>

        <!-- Embed code section (only on desktop) -->
        <div v-if="!isMobile" class="border-t border-gray-200 pt-3 dark:border-gray-700">
            <div v-t="'actions.embed_video'" class="mb-2 text-lg font-bold" />
            <div class="mb-2 overflow-x-auto rounded bg-gray-100 p-2 dark:bg-dark-700">
                <code class="break-all text-xs">{{ generatedEmbedCode }}</code>
            </div>
            <button
                v-t="'actions.copy_embed' + ''"
                class="w-full btn flex items-center justify-center btn-secondary"
                @click="copyEmbedCode()"
            >
                <i class="i-fa6-solid:code mr-2" />
            </button>
        </div>
    </ModalComponent>
</template>

<script setup>
// No need for QrCode import anymore
</script>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    props: {
        videoId: {
            type: String,
            required: true,
        },
        currentTime: {
            type: Number,
            required: true,
        },
        playlistId: {
            type: String,
            default: undefined,
        },
        playlistIndex: {
            type: Number,
            default: undefined,
        },
    },
    data() {
        return {
            withTimeCode: true,
            withPlaylist: true,
            timeStamp: null,
            hasPlaylist: false,
            durations: [1, 60, 60 * 60, 60 * 60 * 24],
            isMobile: false,
        };
    },
    computed: {
        generatedLink() {
            const baseUrl = window.location.origin + "/watch?v=" + this.videoId;
            const url = new URL(baseUrl);

            if (this.withTimeCode && this.timeStamp)
                url.searchParams.append("t", this.parseTimeStampToSeconds(this.timeStamp));

            if (this.hasPlaylist && this.withPlaylist) {
                url.searchParams.append("list", this.playlistId);
                url.searchParams.append("index", this.playlistIndex);
            }

            return url.href;
        },
        generatedEmbedCode() {
            const width = 560;
            const height = 315;
            const embedUrl = window.location.origin + `/embed/${this.videoId}`;
            return `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
        },
    },
    mounted() {
        this.timeStamp = this.parseSecondsToTimeStamp(this.currentTime ?? 0);
        this.withTimeCode = this.getPreferenceBoolean("shareWithTimeCode", true);
        this.withPlaylist = this.getPreferenceBoolean("shareWithPlaylist", true);
        this.hasPlaylist = this.playlistId != undefined && !isNaN(this.playlistIndex);

        // Check if user is on mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    methods: {
        async copyLink() {
            await this.copyURL(this.generatedLink);
        },
        async copyEmbedCode() {
            await this.copyURL(this.generatedEmbedCode);
        },
        async copyURL(mytext) {
            try {
                await navigator.clipboard.writeText(mytext);
                alert(this.$t("info.copied"));
            } catch ($e) {
                alert(this.$t("info.cannot_copy"));
            }
        },
        parseTimeStampToSeconds(timestamp) {
            const timeArray = timestamp.split(":").reverse();
            let seconds = 0;
            for (let i = 0; i < timeArray.length; i++) {
                seconds += timeArray[i] * this.durations[i];
            }
            return seconds;
        },
        parseSecondsToTimeStamp(seconds) {
            const timeArray = [];
            const durationsReversed = this.durations.toReversed();
            for (let i in durationsReversed) {
                const currentValue = Math.floor(seconds / durationsReversed[i]);
                if (currentValue > 0) {
                    timeArray.push(currentValue.toString().padStart(2, "0"));
                    seconds -= currentValue * durationsReversed[i];
                }
            }
            return timeArray.join(":");
        },
        onChange() {
            this.setPreference("shareWithTimeCode", this.withTimeCode, true);
            this.setPreference("shareWithPlaylist", this.withPlaylist, true);
        },
    },
};
</script>

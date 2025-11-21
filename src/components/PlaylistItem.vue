<template>
    <div class="h-full flex flex-col flex-justify-between">
        <router-link
            class="link inline-block w-full"
            :to="item.url"
        >
            <div class="relative">
                <img
                    :src="getOptimalThumbnailUrl(item.thumbnail, { width: '302', height: '169', quality: 85 })"
                    :alt="title"
                    class="h-full w-full object-contain"
                    width="302"
                    height="169"
                />
                <div
                    v-if="item.videos >= 0"
                    class="absolute bottom-1 end-1 rounded-md bg-black/80 px-1 text-[11px] font-bold text-white"
                    v-text="`${item.videos}`"
                />
            </div>

            <div>
                <p
                    :style="lineClampStyle"
                    class="link flex overflow-hidden pt-2 font-bold"
                    :title="title"
                    v-text="title"
                />
            </div>
        </router-link>

        <div class="flex items-center">
            <router-link :to="item.uploaderUrl" class="mr-0.5 mt-0.5 flex-shrink-0">
                <div class="relative inline-block">
                    <img
                        v-if="item.uploaderAvatar"
                        loading="lazy"
                        :src="getOptimalThumbnailUrl(item.uploaderAvatar, { width: '68', height: '68', quality: 85 })"
                        :class="{ 'border-2 border-blue-700': item.uploaderVerified, 'rounded-full': true }"
                        class="h-32px w-32px"
                        width="68"
                        height="68"
                    />
                    <div
                        v-if="item.uploaderVerified && item.uploaderAvatar"
                        class="absolute end-0 bottom-0 h-4 w-4 flex items-center justify-center rounded-full bg-blue-700"
                    >
                        <i class="i-fa6-solid:check text-[8px] text-white" />
                    </div>
                </div>
            </router-link>

            <div class="min-w-0 flex-1 px-2">
                <!-- Added min-w-0 to prevent flex item from overflowing -->
                <router-link
                    v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
                    class="link-secondary overflow-hidden text-sm leading-[1.65] no-underline hover:underline-dashed"
                    :to="item.uploaderUrl"
                    :title="item.uploaderName"
                >
                    <span v-text="item.uploaderName" />
                </router-link>

                <div v-if="item.videos >= 0" class="video-info">
                    <span class="pr-1" v-text="`${numberFormat(item.videos)} videos`" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {
    props: {
        item: {
            type: Object,
            default: () => {
                return {};
            },
        },
        height: { type: String, default: "118" },
        width: { type: String, default: "210" },
        hideChannel: { type: Boolean, default: false },
        clampTitleLines: { type: Boolean, default: true },
    },
    computed: {
        title() {
            return this.item.title;
        },
        lineClampStyle() {
            // Apply line clamping only if the prop is true
            if (this.clampTitleLines) {
                return {
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                };
            }
            // Return an empty style object when not clamping
            return {};
        },
    },
};
</script>

<style>
.video-info {
    @apply mt-1 text-xs leading-[1.6] text-gray-600 font-normal;
}

.dark .video-info {
    @apply text-gray-400;
}
</style>
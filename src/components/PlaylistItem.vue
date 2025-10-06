<template>
    <router-link
        :to="item.url"
        class="h-full flex flex-col overflow-hidden card transition-all duration-200 hover:shadow-lg"
    >
        <!-- Playlist Thumbnail with Video Count Overlay -->
        <div class="relative">
            <img
                loading="lazy"
                :src="item.thumbnail"
                class="aspect-video h-auto w-full bg-surface object-cover"
                alt=""
            />
            <div
                v-if="item.videos > 0"
                class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black bg-opacity-70 py-1.5 text-sm text-white font-semibold"
            >
                <i class="i-fa6-solid:layer-group" />
                <span>{{ `${item.videos} ${$t("video.videos", item.videos)}` }}</span>
            </div>
        </div>

        <!-- Playlist Details -->
        <div class="flex flex-1 flex-col p-3">
            <h3
                class="overflow-hidden text-main font-semibold"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                :title="item.name"
            >
                {{ item.name }}
            </h3>
            <p v-if="item.uploaderName" class="mt-1 truncate text-sm text-soft">
                {{ item.uploaderName }}
            </p>
        </div>
    </router-link>
</template>

<script setup>
defineProps({
    item: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <router-link :to="item.url" class="card h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
        <!-- Playlist Thumbnail with Video Count Overlay -->
        <div class="relative">
            <img
                loading="lazy"
                :src="item.thumbnail"
                class="w-full h-auto aspect-video object-cover bg-surface"
                alt=""
            />
            <div
                v-if="item.videos > 0"
                class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black bg-opacity-70 py-1.5 text-sm font-semibold text-white"
            >
                <i class="i-fa6-solid:layer-group" />
                <span>{{ `${item.videos} ${$t("video.videos", item.videos)}` }}</span>
            </div>
        </div>

        <!-- Playlist Details -->
        <div class="p-3 flex-1 flex flex-col">
            <h3
                class="font-semibold text-main overflow-hidden"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                :title="item.name"
            >
                {{ item.name }}
            </h3>
            <p v-if="item.uploaderName" class="mt-1 text-sm text-soft truncate">
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
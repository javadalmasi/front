<template>
    <!-- desktop view -->
    <div
        v-if="!mobileLayout"
        class="max-h-75vh max-w-auto min-h-64 flex-col overflow-y-auto border rounded-xl p-3 lt-lg:hidden"
    >
        <span class="mb-2 rounded-md bg-gray-500/30 px-1.5 text-lg" aria-label="video-sections" title="video-sections">
            {{ $t("info.video_sections") }}
        </span>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter-vertical cursor-pointer rounded-md px-1 py-1.5 transition-colors duration-150 hover:bg-gray-500/20"
            :class="{ 'text-blue-500 font-bold': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex flex-col">
                <span class="text-xs font-medium leading-tight" :title="chapter.title" v-text="chapter.title" />
                <span
                    class="mt-0.5 text-xs text-gray-500 font-medium leading-tight"
                    v-text="timeFormat(chapter.start)"
                />
            </div>
        </div>
    </div>

    <!-- mobile vertical view -->
    <div
        v-if="mobileLayout && getPreferenceString('mobileChapterLayout') == 'Vertical'"
        class="max-h-64 flex flex-col overflow-y-auto border rounded-xl p-3"
    >
        <span class="mb-2 rounded-md bg-gray-500/30 p-1.5 text-xs" aria-label="video-sections" title="video-sections">
            {{ $t("info.video_sections") }}
        </span>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter-vertical cursor-pointer rounded-md px-1 py-1.5 transition-colors duration-150 hover:bg-gray-500/20"
            :class="{ 'text-blue-500 font-bold': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex flex-col">
                <span class="text-xs font-medium leading-tight" :title="chapter.title" v-text="chapter.title" />
                <span
                    class="mt-0.5 text-xs text-gray-500 font-medium leading-tight"
                    v-text="timeFormat(chapter.start)"
                />
            </div>
        </div>
    </div>
    <!-- mobile Horizontal view -->
    <div
        v-if="getPreferenceString('mobileChapterLayout') == 'Horizontal' && mobileLayout"
        class="flex overflow-x-auto border rounded-xl p-3"
    >
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter min-w-max cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-gray-500/20"
            :class="{ 'text-blue-500 font-bold': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex flex-col">
                <span
                    class="text-truncate text-xs font-medium leading-tight"
                    :title="chapter.title"
                    v-text="chapter.title"
                />
                <span class="px-1 text-xs text-gray-500 font-medium leading-tight" v-text="timeFormat(chapter.start)" />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    chapters: {
        type: Object,
        default: () => null,
    },
    mobileLayout: {
        type: Boolean,
        default: () => true,
    },
    playerPosition: {
        type: Number,
        default: () => 0,
    },
});

const isCurrentChapter = index => {
    return (
        props.playerPosition >= props.chapters[index].start &&
        props.playerPosition < (props.chapters[index + 1]?.start ?? Infinity)
    );
};

defineEmits(["seek"]);
</script>

<style>
::-webkit-scrollbar {
    height: 5px;
}
.chapter {
    @apply cursor-pointer self-center p-2.5;
}
.chapter img {
    @apply w-full h-full;
}
.chapter-vertical {
    @apply cursor-pointer self-center p-2.5;
}
.chapter-vertical img {
    @apply w-3/10 h-3/10;
}

.chapter-vertical:hover {
    @apply bg-gray-500;
}
.text-truncate {
    @apply truncate overflow-hidden inline-block w-10em;
}
</style>

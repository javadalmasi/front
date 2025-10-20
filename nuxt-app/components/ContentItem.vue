<template>
    <component
        :is="compName"
        :item="item"
        :hide-channel="hideChannel"
        :clamp-title-lines="clampTitleLines"
        v-bind="$attrs"
    />
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
    hideChannel: {
        type: Boolean,
        default: false,
    },
    clampTitleLines: {
        type: Boolean,
        default: true,
    },
});

const VideoItem = defineAsyncComponent(() => import("./VideoItem.vue"));
const PlaylistItem = defineAsyncComponent(() => import("./PlaylistItem.vue"));
const ChannelItem = defineAsyncComponent(() => import("./ChannelItem.vue"));

var compName;

switch (props.item?.type) {
    case "stream":
        compName = VideoItem;
        break;
    case "playlist":
        compName = PlaylistItem;
        break;
    case "channel":
        compName = ChannelItem;
        break;
    default:
        console.error("Unexpected item type: " + props.item.type);
}

defineExpose({
    compName,
});
</script>

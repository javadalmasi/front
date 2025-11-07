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

// Determine component based on available properties if type is undefined
if (props.item?.type === undefined) {
    // If it has video-specific properties, assume it's a stream
    if (props.item?.id && (props.item?.duration !== undefined || props.item?.uploaderName || props.item?.views !== undefined)) {
        compName = VideoItem;
    } 
    // If it has playlist-specific properties, assume it's a playlist
    else if (props.item?.videos !== undefined || props.item?.uploaderUrl) {
        compName = PlaylistItem;
    } 
    // If it has channel-specific properties, assume it's a channel
    else if (props.item?.uploader || props.item?.subscribers !== undefined) {
        compName = ChannelItem;
    } 
    // Default fallback
    else {
        console.warn("Item type is undefined and cannot be inferred from properties: ", props.item);
        compName = VideoItem; // Default to VideoItem as most common
    }
} else {
    switch (props.item.type) {
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
            console.warn("Unexpected item type: ", props.item.type, "Item: ", props.item);
            compName = VideoItem; // Default to VideoItem as most common
    }
}

defineExpose({
    compName,
});
</script>

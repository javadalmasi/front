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
const ChannelItem = defineAsyncComponent(() => import("./ChannelItem.vue"));
const PlaylistItem = defineAsyncComponent(() => import("./PlaylistItem.vue"));

var compName;

switch (props.item?.type) {
    case "stream":
        compName = VideoItem;
        break;
    case "channel":
        compName = ChannelItem;
        break;
    case "playlist":
        compName = PlaylistItem;
        break;
    default:
        import("../utils/DebugLogger").then(({ debugLogger }) => {
            debugLogger.error("Unexpected item type: " + props.item.type);
        });
}

defineExpose({
    compName,
});
</script>

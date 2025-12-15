<script>
export default {
    props: {
        link: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: false,
            default: "YouTube",
        },
    },
};
</script>

<template>
    <template v-if="getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- Circular icon-only button for all screens -->
        <a
            :href="link"
            class="btn-icon flex items-center justify-center w-10 h-10 rounded-full p-0 btn btn-secondary"
            :title="$t('player.watch_on', { platform: platform })"
            :data-title="$t('player.watch_on', { platform: platform })"
            :aria-label="'Watch on ' + platform"
        >
            <i v-if="platform == 'YouTube'" class="i-fa6-brands:youtube" />
            <i v-else-if="platform == 'Odysee'" class="i-fa6-brands:odysee" />
            <span class="btn-text mr-1" v-t="['player.watch_on', { platform: platform }]" />
        </a>
    </template>
</template>
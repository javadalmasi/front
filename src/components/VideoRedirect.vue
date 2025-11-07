<template>
    <div v-t="'actions.loading'" />
</template>

<script>
export default {
    activated() {
        const videoId = this.$route.params.videoId;
        if (videoId)
            this.$router.replace({
                path: `/v/${videoId}`,
                query: { t: this.$route.query.t },
            });
    },
};
</script>

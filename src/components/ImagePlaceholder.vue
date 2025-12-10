<template>
    <div class="image-placeholder-container" :style="{ backgroundColor: backgroundColor }">
        <img
            :src="currentSrc"
            :alt="alt"
            :width="width"
            :height="height"
            :class="imageClass"
            @error="handleImageError"
            @load="onLoad"
        />
    </div>
</template>

<script>
export default {
    name: 'ImagePlaceholder',
    props: {
        src: {
            type: String,
            default: null,
        },
        alt: {
            type: String,
            default: '',
        },
        width: {
            type: [String, Number],
            default: 'auto',
        },
        height: {
            type: [String, Number],
            default: 'auto',
        },
        imageClass: {
            type: String,
            default: '',
        },
        backgroundColor: {
            type: String,
            default: '#f0f0f0',
        },
        fallbackSrc: {
            type: String,
            default: '/img/placeholder-video-thumbnail.webp',
        },
    },
    data() {
        return {
            currentSrc: this.src,
            hasError: false,
        };
    },
    watch: {
        src(newSrc) {
            this.currentSrc = newSrc;
            this.hasError = false;
        },
    },
    methods: {
        handleImageError() {
            if (!this.hasError) {
                this.hasError = true;
                this.currentSrc = this.fallbackSrc;
            }
        },
        onLoad() {
            // Reset error flag when image loads successfully
            this.hasError = false;
        }
    },
};
</script>

<style scoped>
.image-placeholder-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
</style>
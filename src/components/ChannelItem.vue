<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
        <router-link :to="item.url" class="link font-bold">
            <div class="my-4 flex justify-center">
                <div class="relative inline-block">
                    <img
                        loading="lazy"
                        :src="item.thumbnail"
                        :class="{ 'border-2 border-blue-700': item.verified, 'rounded-full': true }"
                        class="aspect-square h-auto w-24"
                        width="68"
                        height="68"
                    />
                    <div
                        v-if="item.verified"
                        class="absolute end-0.5 bottom-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-blue-700"
                    >
                        <i class="i-fa6-solid:check text-[8px] text-white" />
                    </div>
                </div>
            </div>
            <p :style="titleStyle" class="mt-2">
                <span v-text="item.name" />
                <i v-if="item.verified" class="i-fa6-solid:check ml-1.5" />
            </p>
        </router-link>
        <p
            v-if="item.description"
            class="pt-1 text-sm leading-[1.65]"
            style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden"
            v-text="item.description"
        />
        <router-link v-if="item.uploaderUrl" class="link" :to="item.uploaderUrl">
            <p>
                <span v-text="item.uploader" />
                <i v-if="item.uploaderVerified" class="i-fa6-solid:check mr-1.5" />
            </p>
        </router-link>

        <a v-if="item.uploaderName" class="link no-underline hover:underline-dashed" v-text="item.uploaderName" />
        <template v-if="item.videos >= 0">
            <br v-if="item.uploaderName" />
            <strong v-text="`${item.videos} ${$t('video.videos')}`" />
        </template>

        <button
            v-if="subscribed != null"
            :class="[subscribed ? 'btn btn-unsubscribe mt-2 w-max' : 'btn btn-red mt-2 w-max']"
            class="mx-auto"
            @click="subscribeHandler"
        >
            <i v-if="!subscribed" class="i-fa6-solid:bell mr-1.5" />
            <i v-if="subscribed" class="i-fa6-solid:bell-slash mr-1.5" />
            {{ $t("actions." + (subscribed ? "unsubscribe" : "subscribe")) + " - " + numberFormat(item.subscribers) }}
        </button>

        <br />
    </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        clampTitleLines: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            subscribed: null,
        };
    },
    computed: {
        titleStyle(_this) {
            // Apply line clamping only if the prop is true
            if (_this.clampTitleLines) {
                return {
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                    overflow: "hidden",
                };
            }
            // Return an empty style object when not clamping
            return {};
        },
        channelId(_this) {
            return _this.item.url.substr(-24);
        },
    },
    mounted() {
        this.updateSubscribedStatus();
    },
    methods: {
        async updateSubscribedStatus() {
            this.subscribed = await this.fetchSubscriptionStatus(this.channelId);
            console.log(this.subscribed);
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channelId, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
    },
};
</script>

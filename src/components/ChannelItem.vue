<template>
    <div class="card h-full flex flex-col items-center justify-between p-4 text-center transition-all duration-200 hover:shadow-lg">
        <!-- Channel Info -->
        <router-link :to="item.url" class="flex flex-col items-center gap-3">
            <!-- Avatar -->
            <div class="relative">
                <img
                    loading="lazy"
                    :src="item.thumbnail"
                    class="w-24 h-24 rounded-full bg-surface object-cover"
                    alt=""
                />
                <div
                    v-if="item.verified"
                    class="absolute end-0 bottom-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary"
                    :title="$t('channel.verified')"
                >
                    <i class="i-fa6-solid:check text-xs text-white" />
                </div>
            </div>

            <!-- Name -->
            <div>
                <h3 class="font-semibold text-main" :title="item.name">{{ item.name }}</h3>
                <p v-if="item.subscribers > 0" class="text-sm text-soft">
                    {{ `${numberFormat(item.subscribers)} ${$t("channel.subscribers", item.subscribers)}` }}
                </p>
            </div>
        </router-link>

        <!-- Subscribe Button -->
        <button
            v-if="subscribed !== null"
            class="btn w-full mt-4"
            :class="subscribed ? 'btn-secondary' : 'btn-subscribe'"
            @click.stop.prevent="subscribeHandler"
        >
            <i v-if="!subscribed" class="i-fa6-solid:bell" />
            <i v-else class="i-fa6-solid:bell-slash" />
            <span>{{ $t(subscribed ? "actions.unsubscribe" : "actions.subscribe") }}</span>
        </button>
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            subscribed: null,
        };
    },
    computed: {
        channelId() {
            return this.item.url?.substr(-24);
        },
    },
    watch: {
        // Watch for item changes to re-evaluate subscription status
        item: "updateSubscribedStatus",
    },
    mounted() {
        this.updateSubscribedStatus();
    },
    methods: {
        async updateSubscribedStatus() {
            if (this.channelId) {
                this.subscribed = await this.fetchSubscriptionStatus(this.channelId);
            }
        },
        async subscribeHandler() {
            const success = await this.toggleSubscriptionState(this.channelId, this.subscribed);
            if (success) {
                this.subscribed = !this.subscribed;
                // Optionally, update subscriber count if the API provides it on toggle
            }
        },
    },
};
</script>
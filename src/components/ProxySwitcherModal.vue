<template>
    <ModalComponent @close="$emit('close')">
        <div class="p-4">
            <h2 class="text-xl font-bold mb-4" v-t="'actions.proxy_switcher'"></h2>
            <div class="space-y-2 max-h-96 overflow-y-auto">
                <button
                    v-for="proxy in proxies"
                    :key="proxy.name"
                    :class="[
                        'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                        currentProxy && currentProxy.address === proxy.address
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-200 dark:hover:bg-dark-600'
                    ]"
                    @click="selectProxy(proxy)"
                >
                    <div class="flex items-center">
                        <span class="text-xl mr-3">{{ proxy.flag }}</span>
                        <div class="font-medium">{{ proxy.name }}</div>
                    </div>
                    <div class="flex items-center">
                        <span
                            class="px-2 py-1 rounded text-xs font-semibold"
                            :class="{
                                'bg-yellow-100 text-yellow-800': proxy.trafficType === 'half',
                                'bg-green-100 text-green-800': proxy.trafficType === 'full',
                            }"
                        >
                            {{ proxy.trafficType === 'half' ? $t('info.half_traffic') : $t('info.full_traffic') }}
                        </span>
                        <span v-if="currentProxy && currentProxy.address === proxy.address" class="ml-2 text-green-500">
                            <i class="i-fa6-solid:check"></i>
                        </span>
                    </div>
                </button>
            </div>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: { ModalComponent },
    props: {
        currentProxy: {
            type: Object,
            default: null
        }
    },
    emits: ["close", "proxy-selected"],
    data() {
        return {
            proxies: [
                {
                    name: this.$t('actions.main_source'),
                    address: "",  // Empty address means use original source without proxy
                    flag: "🌐",
                    trafficType: "full",
                    country: this.$t('actions.main')
                },
                {
                    name: "Hetzner",
                    address: "media.vidioo.ir",
                    flag: "🇩🇪",
                    trafficType: "full",
                    country: "Germany"
                },
                {
                    name: "Asiatech",
                    address: "media.599183.ir.cdn.ir",
                    flag: "🇮🇷",
                    trafficType: "half",
                    country: "Iran"
                }
            ]
        };
    },
    methods: {
        selectProxy(proxy) {
            this.$emit("proxy-selected", proxy);
            this.$emit("close");
        }
    }
};
</script>
<template>
    <footer
        class="mt-10 w-full border-t border-gray-200 bg-gray-50 py-4 text-center children:(mx-3) dark:border-dark-100 dark:bg-dark-800 z-30"
    >
        <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped" target="_blank">
            <i class="i-fa6-brands:github text-lg leading-[1.7]" />
            <span v-t="'actions.source_code'" class="mr-2 hover:underline" />
        </a>
        <a href="https://docs.piped.video/" target="_blank">
            <i class="i-fa6-solid:book text-lg leading-[1.7]" />
            <span v-t="'actions.documentation'" class="mr-2 hover:underline" />
        </a>
        <a href="https://github.com/TeamPiped/Piped#donations" target="_blank">
            <i class="i-fa6-brands:bitcoin text-lg leading-[1.7]" />
            <span v-t="'actions.donations'" class="mr-2 hover:underline" />
        </a>
        <a v-if="statusPageHref" :href="statusPageHref">
            <i class="i-fa6-solid:server text-lg leading-[1.7]" />
            <span v-t="'actions.status_page'" class="mr-2 hover:underline" />
        </a>
        <a v-if="donationHref" :href="donationHref">
            <i class="i-fa6-solid:money-check text-lg leading-[1.7]" />
            <span v-t="'actions.instance_donations'" class="mr-2 hover:underline" />
        </a>
        <a v-if="privacyPolicyHref" :href="privacyPolicyHref" target="_blank">
            <i class="i-fa6-solid:eye text-lg leading-[1.7]" />
            <span v-t="'actions.instance_privacy_policy'" class="mr-2 hover:underline" />
        </a>
    </footer>
</template>

<script>
export default {
    data() {
        return {
            donationHref: null,
            statusPageHref: null,
            privacyPolicyHref: null,
        };
    },
    mounted() {
        this.fetchConfig();
    },
    methods: {
        async fetchConfig() {
            this.fetchJson(this.apiUrl() + "/config").then(config => {
                this.donationHref = config?.donationUrl;
                this.statusPageHref = config?.statusPageUrl;
                this.privacyPolicyHref = config?.privacyPolicyUrl;
            });
        },
    },
};
</script>

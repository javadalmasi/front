<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">فراموشی رمز عبور</p>
            </div>

            <!-- Forgot Password Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <form @submit.prevent="sendResetLink">
                    <div class="mb-4">
                        <input
                            v-model="identifier"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="text"
                            autocomplete="username"
                            :placeholder="$t('login.email_or_phone')"
                            :aria-label="$t('login.email_or_phone')"
                        />
                    </div>

                    <div class="mb-4">
                        <button
                            type="submit"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                        >
                            ارسال لینک بازنشانی
                        </button>
                    </div>

                    <div class="text-center">
                        <router-link to="/auth" class="text-blue-600 font-medium hover:text-blue-800">
                            بازگشت به ورود
                        </router-link>
                    </div>
                </form>
            </div>

            <div class="mt-6 text-center">
                <router-link to="/" class="text-blue-600 font-medium hover:text-blue-800">
                    بازگشت به صفحه اصلی
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            identifier: null,
        };
    },
    methods: {
        async sendResetLink() {
            if (!this.identifier) {
                alert(this.$t("forgot_password.please_enter_email_or_phone"));
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/auth/request-password-reset", null, {
                    method: "POST",
                    body: JSON.stringify({
                        email: this.identifier,
                    }),
                });

                if (response.success) {
                    alert(this.$t("forgot_password.reset_link_sent"));
                    this.$router.push("/auth");
                } else {
                    alert(response.message || this.$t("forgot_password.error_sending_email"));
                }
            } catch (error) {
                console.error("Forgot password error:", error);
                alert(this.$t("forgot_password.request_error") + ": " + error.message);
            }
        },
    },
};
</script>

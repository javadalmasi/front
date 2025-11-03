<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">بازنشانی رمز جدید</p>
            </div>

            <!-- Password Reset Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <form @submit.prevent="resetPassword">
                    <div class="relative mb-4">
                        <input
                            v-model="newPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showNewPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            :placeholder="$t('password_reset.new_password')"
                            :aria-label="$t('password_reset.new_password')"
                            @input="checkPasswordStrength"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showNewPassword = !showNewPassword"
                        >
                            <div :class="showNewPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                        </button>
                    </div>

                    <div class="relative mb-4">
                        <input
                            v-model="confirmNewPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showConfirmNewPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            :placeholder="$t('password_reset.confirm_new_password')"
                            :aria-label="$t('password_reset.confirm_new_password')"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showConfirmNewPassword = !showConfirmNewPassword"
                        >
                            <div :class="showConfirmNewPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                        </button>
                    </div>

                    <div v-if="passwordStrength !== null" class="mb-4">
                        <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-dark-400">
                            <div
                                class="h-2 rounded-full"
                                :class="passwordStrengthClass"
                                :style="{ width: passwordStrength + '%' }"
                            ></div>
                        </div>
                        <div class="mt-1 text-sm" :class="passwordStrengthTextClass">{{ passwordStrengthText }}</div>
                    </div>

                    <div class="mb-4">
                        <button
                            type="submit"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            :disabled="!isResetFormValid"
                        >
                            بازنشانی رمز عبور
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
import { checkPasswordStrength } from "@/utils/Misc.js";

export default {
    data() {
        return {
            newPassword: null,
            confirmNewPassword: null,
            showNewPassword: false,
            showConfirmNewPassword: false,
            passwordStrength: null,
            passwordStrengthText: "",
            passwordStrengthClass: "",
            passwordStrengthTextClass: "",
            token: null,
        };
    },
    computed: {
        isResetFormValid() {
            return (
                this.newPassword &&
                this.confirmNewPassword &&
                this.newPassword === this.confirmNewPassword &&
                this.passwordStrength >= 40
            );
        },
    },
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get("token");
        document.title = this.$t("titles.password_reset") + " - " + this.getSiteName();
    },
    methods: {
        async resetPassword() {
            if (!this.isResetFormValid) {
                alert(this.$t("password_reset.fill_fields_correctly"));
                return;
            }

            if (!this.token) {
                alert(this.$t("password_reset.invalid_token"));
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/auth/reset-password", null, {
                    method: "POST",
                    body: JSON.stringify({
                        token: this.token,
                        password: this.newPassword,
                    }),
                });

                if (response.success) {
                    alert(this.$t("password_reset.password_changed_successfully"));
                    this.$router.push("/auth");
                } else {
                    alert(response.message || this.$t("password_reset.error_resetting_password"));
                }
            } catch (error) {
                console.error("Password reset error:", error);
                alert(this.$t("password_reset.error_changing_password") + ": " + error.message);
            }
        },
        checkPasswordStrength() {
            if (!this.newPassword) {
                this.passwordStrength = null;
                return;
            }
            const result = checkPasswordStrength(this.newPassword, this.$i18n);
            this.passwordStrength = result.strength;
            this.passwordStrengthText = result.text;
            this.passwordStrengthClass = result.class;
            this.passwordStrengthTextClass = result.textClass;
        },
    },
};
</script>

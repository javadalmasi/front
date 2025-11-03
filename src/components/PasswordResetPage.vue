<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">
                    {{ isRequestMode ? "بازنشانی رمز عبور" : "بازنشانی رمز جدید" }}
                </p>
            </div>

            <!-- Password Reset Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <!-- Request Password Reset Form -->
                <form v-if="isRequestMode">
                    <div class="mb-4">
                        <input
                            v-model="email"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="email"
                            autocomplete="email"
                            placeholder="ایمیل"
                            :aria-label="$t('password_reset.email')"
                            @keyup.enter="requestPasswordReset"
                        />
                    </div>

                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            @click="requestPasswordReset"
                        >
                            ارسال لینک بازنشانی
                        </button>
                    </div>

                    <div class="text-center">
                        <router-link to="/auth" class="text-blue-600 font-medium hover:text-blue-800">
                            به ورود بازگردید
                        </router-link>
                    </div>
                </form>

                <!-- Reset Password Form (with token) -->
                <form v-else>
                    <div class="mb-4">
                        <input
                            v-model="newPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showNewPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="رمز عبور جدید"
                            :aria-label="$t('password_reset.new_password')"
                            @input="checkPasswordStrength"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
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
                            placeholder="تایید رمز عبور جدید"
                            :aria-label="$t('password_reset.confirm_new_password')"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
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
                            type="button"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            :disabled="!isResetFormValid"
                            @click="resetPassword"
                        >
                            بازنشانی رمز عبور
                        </button>
                    </div>

                    <div class="text-center">
                        <router-link to="/auth" class="text-blue-600 font-medium hover:text-blue-800">
                            به ورود بازگردید
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
            isRequestMode: true, // true for requesting reset, false for resetting with token
            email: null,
            newPassword: null,
            confirmNewPassword: null,
            showNewPassword: false,
            showConfirmNewPassword: false,
            passwordStrength: null,
            passwordStrengthText: "",
            passwordStrengthClass: "",
            passwordStrengthTextClass: "",
            token: null, // Will be populated from URL if in reset mode
        };
    },
    computed: {
        isResetFormValid() {
            return (
                this.newPassword &&
                this.confirmNewPassword &&
                this.newPassword === this.confirmNewPassword &&
                this.passwordStrength >= 40 // Minimum password strength requirement
            );
        },
    },
    mounted() {
        // Check if we have a reset token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            this.token = token;
            this.isRequestMode = false; // Switch to reset mode
            document.title = this.$t("titles.password_reset") + " - " + this.getSiteName();
        }
    },
    methods: {
        async requestPasswordReset() {
            if (!this.email) {
                alert("لطفاً ایمیل خود را وارد کنید");
                return;
            }

            try {
                const response = await this.fetchJson(this.authApiUrl() + "/api/auth/request-password-reset", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: this.email,
                    }),
                });

                if (response.success) {
                    alert("لینک بازنشانی رمز عبور به ایمیل شما ارسال شد");
                    this.$router.push("/auth");
                } else {
                    alert(response.message || "خطا در ارسال ایمیل بازنشانی");
                }
            } catch (error) {
                console.error("Password reset request error:", error);
                alert("خطا در ارسال درخواست: " + error.message);
            }
        },
        async resetPassword() {
            if (!this.isResetFormValid) {
                alert("لطفاً فیلدها را به درستی پر کنید");
                return;
            }

            if (!this.token) {
                alert("توکن بازنشانی رمز عبور نامعتبر است");
                return;
            }

            try {
                const response = await this.fetchJson(this.authApiUrl() + "/api/auth/reset-password", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: this.token,
                        password: this.newPassword,
                    }),
                });

                if (response.success) {
                    alert("رمز عبور با موفقیت تغییر یافت");
                    this.$router.push("/auth");
                } else {
                    alert(response.message || "خطا در بازنشانی رمز عبور");
                }
            } catch (error) {
                console.error("Password reset error:", error);
                alert("خطا در تغییر رمز عبور: " + error.message);
            }
        },
        checkPasswordStrength() {
            if (!this.newPassword) {
                this.passwordStrength = null;
                return;
            }

            const result = checkPasswordStrength(this.newPassword);
            this.passwordStrength = result.strength;
            this.passwordStrengthText = result.text;
            this.passwordStrengthClass = result.barClass;
            this.passwordStrengthTextClass = result.textClass;
        },
    },
};
</script>

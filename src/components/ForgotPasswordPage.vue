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
                <form>
                    <div class="mb-4">
                        <input
                            v-model="email"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="email"
                            autocomplete="email"
                            placeholder="آدرس ایمیل"
                            :aria-label="$t('forgot_password.email')"
                            @keyup.enter="sendResetLink"
                        />
                    </div>

                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            @click="sendResetLink"
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
            email: null,
        };
    },
    methods: {
        async sendResetLink() {
            if (!this.email) {
                alert("لطفاً آدرس ایمیل خود را وارد کنید");
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
                    alert("لینک بازنشانی رمز عبور به ایمیل شما ارسال شده است");
                    this.$router.push("/auth");
                } else {
                    alert(response.message || "خطا در ارسال ایمیل بازنشانی");
                }
            } catch (error) {
                console.error("Forgot password error:", error);
                alert("خطا در ارسال درخواست: " + error.message);
            }
        },
    },
};
</script>

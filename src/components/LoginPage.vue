<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">به حساب خود وارد شوید</p>
            </div>

            <!-- Login Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <form>
                    <div class="mb-4">
                        <input
                            v-model="username"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="text"
                            autocomplete="username"
                            placeholder="ایمیل یا شماره تلفن"
                            :aria-label="$t('login.email_or_phone')"
                            @keyup.enter="login"
                        />
                    </div>
                    <div class="relative mb-4">
                        <input
                            v-model="password"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="password"
                            placeholder="رمز عبور"
                            :aria-label="$t('login.password')"
                            @keyup.enter="login"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showPassword = !showPassword"
                        >
                            <div :class="showPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                        </button>
                    </div>

                    <!-- Cloudflare Turnstile Widget -->
                    <div id="turnstile-widget" class="mb-4"></div>

                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            @click="login"
                        >
                            ورود
                        </button>
                    </div>
                </form>

                <div class="my-4 flex items-center">
                    <div class="flex-grow border-t border-gray-300 dark:border-dark-400"></div>
                    <span class="mx-4 text-gray-500 dark:text-gray-400">یا</span>
                    <div class="flex-grow border-t border-gray-300 dark:border-dark-400"></div>
                </div>

                <div class="flex flex-col gap-2">
                    <router-link to="/register" class="text-center text-blue-600 font-medium hover:text-blue-800">
                        ایجاد حساب جدید
                    </router-link>
                    <router-link
                        to="/forgot-password"
                        class="text-center text-blue-600 font-medium hover:text-blue-800"
                    >
                        رمز عبور خود را فراموش کرده‌اید؟
                    </router-link>
                </div>
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
            username: null,
            password: null,
            showPassword: false,
            captchaToken: null,
        };
    },
    mounted() {
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push(import.meta.env.BASE_URL);
        }

        // Removed Turnstile widget loading as per requirement
    },
    activated() {
        document.title = this.$t("titles.login") + " - " + this.getSiteName();
    },
    methods: {
        login() {
            if (!this.username || !this.password) return;
            // Check if username is an email or phone number
            const isEmail = this.isEmail(this.username);
            const loginData = isEmail
                ? {
                      email: this.username,
                      password: this.password,
                  }
                : {
                      phone: this.username,
                      password: this.password,
                  };

            // Remove captcha_token if it's null or empty (for development)
            // Removed as per requirement to disable Turnstile

            this.fetchJson(this.authApiUrl() + "/api/auth/login", null, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            })
                .then(resp => {
                    if (resp.success && resp.data && resp.data.token) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data.token);
                        window.location = import.meta.env.BASE_URL; // done to bypass cache
                    } else if (resp.message) {
                        alert(resp.message);
                    } else {
                        alert(resp.error || "Login failed");
                    }
                })
                .catch(error => {
                    console.error("Login error:", error);
                    alert("Login failed: " + error.message);
                });
        },

        isEmail(input) {
            // Taken from https://emailregex.com
            const result = input.match(
                //eslint-disable-next-line
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            );
            return result !== null;
        },

        async loadTurnstile() {
            // Check if Turnstile script is already loaded
            if (!window.turnstile) {
                // Load the Turnstile script dynamically
                const script = document.createElement("script");
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                // Wait for the script to load
                await new Promise(resolve => {
                    script.onload = resolve;
                });
            }

            // Initialize Turnstile widget
            // Note: You'll need to replace 'your-site-key' with your actual Cloudflare Turnstile site key
            const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Test key for development

            if (window.turnstile) {
                // Wait a bit for the DOM to update
                setTimeout(() => {
                    window.turnstile.render("#turnstile-widget", {
                        sitekey: siteKey,
                        callback: token => {
                            this.captchaToken = token;
                        },
                        "error-callback": () => {
                            console.error("Turnstile error occurred");
                            this.captchaToken = null;
                        },
                        "expired-callback": () => {
                            console.warn("Turnstile token expired");
                            this.captchaToken = null;
                        },
                    });
                }, 100);
            }
        },
    },
};
</script>

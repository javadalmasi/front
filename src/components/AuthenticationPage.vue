<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">
                    {{ isLogin ? "به حساب خود وارد شوید" : "ایجاد حساب کاربری جدید" }}
                </p>
            </div>

            <!-- Auth Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <!-- Tab Navigation -->
                <div class="mb-6 flex">
                    <button
                        :class="[
                            'flex-1 py-3 font-bold rounded-lg transition duration-200',
                            isLogin
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600',
                        ]"
                        @click="switchToLogin"
                    >
                        ورود
                    </button>
                    <button
                        :class="[
                            'flex-1 py-3 font-bold rounded-lg mr-2 transition duration-200',
                            !isLogin
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600',
                        ]"
                        @click="switchToRegister"
                    >
                        ثبت نام
                    </button>
                </div>

                <!-- Login Form -->
                <form v-if="isLogin">
                    <div class="mb-4">
                        <input
                            v-model="loginUsername"
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
                            v-model="loginPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showLoginPassword ? 'text' : 'password'"
                            autocomplete="password"
                            placeholder="رمز عبور"
                            :aria-label="$t('login.password')"
                            @keyup.enter="login"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showLoginPassword = !showLoginPassword"
                        >
                            <div :class="showLoginPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                        </button>
                    </div>

                    <!-- Cloudflare Turnstile Widget -->
                    <div id="login-turnstile-widget" class="mb-4"></div>

                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
                            @click="login"
                        >
                            ورود
                        </button>
                    </div>

                    <div class="flex flex-col gap-2">
                        <button
                            type="button"
                            class="text-blue-600 font-medium hover:text-blue-800"
                            @click="switchToRegister"
                        >
                            حساب کاربری ندارید؟ ثبت نام کنید
                        </button>
                        <router-link
                            to="/forgot-password"
                            class="text-center text-blue-600 font-medium hover:text-blue-800"
                        >
                            رمز عبور خود را فراموش کرده‌اید؟
                        </router-link>
                    </div>
                </form>

                <!-- Registration Form -->
                <form v-else>
                    <div class="grid grid-cols-2 mb-4 gap-4">
                        <div>
                            <input
                                v-model="firstName"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                type="text"
                                :placeholder="$t('login.first_name')"
                                :aria-label="$t('login.first_name')"
                                @keyup.enter="register"
                            />
                        </div>
                        <div>
                            <input
                                v-model="lastName"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                type="text"
                                :placeholder="$t('login.last_name')"
                                :aria-label="$t('login.last_name')"
                                @keyup.enter="register"
                            />
                        </div>
                    </div>
                    <div class="mb-4">
                        <input
                            v-model="registerUsername"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="text"
                            autocomplete="username"
                            :placeholder="$t('login.email_or_phone')"
                            :aria-label="$t('login.email_or_phone')"
                            @keyup.enter="register"
                        />
                    </div>
                    <div class="relative mb-4">
                        <input
                            v-model="registerPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showRegisterPassword ? 'text' : 'password'"
                            autocomplete="password"
                            :placeholder="$t('login.password')"
                            :aria-label="$t('login.password')"
                            @keyup.enter="register"
                            @input="checkPasswordStrength"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showRegisterPassword = !showRegisterPassword"
                        >
                            <div :class="showRegisterPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                        </button>
                    </div>
                    <div class="relative mb-4">
                        <input
                            v-model="passwordConfirm"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            autocomplete="password"
                            :placeholder="$t('login.password_confirm')"
                            :aria-label="$t('login.password_confirm')"
                            @keyup.enter="register"
                            @input="checkPasswordStrength"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showConfirmPassword = !showConfirmPassword"
                        >
                            <div :class="showConfirmPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
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

                    <!-- Cloudflare Turnstile Widget -->
                    <div id="register-turnstile-widget" class="mb-4"></div>

                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-green-600 py-3 text-white font-bold transition duration-200 hover:bg-green-700"
                            :disabled="!isRegisterFormValid"
                            @click="register"
                        >
                            ثبت نام
                        </button>
                    </div>

                    <div class="text-center">
                        <button
                            type="button"
                            class="text-blue-600 font-medium hover:text-blue-800"
                            @click="switchToLogin"
                        >
                            قبلاً حساب کاربری داشتید؟ ورود
                        </button>
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
    components: {},
    data() {
        return {
            isLogin: true,
            loginUsername: null,
            loginPassword: null,
            showLoginPassword: false,
            registerUsername: null,
            registerPassword: null,
            passwordConfirm: null,
            showRegisterPassword: false,
            showConfirmPassword: false,
            firstName: null,
            lastName: null,
            passwordStrength: null,
            passwordStrengthText: "",
            passwordStrengthClass: "",
            passwordStrengthTextClass: "",
            showUnsecureRegisterDialog: false,
            forceUnsecureRegister: false,
            captchaToken: null,
        };
    },
    computed: {
        isRegisterFormValid() {
            // In development, we might not have CAPTCHA set up properly
            // For production, you should keep the captchaToken requirement
            const isDevelopment = import.meta.env.MODE === "development" || !import.meta.env.PROD;

            // For development, we'll allow weaker passwords
            const minPasswordStrength = isDevelopment ? 40 : 75;

            return (
                this.firstName &&
                this.lastName &&
                this.registerUsername &&
                this.registerPassword &&
                this.registerPassword === this.passwordConfirm &&
                this.passwordStrength >= minPasswordStrength
            );
        },
    },
    mounted() {
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push(import.meta.env.BASE_URL);
        }

        // Load Cloudflare Turnstile widgets
        this.loadTurnstile();
    },
    activated() {
        document.title =
            (this.isLogin ? this.$t("titles.login") : this.$t("titles.register")) + " - " + this.getSiteName();
    },
    methods: {
        switchToLogin() {
            this.isLogin = true;
            document.title = this.$t("titles.login") + " - " + this.getSiteName();
        },
        switchToRegister() {
            this.isLogin = false;
            document.title = this.$t("titles.register") + " - " + this.getSiteName();
        },
        login() {
            if (!this.loginUsername || !this.loginPassword) return;

            // Check if username is an email or phone number
            const isEmailValue = this.isEmail(this.loginUsername);
            const loginData = isEmailValue
                ? {
                      email: this.loginUsername,
                      password: this.loginPassword,
                      captcha_token: this.captchaToken,
                  }
                : {
                      phone: this.loginUsername,
                      password: this.loginPassword,
                      captcha_token: this.captchaToken,
                  };

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
        register() {
            if (!this.isRegisterFormValid) {
                alert(this.$t("login.please_fill_all_fields_correctly"));
                return;
            }

            // Check if username is an email or phone number
            const isEmailValue = this.isEmail(this.registerUsername);
            const registrationData = isEmailValue
                ? {
                      email: this.registerUsername,
                      first_name: this.firstName,
                      last_name: this.lastName,
                      password: this.registerPassword,
                      captcha_token: this.captchaToken,
                  }
                : {
                      phone: this.registerUsername,
                      first_name: this.firstName,
                      last_name: this.lastName,
                      password: this.registerPassword,
                      captcha_token: this.captchaToken,
                  };

            this.fetchJson(this.authApiUrl() + "/api/auth/register", null, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            })
                .then(resp => {
                    if (resp.success && resp.data && resp.data.token) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data.token);
                        window.location = import.meta.env.BASE_URL; // done to bypass cache
                    } else if (resp.message) {
                        alert(resp.message);
                    } else {
                        alert(resp.error || "Registration failed");
                    }
                })
                .catch(error => {
                    console.error("Registration error:", error);
                    alert("Registration failed: " + error.message);
                });
        },
        checkPasswordStrength() {
            const password = this.registerPassword || "";
            let strength = 0;
            let text = "";
            let textClass = "";

            // Length check (0-40 points)
            if (password.length >= 8) strength += 20;
            if (password.length >= 12) strength += 10;
            if (password.length >= 16) strength += 10;

            // Character variety checks (0-40 points)
            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumbers = /[0-9]/.test(password);
            const hasSymbols = /[^a-zA-Z0-9]/.test(password);

            if (hasLowercase) strength += 5;
            if (hasUppercase) strength += 5;
            if (hasNumbers) strength += 5;
            if (hasSymbols) strength += 5;

            // Variety bonus (0-20 points)
            const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
            if (varietyCount >= 3) strength += 10;
            if (varietyCount >= 4) strength += 10;

            // Update UI based on strength
            if (strength < 40) {
                text = this.$t("info.password_weak");
                textClass = "text-red-500";
            } else if (strength < 75) {
                text = this.$t("info.password_fair");
                textClass = "text-yellow-500";
            } else if (strength < 90) {
                text = this.$t("info.password_good");
                textClass = "text-blue-500";
            } else {
                text = this.$t("info.password_strong");
                textClass = "text-green-500";
            }

            this.passwordStrength = strength;
            this.passwordStrengthText = text;
            this.passwordStrengthClass =
                strength < 40
                    ? "bg-red-500"
                    : strength < 75
                        ? "bg-yellow-500"
                        : strength < 90
                            ? "bg-blue-500"
                            : "bg-green-500";
            this.passwordStrengthTextClass = textClass;

            return strength;
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

            // Initialize Turnstile widgets
            // Note: You'll need to replace 'your-site-key' with your actual Cloudflare Turnstile site key
            const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Test key for development

            if (window.turnstile) {
                // Wait a bit for the DOM to update
                setTimeout(() => {
                    // Render login widget
                    window.turnstile.render("#login-turnstile-widget", {
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

                    // Render register widget
                    window.turnstile.render("#register-turnstile-widget", {
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
        isEmail(input) {
            // Taken from https://emailregex.com
            const result = input.match(
                //eslint-disable-next-line
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            );
            return result !== null;
        },
    },
};
</script>

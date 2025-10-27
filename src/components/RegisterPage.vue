<template>
    <div class="flex justify-center">
        <div class="max-w-md w-full">
            <!-- Logo and Title -->
            <div class="mb-6 mt-8 text-center">
                <div class="mb-2 text-4xl text-blue-600 font-bold">ویدیو</div>
                <p class="text-gray-600 dark:text-gray-300">ایجاد حساب کاربری جدید</p>
            </div>

            <!-- Registration Form -->
            <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                <form>
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
                            v-model="username"
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
                            v-model="password"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="password"
                            :placeholder="$t('login.password')"
                            :aria-label="$t('login.password')"
                            @keyup.enter="register"
                            @input="checkPasswordStrength"
                        />
                        <button
                            type="button"
                            class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                            @click="showPassword = !showPassword"
                        >
                            <div :class="showPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
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
                    <div id="turnstile-widget" class="mb-4"></div>
                    <div class="mb-4">
                        <button
                            type="button"
                            class="w-full rounded-lg bg-green-600 py-3 text-white font-bold transition duration-200 hover:bg-green-700"
                            :disabled="!isFormValid()"
                            @click="register"
                        >
                            ثبت نام
                        </button>
                    </div>
                </form>

                <div class="my-4 flex items-center">
                    <div class="flex-grow border-t border-gray-300 dark:border-dark-400"></div>
                    <span class="mx-4 text-gray-500 dark:text-gray-400">یا</span>
                    <div class="flex-grow border-t border-gray-300 dark:border-dark-400"></div>
                </div>

                <div class="text-center">
                    <router-link to="/login" class="text-blue-600 font-medium hover:text-blue-800">
                        ورود به حساب موجود
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
import { checkPasswordStrength } from "../utils/Misc.js";

export default {
    data() {
        return {
            firstName: null,
            lastName: null,
            username: null,
            password: null,
            passwordConfirm: null,
            showPassword: false,
            showConfirmPassword: false,
            showUnsecureRegisterDialog: false,
            forceUnsecureRegister: false,
            passwordStrength: null,
            passwordStrengthText: "",
            passwordStrengthClass: "",
            passwordStrengthTextClass: "",
            captchaToken: null,
        };
    },
    mounted() {
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push(import.meta.env.BASE_URL);
        }

        // Load Cloudflare Turnstile widget
        this.loadTurnstile();
    },
    activated() {
        document.title = "Register - " + this.getSiteName();
    },
    methods: {
        register() {
            if (!this.isFormValid()) {
                alert(this.$t("login.please_fill_all_fields_correctly"));
                return;
            }

            // Check if username is an email or phone number
            const isEmailValue = this.isEmail(this.username);
            const registrationData = isEmailValue
                ? {
                      email: this.username,
                      first_name: this.firstName,
                      last_name: this.lastName,
                      password: this.password,
                      captcha_token: this.captchaToken,
                  }
                : {
                      phone: this.username,
                      first_name: this.firstName,
                      last_name: this.lastName,
                      password: this.password,
                      captcha_token: this.captchaToken,
                  };

            this.fetchJson(this.userApiUrl() + "/register", null, {
                method: "POST",
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

        isEmail(input) {
            // Taken from https://emailregex.com
            const result = input.match(
                //eslint-disable-next-line
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            );
            return result !== null;
        },

        checkPasswordStrength() {
            const password = this.password || "";
            const result = checkPasswordStrength(password);

            this.passwordStrength = result.strength;
            this.passwordStrengthText = result.text;
            this.passwordStrengthClass = result.barClass;
            this.passwordStrengthTextClass = result.textClass;

            return result.strength;
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

        isFormValid() {
            return (
                this.username &&
                this.password &&
                this.password === this.passwordConfirm &&
                this.checkPasswordStrength() >= 75 && // Require strong password
                this.firstName &&
                this.lastName &&
                this.captchaToken
            );
        },
    },
};
</script>

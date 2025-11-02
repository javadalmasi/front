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
import { checkPasswordStrength } from "@/utils/Misc.js";

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
                this.passwordStrength >= minPasswordStrength // Lower requirement in development
            );
        },
    },
    mounted() {
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push(import.meta.env.BASE_URL);
        }
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
                  }
                : {
                      phone: this.loginUsername,
                      password: this.loginPassword,
                  };

            this.fetchJson(this.authApiUrl() + "/api/auth/login", null, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            })
                .then(resp => {
                    if (resp.success && resp.data) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data);
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
                  }
                : {
                      phone: this.registerUsername,
                      first_name: this.firstName,
                      last_name: this.lastName,
                      password: this.registerPassword,
                  };

            this.fetchJson(this.authApiUrl() + "/api/auth/register", null, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            })
                .then(resp => {
                    if (resp.success && resp.data) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data);
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
            if (!this.registerPassword) {
                this.passwordStrength = null;
                return;
            }

            const result = checkPasswordStrength(this.registerPassword, this.$i18n);
            this.passwordStrength = result.strength;
            this.passwordStrengthText = result.text;
            this.passwordStrengthClass = result.barClass;
            this.passwordStrengthTextClass = result.textClass;
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

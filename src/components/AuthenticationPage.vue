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
                <form v-if="isLogin" @submit.prevent="login">
                    <div class="mb-4">
                        <input
                            v-model="loginIdentifier"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="text"
                            autocomplete="username"
                            :placeholder="$t('login.email_or_phone')"
                            :aria-label="$t('login.email_or_phone')"
                        />
                    </div>
                    <div class="relative mb-4">
                        <input
                            v-model="loginPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showLoginPassword ? 'text' : 'password'"
                            autocomplete="current-password"
                            :placeholder="$t('login.password')"
                            :aria-label="$t('login.password')"
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
                            type="submit"
                            class="w-full rounded-lg bg-blue-600 py-3 text-white font-bold transition duration-200 hover:bg-blue-700"
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
                <form v-else @submit.prevent="register">
                    <div class="grid grid-cols-2 mb-4 gap-4">
                        <div>
                            <input
                                v-model="firstName"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                type="text"
                                :placeholder="$t('login.first_name')"
                                :aria-label="$t('login.first_name')"
                            />
                        </div>
                        <div>
                            <input
                                v-model="lastName"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                type="text"
                                :placeholder="$t('login.last_name')"
                                :aria-label="$t('login.last_name')"
                            />
                        </div>
                    </div>
                    <div class="mb-4">
                        <input
                            v-model="registerIdentifier"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            type="text"
                            autocomplete="username"
                            :placeholder="$t('login.email_or_phone')"
                            :aria-label="$t('login.email_or_phone')"
                        />
                    </div>
                    <div class="relative mb-4">
                        <input
                            v-model="registerPassword"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            :type="showRegisterPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            :placeholder="$t('login.password')"
                            :aria-label="$t('login.password')"
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
                            autocomplete="new-password"
                            :placeholder="$t('login.password_confirm')"
                            :aria-label="$t('login.password_confirm')"
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
                            type="submit"
                            class="w-full rounded-lg bg-green-600 py-3 text-white font-bold transition duration-200 hover:bg-green-700"
                            :disabled="!isRegisterFormValid"
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
            loginIdentifier: null,
            loginPassword: null,
            showLoginPassword: false,
            registerIdentifier: null,
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
        };
    },
    computed: {
        isRegisterFormValid() {
            return (
                this.firstName &&
                this.lastName &&
                this.registerIdentifier &&
                this.registerPassword &&
                this.registerPassword === this.passwordConfirm &&
                this.passwordStrength >= 40
            );
        },
    },
    mounted() {
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
            if (!this.loginIdentifier || !this.loginPassword) return;

            const loginData = {
                identifier: this.loginIdentifier,
                password: this.loginPassword,
            };

            this.fetchJson(this.userApiUrl() + "/api/auth/login", null, {
                method: "POST",
                body: JSON.stringify(loginData),
            })
                .then(resp => {
                    if (resp.success && resp.data && resp.data.token) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data.token);
                        window.location = import.meta.env.BASE_URL;
                    } else {
                        alert(resp.message || "Login failed");
                    }
                })
                .catch(error => {
                    console.error("Login error:", error);
                    alert("Login failed: " + (error.message || "Unknown error"));
                });
        },
        register() {
            if (!this.isRegisterFormValid) {
                alert(this.$t("login.please_fill_all_fields_correctly"));
                return;
            }

            const registrationData = {
                email: this.registerIdentifier,
                first_name: this.firstName,
                last_name: this.lastName,
                password: this.registerPassword,
            };

            this.fetchJson(this.userApiUrl() + "/api/auth/register", null, {
                method: "POST",
                body: JSON.stringify(registrationData),
            })
                .then(resp => {
                    if (resp.success && resp.data && resp.data.token) {
                        this.setPreference("authToken" + this.hashCode(this.userApiUrl()), resp.data.token);
                        window.location = import.meta.env.BASE_URL;
                    } else {
                        alert(resp.message || "Registration failed");
                    }
                })
                .catch(error => {
                    console.error("Registration error:", error);
                    alert("Registration failed: " + (error.message || "Unknown error"));
                });
        },
        checkPasswordStrength() {
            const strengthResult = checkPasswordStrength(this.registerPassword, this.$i18n);
            this.passwordStrength = strengthResult.strength;
            this.passwordStrengthText = strengthResult.text;
            this.passwordStrengthClass = strengthResult.class;
            this.passwordStrengthTextClass = strengthResult.textClass;
        },
    },
};
</script>

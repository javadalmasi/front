<template>
    <div class="container mx-auto px-4 py-6">
        <h1 class="mb-6 text-2xl font-bold">پروفایل کاربری</h1>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Profile Info Section -->
            <div class="lg:col-span-2">
                <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                    <h2 class="mb-4 text-xl font-bold">اطلاعات پروفایل</h2>

                    <form @submit.prevent="updateProfile">
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >نام</label
                                >
                                <input
                                    v-model="profile.firstName"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    placeholder="نام"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >نام خانوادگی</label
                                >
                                <input
                                    v-model="profile.lastName"
                                    class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    placeholder="نام خانوادگی"
                                />
                            </div>
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
                            <input
                                v-model="profile.email"
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                type="email"
                                placeholder="ایمیل"
                            />
                        </div>

                        <div class="mt-6">
                            <button
                                type="submit"
                                class="rounded-lg bg-blue-600 py-2 px-4 text-white font-bold hover:bg-blue-700 transition duration-200"
                            >
                                به‌روزرسانی پروفایل
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Change Password Section -->
                <div class="mt-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                    <h2 class="mb-4 text-xl font-bold">تغییر رمز عبور</h2>

                    <form @submit.prevent="changePassword">
                        <div class="relative mb-4">
                            <input
                                v-model="passwordForm.currentPassword"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                :type="showCurrentPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                placeholder="رمز عبور فعلی"
                            />
                            <button
                                type="button"
                                class="absolute left-3 top-1/2 transform text-gray-500 -translate-y-1/2 dark:text-gray-400"
                                @click="showCurrentPassword = !showCurrentPassword"
                            >
                                <div :class="showCurrentPassword ? 'i-fa6-solid:eye' : 'i-fa6-solid:eye-slash'" />
                            </button>
                        </div>
                        <div class="relative mb-4">
                            <input
                                v-model="passwordForm.newPassword"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                :type="showNewPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="رمز عبور جدید"
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
                                v-model="passwordForm.confirmNewPassword"
                                class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                :type="showConfirmNewPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="تایید رمز عبور جدید"
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

                        <div class="mt-6">
                            <button
                                type="submit"
                                class="rounded-lg bg-blue-600 py-2 px-4 text-white font-bold hover:bg-blue-700 transition duration-200"
                                :disabled="!isPasswordFormValid"
                            >
                                تغییر رمز عبور
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- User Info Section -->
            <div>
                <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                    <h2 class="mb-4 text-xl font-bold">اطلاعات حساب</h2>

                    <div class="space-y-3">
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">نام کاربری</p>
                            <p class="font-medium">{{ profile.firstName }} {{ profile.lastName }}</p>
                        </div>

                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">ایمیل</p>
                            <p class="font-medium">{{ profile.email || "ثبت نشده" }}</p>
                        </div>

                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">شماره تلفن</p>
                            <p class="font-medium">{{ profile.phone || "ثبت نشده" }}</p>
                        </div>

                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">نقش</p>
                            <p class="font-medium">{{ profile.role === "admin" ? "مدیر" : "کاربر" }}</p>
                        </div>

                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">تاریخ عضویت</p>
                            <p class="font-medium">{{ formatDate(profile.createdAt) }}</p>
                        </div>

                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">وضعیت تأیید</p>
                            <p class="font-medium">{{ profile.isVerified ? "تأیید شده" : "تأیید نشده" }}</p>
                        </div>
                    </div>
                </div>

                <!-- Account Actions -->
                <div class="mt-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
                    <h2 class="mb-4 text-xl font-bold">مدیریت حساب</h2>

                    <div class="space-y-3">
                        <button
                            @click="requestAccountDeletion"
                            class="w-full text-left text-red-600 hover:text-red-800 font-medium"
                        >
                            درخواست حذف حساب
                        </button>

                        <button @click="logout" class="w-full text-left text-red-600 hover:text-red-800 font-medium">
                            خروج از حساب کاربری
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { checkPasswordStrength } from "@/utils/Misc.js";

export default {
    data() {
        return {
            profile: {
                firstName: "",
                lastName: "",
                email: "",
                phone: null,
                role: "user",
                createdAt: null,
                isVerified: false,
            },
            passwordForm: {
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            },
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmNewPassword: false,
            passwordStrength: null,
            passwordStrengthText: "",
            passwordStrengthClass: "",
            passwordStrengthTextClass: "",
        };
    },
    computed: {
        isPasswordFormValid() {
            return (
                this.passwordForm.currentPassword &&
                this.passwordForm.newPassword &&
                this.passwordForm.newPassword === this.passwordForm.confirmNewPassword &&
                this.passwordStrength >= 40
            );
        },
    },
    async mounted() {
        await this.loadUserProfile();
    },
    methods: {
        async loadUserProfile() {
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }

                const response = await this.fetchJson(this.userApiUrl() + "/api/user/profile", null, {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                if (response.success && response.data) {
                    this.profile = {
                        firstName: response.data.first_name,
                        lastName: response.data.last_name,
                        email: response.data.email,
                        phone: response.data.phone,
                        role: response.data.role,
                        createdAt: response.data.created_at,
                        isVerified: response.data.is_verified,
                    };
                } else {
                    alert(response.message || "خطا در بارگذاری اطلاعات پروفایل");
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                alert("خطا در بارگذاری اطلاعات پروفایل: " + error.message);
            }
        },
        async updateProfile() {
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }

                const response = await this.fetchJson(this.userApiUrl() + "/api/user/profile", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({
                        first_name: this.profile.firstName,
                        last_name: this.profile.lastName,
                        email: this.profile.email,
                    }),
                });

                if (response.success) {
                    alert("پروفایل با موفقیت به‌روزرسانی شد");
                } else {
                    alert(response.message || "خطا در به‌روزرسانی پروفایل");
                }
            } catch (error) {
                console.error("Update profile error:", error);
                alert("خطا در به‌روزرسانی پروفایل: " + error.message);
            }
        },
        async changePassword() {
            if (!this.isPasswordFormValid) {
                alert("لطفاً فیلدها را به درستی پر کنید");
                return;
            }

            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }

                const response = await this.fetchJson(this.userApiUrl() + "/api/user/change-password", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({
                        current_password: this.passwordForm.currentPassword,
                        new_password: this.passwordForm.newPassword,
                    }),
                });

                if (response.success) {
                    alert("رمز عبور با موفقیت تغییر یافت");
                    this.passwordForm = {
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                    };
                    this.passwordStrength = null;
                } else {
                    alert(response.message || "خطا در تغییر رمز عبور");
                }
            } catch (error) {
                console.error("Change password error:", error);
                alert("خطا در تغییر رمز عبور: " + error.message);
            }
        },
        async requestAccountDeletion() {
            if (!confirm("آیا مطمئن هستید که می‌خواهید حساب خود را حذف کنید؟ این عملیات غیرقابل بازگشت است.")) {
                return;
            }

            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }

                const response = await this.fetchJson(this.userApiUrl() + "/api/user/account-deletion/request", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({
                        password: prompt("برای تأیید، لطفاً رمز عبور خود را وارد کنید:"),
                    }),
                });

                if (response.success) {
                    alert("درخواست حذف حساب با موفقیت ثبت شد");
                } else {
                    alert(response.message || "خطا در درخواست حذف حساب");
                }
            } catch (error) {
                console.error("Account deletion error:", error);
                alert("خطا در درخواست حذف حساب: " + error.message);
            }
        },
        logout() {
            const userApiUrl = this.userApiUrl();
            this.removePreference("authToken" + this.hashCode(userApiUrl));
            window.location.href = "/";
        },
        formatDate(dateString) {
            if (!dateString) return "";
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("fa-IR").format(date);
        },
        checkPasswordStrength() {
            const result = checkPasswordStrength(this.passwordForm.newPassword, this.$i18n);
            this.passwordStrength = result.strength;
            this.passwordStrengthText = result.text;
            this.passwordStrengthClass = result.class;
            this.passwordStrengthTextClass = result.textClass;
        },
    },
};
</script>

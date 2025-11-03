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

                    <div class="text-center py-4">
                        <p class="mb-4">برای تغییر رمز عبور خود، می‌توانید از قسمت بازنشانی رمز عبور استفاده کنید.</p>
                        <router-link
                            to="/forgot-password"
                            class="rounded-lg bg-blue-600 py-2 px-4 text-white font-bold hover:bg-blue-700 transition duration-200"
                        >
                            بازنشانی رمز عبور
                        </router-link>
                    </div>
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
        };
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
                        currentPassword: this.passwordForm.currentPassword,
                        newPassword: this.passwordForm.newPassword,
                    }),
                });

                if (response.success) {
                    alert("رمز عبور با موفقیت تغییر یافت");
                    // Clear the password fields after successful change
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
            // Clear authentication token
            const userApiUrl = this.userApiUrl();
            this.removePreference("authToken" + this.hashCode(userApiUrl));

            // Redirect to home page
            this.$router.push("/");
        },
        formatDate(dateString) {
            if (!dateString) return "";
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("fa-IR").format(date);
        },
    },
};
</script>

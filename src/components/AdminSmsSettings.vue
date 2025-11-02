<template>
    <div class="admin-sms-settings p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">تنظیمات پیامک</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
                پیکربندی API پیامک ملی و مشاهده اعتبار باقی‌مانده را در اینجا مدیریت کنید.
            </p>
        </div>

        <!-- SMS Settings Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">تنظیمات API پیامک</h2>

            <form @submit.prevent="saveSmsSettings">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> کلید API </label>
                    <input
                        v-model="smsSettings.api_key"
                        type="password"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="کلید API را وارد کنید"
                    />
                </div>

                <div class="flex items-center">
                    <button
                        type="submit"
                        class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                        :disabled="isSavingSms"
                    >
                        {{ isSavingSms ? "در حال ذخیره..." : "ذخیره تنظیمات" }}
                    </button>
                </div>
            </form>
        </div>

        <!-- SMS Credit Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">اعتبار پیامک</h2>

            <div class="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg mb-4">
                <div class="flex items-center">
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ smsCredit }} پیام</div>
                    <button
                        @click="refreshCredit"
                        class="btn bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg ml-4"
                        :disabled="isRefreshingCredit"
                    >
                        {{ isRefreshingCredit ? "در حال بارگیری..." : "بروزرسانی" }}
                    </button>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">تعداد پیامک‌های باقی‌مانده در حساب شما</p>
            </div>

            <div v-if="hasSmsSettings" class="mt-6">
                <h3 class="text-lg font-medium mb-3">ارسال تست پیامک</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            شماره گیرنده
                        </label>
                        <input
                            v-model="testSms.phoneNumber"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="09123456789"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            متن پیام
                        </label>
                        <input
                            v-model="testSms.message"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="متن پیام تست"
                        />
                    </div>
                </div>

                <button
                    @click="sendTestSms"
                    class="btn bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                    :disabled="isSendingTestSms"
                >
                    {{ isSendingTestSms ? "در حال ارسال..." : "ارسال پیامک تست" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminSmsSettings",
    data() {
        return {
            smsSettings: {
                id: null,
                api_key: "",
            },
            smsCredit: 0,
            isSavingSms: false,
            isRefreshingCredit: false,
            isSendingTestSms: false,
            testSms: {
                phoneNumber: "",
                message: "پیام تست از سامانه",
            },
        };
    },
    async mounted() {
        await this.checkAdminAccess();
        await this.loadSettings();
        await this.refreshCredit();
    },
    computed: {
        hasSmsSettings() {
            return this.smsSettings && this.smsSettings.api_key;
        },
    },
    methods: {
        async checkAdminAccess() {
            if (!this.authenticated) {
                this.$router.push("/login");
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/user/profile", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data && response.data.role !== "admin") {
                    this.$router.push("/");
                }
            } catch (error) {
                console.error("Error checking admin access:", error);
                this.$router.push("/login");
            }
        },

        async loadSettings() {
            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/sms-settings", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    this.smsSettings = response.data;
                }
            } catch (error) {
                console.error("Error loading SMS settings:", error);
            }
        },

        async saveSmsSettings() {
            if (!this.smsSettings.api_key) {
                alert("لطفاً کلید API را وارد کنید");
                return;
            }

            this.isSavingSms = true;

            try {
                let url, method;
                if (this.smsSettings.id) {
                    // Update existing settings
                    url = `${this.userApiUrl()}/api/admin/sms-settings/${this.smsSettings.id}`;
                    method = "POST";
                } else {
                    // Create new settings
                    url = `${this.userApiUrl()}/api/admin/sms-settings`;
                    method = "POST";
                }

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                    body: JSON.stringify({
                        api_key: this.smsSettings.api_key,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("تنظیمات پیامک با موفقیت ذخیره شد");
                    // Reload to get the ID if it was created
                    await this.loadSettings();
                } else {
                    alert(result.message || "خطا در ذخیره تنظیمات پیامک");
                }
            } catch (error) {
                console.error("Error saving SMS settings:", error);
                alert("خطا در ذخیره تنظیمات پیامک: " + error.message);
            } finally {
                this.isSavingSms = false;
            }
        },

        async refreshCredit() {
            this.isRefreshingCredit = true;

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/sms-credit", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data !== undefined) {
                    this.smsCredit = response.data;
                } else {
                    alert(response.message || "خطا در دریافت اعتبار پیامک");
                }
            } catch (error) {
                console.error("Error refreshing SMS credit:", error);
                alert("خطا در دریافت اعتبار پیامک: " + error.message);
            } finally {
                this.isRefreshingCredit = false;
            }
        },

        async sendTestSms() {
            if (!this.testSms.phoneNumber) {
                alert("لطفاً شماره گیرنده را وارد کنید");
                return;
            }

            this.isSendingTestSms = true;

            try {
                const response = await fetch(this.userApiUrl() + "/api/admin/test-sms", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                    body: JSON.stringify({
                        recipient: this.testSms.phoneNumber,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("پیامک تست با موفقیت ارسال شد");
                } else {
                    alert(result.message || "خطا در ارسال پیامک تست");
                }
            } catch (error) {
                console.error("Error sending test SMS:", error);
                alert("خطا در ارسال پیامک تست: " + error.message);
            } finally {
                this.isSendingTestSms = false;
            }
        },
    },
};
</script>

<template>
    <div class="admin-backup-management p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">مدیریت پشتیبان‌گیری</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">مدیریت تنظیمات پشتیبان‌گیری و فایل‌های پشتیبان</p>
        </div>

        <!-- S3 Settings Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">تنظیمات S3</h2>

            <div v-if="!s3Settings">
                <p class="mb-4">هیچ تنظیمات S3 تعریف نشده است. لطفاً تنظیمات را وارد کنید:</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >کلید دسترسی (Access Key)</label
                        >
                        <input
                            v-model="newS3Settings.access_key"
                            type="password"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="کلید دسترسی"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >کلید مخفی (Secret Key)</label
                        >
                        <input
                            v-model="newS3Settings.secret_key"
                            type="password"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="کلید مخفی"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام باکت</label>
                        <input
                            v-model="newS3Settings.bucket_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="نام باکت"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">منطقه</label>
                        <input
                            v-model="newS3Settings.region"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="منطقه (مثلاً us-east-1)"
                        />
                    </div>
                </div>

                <button
                    @click="createS3Settings"
                    class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                    ذخیره تنظیمات
                </button>
            </div>

            <div v-else>
                <p class="mb-4">تنظیمات S3 فعلی:</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام باکت</label>
                        <input
                            v-model="s3Settings.bucket_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            readonly
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">منطقه</label>
                        <input
                            v-model="s3Settings.region"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            readonly
                        />
                    </div>
                </div>

                <button
                    @click="updateS3Settings"
                    class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mr-2"
                    :disabled="true"
                >
                    ویرایش تنظیمات (غیرفعال)
                </button>
                <button
                    @click="deleteS3Settings"
                    class="btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                    حذف تنظیمات
                </button>
            </div>
        </div>

        <!-- Backup Operations Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">عملیات پشتیبان‌گیری</h2>

            <div class="flex flex-wrap gap-4">
                <button
                    @click="createBackup"
                    class="btn bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                >
                    ایجاد پشتیبان جدید
                </button>

                <button @click="listBackups" class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                    لیست پشتیبان‌ها
                </button>
            </div>
        </div>

        <!-- Backups List Section -->
        <div v-if="backups.length > 0" class="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 bg-gray-50 dark:bg-dark-700">
                <h2 class="text-lg font-semibold">فایل‌های پشتیبان</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                    <thead class="bg-gray-50 dark:bg-dark-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                نام فایل
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                تاریخ ایجاد
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                اندازه
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                عملیات
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-100">
                        <tr v-for="backup in backups" :key="backup.id">
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ backup.file_name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ timeAgo(backup.created_at) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ formatFileSize(backup.size) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    @click="downloadBackup(backup)"
                                    class="text-blue-600 hover:text-blue-900 ml-4"
                                    title="دانلود"
                                    :disabled="true"
                                >
                                    <i class="i-fa6-solid:download"></i>
                                </button>
                                <button
                                    @click="deleteBackup(backup)"
                                    class="text-red-600 hover:text-red-900"
                                    title="حذف"
                                >
                                    <i class="i-fa6-solid:trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-else-if="loadedBackups" class="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <p>هیچ فایل پشتیبانی وجود ندارد.</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminBackupManagement",
    data() {
        return {
            s3Settings: null,
            newS3Settings: {
                access_key: "",
                secret_key: "",
                bucket_name: "",
                region: "",
            },
            backups: [],
            loadedBackups: false,
        };
    },
    async mounted() {
        await this.checkAdminAccess();
        await this.loadS3Settings();
        await this.listBackups();
    },
    methods: {
        async checkAdminAccess() {
            // Verify that the user is authenticated and has admin role
            if (!this.authenticated) {
                this.$router.push("/login");
                return;
            }

            try {
                // Get the current user profile to verify admin status
                const response = await this.fetchJson(this.userApiUrl() + "/api/user/profile", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    // Check if the user has admin role
                    if (response.data.role !== "admin") {
                        // Redirect to home if not admin
                        this.$router.push("/");
                        return;
                    }
                } else {
                    // If API call fails, redirect to login
                    this.$router.push("/login");
                }
            } catch (error) {
                console.error("Error checking admin access:", error);
                this.$router.push("/login");
            }
        },
        async loadS3Settings() {
            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/backups/s3-settings", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success) {
                    this.s3Settings = response.data;
                } else {
                    console.error("Error loading S3 settings:", response.message || response.error);
                }
            } catch (error) {
                console.error("Error loading S3 settings:", error);
            }
        },
        async createS3Settings() {
            if (
                !this.newS3Settings.access_key ||
                !this.newS3Settings.secret_key ||
                !this.newS3Settings.bucket_name ||
                !this.newS3Settings.region
            ) {
                alert("لطفاً تمامی فیلدها را پر کنید");
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/backups/s3-settings", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                    body: JSON.stringify(this.newS3Settings),
                });

                if (response.success) {
                    alert("تنظیمات S3 با موفقیت ذخیره شد");
                    await this.loadS3Settings();
                    this.newS3Settings = {
                        access_key: "",
                        secret_key: "",
                        bucket_name: "",
                        region: "",
                    };
                } else {
                    alert(response.message || "خطا در ذخیره تنظیمات S3");
                }
            } catch (error) {
                console.error("Error creating S3 settings:", error);
                alert("خطا در ذخیره تنظیمات S3: " + error.message);
            }
        },
        async updateS3Settings() {
            // This is disabled in the UI since we're not implementing it yet
            // In a real implementation, you would have a PUT endpoint to update settings
        },
        async deleteS3Settings() {
            if (!confirm("آیا از حذف تنظیمات S3 اطمینان دارید؟")) {
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/backups/s3-settings", null, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success) {
                    alert("تنظیمات S3 با موفقیت حذف شد");
                    this.s3Settings = null;
                } else {
                    alert(response.message || "خطا در حذف تنظیمات S3");
                }
            } catch (error) {
                console.error("Error deleting S3 settings:", error);
                alert("خطا در حذف تنظیمات S3: " + error.message);
            }
        },
        async createBackup() {
            if (!confirm("آیا از ایجاد پشتیبان جدید اطمینان دارید؟")) {
                return;
            }

            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/backups/create", null, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success) {
                    alert("فرآیند پشتیبان‌گیری آغاز شد");
                    await this.listBackups();
                } else {
                    alert(response.message || "خطا در ایجاد پشتیبان");
                }
            } catch (error) {
                console.error("Error creating backup:", error);
                alert("خطا در ایجاد پشتیبان: " + error.message);
            }
        },
        async listBackups() {
            try {
                // Note: The actual endpoint might be different in the real API
                // This is just a mock implementation based on the API structure
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/backups/list", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    this.backups = response.data;
                } else {
                    console.error("Error loading backups:", response.message || response.error);
                    this.backups = [];
                }

                this.loadedBackups = true;
            } catch (error) {
                console.error("Error loading backups:", error);
                this.backups = [];
                this.loadedBackups = true;
            }
        },
        formatFileSize(size) {
            if (size === undefined || size === null) return "N/A";

            const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "KB", "MB", "GB", "TB"][i];
        },
        async downloadBackup(backup) {
            // Note: Actual download might be different depending on how the API returns backup files
            alert(`دانلود فایل پشتیبان ${backup.file_name} در نسخه بعدی پیاده‌سازی خواهد شد`);
        },
        async deleteBackup(backup) {
            if (!confirm(`آیا از حذف فایل پشتیبان ${backup.file_name} اطمینان دارید؟`)) {
                return;
            }

            try {
                // Note: The actual endpoint might be different in the real API
                const response = await this.fetchJson(
                    this.userApiUrl() + `/api/admin/backups/${backup.id}/delete`,
                    null,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + this.getAuthToken(),
                        },
                    },
                );

                if (response.success) {
                    alert("فایل پشتیبان با موفقیت حذف شد");
                    await this.listBackups();
                } else {
                    alert(response.message || "خطا در حذف فایل پشتیبان");
                }
            } catch (error) {
                console.error("Error deleting backup:", error);
                alert("خطا در حذف فایل پشتیبان: " + error.message);
            }
        },
    },
};
</script>

<style scoped>
.admin-backup-management {
    direction: rtl;
}
</style>

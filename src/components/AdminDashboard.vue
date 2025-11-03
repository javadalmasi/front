<template>
    <div class="admin-dashboard flex h-full min-h-screen">
        <!-- Sidebar -->
        <div
            class="sidebar fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-100 dark:bg-dark-800 border-r border-gray-200 dark:border-dark-100 z-40 transition-all duration-300"
            :class="{ 'w-20': isSidebarMinimized }"
        >
            <div class="p-4 border-b border-gray-200 dark:border-dark-100">
                <h2 class="text-xl font-bold text-center" :class="{ hidden: isSidebarMinimized }">داشبورد ادمین</h2>
            </div>

            <nav class="mt-4">
                <router-link
                    v-for="item in menuItems"
                    :key="item.name"
                    :to="item.route"
                    class="flex items-center p-3 hover:bg-gray-200 dark:hover:bg-dark-700 rounded-lg mx-2 mb-1 transition-colors duration-200"
                    active-class="bg-blue-600 text-white"
                >
                    <div :class="item.icon" class="w-6 h-6 mr-3"></div>
                    <span class="text-base font-medium" :class="{ hidden: isSidebarMinimized }">
                        {{ item.name }}
                    </span>
                </router-link>
            </nav>

            <div class="absolute bottom-4 left-4 right-4">
                <button
                    @click="toggleSidebar"
                    class="w-full py-2 bg-gray-200 dark:bg-dark-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200"
                >
                    <span v-if="!isSidebarMinimized">کوچک کردن منو</span>
                    <span v-else class="block">☰</span>
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content flex-1 ml-64 p-8" :class="{ 'ml-20': isSidebarMinimized }">
            <div class="mb-6 flex justify-between items-center">
                <h1 class="text-2xl font-bold">داشبورد ادمین</h1>
                <div class="flex items-center">
                    <span class="ml-4">خوش آمدید، {{ user?.first_name || "ادمین" }}!</span>
                    <button @click="logout" class="btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">
                        خروج
                    </button>
                </div>
            </div>

            <div class="mb-6 p-4 bg-white dark:bg-dark-800 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">آمار سیستم</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کل کاربران</div>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div class="text-2xl font-bold">{{ stats.activeUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کاربران فعال</div>
                    </div>
                    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <div class="text-2xl font-bold">{{ stats.adminUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کاربران ادمین</div>
                    </div>
                    <div class="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <div class="text-2xl font-bold">{{ stats.todayRegistrations }}</div>
                        <div class="text-gray-600 dark:text-gray-400">ثبت نام امروز</div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">آخرین فعالیت ها</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                        <thead class="bg-gray-50 dark:bg-dark-700">
                            <tr>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    کاربر
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    فعالیت
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    زمان
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-100">
                            <tr v-for="activity in recentActivities" :key="activity.id">
                                <td class="px-6 py-4 whitespace-nowrap">{{ activity.user }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{{ activity.action }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{{ timeAgo(activity.timestamp) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminDashboard",
    data() {
        return {
            isSidebarMinimized: false,
            user: null,
            stats: {
                totalUsers: 0,
                activeUsers: 0,
                adminUsers: 0,
                todayRegistrations: 0,
            },
            recentActivities: [],
            menuItems: [
                {
                    name: "داشبورد",
                    route: "/admin",
                    icon: "i-fa6-solid:dashboard",
                },
                {
                    name: "مدیریت کاربران",
                    route: "/admin/users",
                    icon: "i-fa6-solid:users",
                },
                {
                    name: "درخواست‌های حذف حساب",
                    route: "/admin/account-deletion",
                    icon: "i-fa6-solid:trash",
                },
                {
                    name: "پشتیبان‌گیری",
                    route: "/admin/backups",
                    icon: "i-fa6-solid:database",
                },
                {
                    name: "تنظیمات ایمیل",
                    route: "/admin/email-settings",
                    icon: "i-fa6-solid:envelope",
                },
                {
                    name: "تنظیمات پیامک",
                    route: "/admin/sms-settings",
                    icon: "i-fa6-solid:sms",
                },
            ],
        };
    },
    async mounted() {
        await this.checkAdminAccess();
        await this.loadDashboardData();
    },
    methods: {
        async checkAdminAccess() {
            // This is now handled by the global navigation guard in router.js
            // However, we still need to fetch user data for the welcome message
            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/user/profile", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    this.user = response.data;
                } else {
                    this.$router.push("/auth");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                this.$router.push("/auth");
            }
        },
        async loadDashboardData() {
            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/dashboard", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    this.stats = response.data.stats;
                    this.recentActivities = response.data.recent_activities;
                } else {
                    alert(response.message || "Failed to load dashboard data.");
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                alert("An error occurred while loading dashboard data.");
            }
        },
        toggleSidebar() {
            this.isSidebarMinimized = !this.isSidebarMinimized;
        },
        logout() {
            const userApiUrl = this.userApiUrl();
            this.removePreference("authToken" + this.hashCode(userApiUrl));
            this.$router.push("/");
        },
    },
};
</script>

<style scoped>
.admin-dashboard {
    direction: rtl;
}
</style>

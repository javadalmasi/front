<template>
    <div class="admin-dashboard h-full min-h-screen flex">
        <!-- Sidebar -->
        <div
            class="sidebar fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-gray-100 transition-all duration-300 dark:border-dark-100 dark:bg-dark-800"
            :class="{ 'w-20': isSidebarMinimized }"
        >
            <div class="border-b border-gray-200 p-4 dark:border-dark-100">
                <h2 class="text-center text-xl font-bold" :class="{ hidden: isSidebarMinimized }">داشبورد ادمین</h2>
            </div>

            <nav class="mt-4">
                <router-link
                    v-for="item in menuItems"
                    :key="item.name"
                    :to="item.route"
                    class="mx-2 mb-1 flex items-center rounded-lg p-3 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-dark-700"
                    active-class="bg-blue-600 text-white"
                >
                    <div :class="item.icon" class="mr-3 h-6 w-6"></div>
                    <span class="text-base font-medium" :class="{ hidden: isSidebarMinimized }">
                        {{ item.name }}
                    </span>
                </router-link>
            </nav>

            <div class="absolute bottom-4 left-4 right-4">
                <button
                    class="w-full rounded-lg bg-gray-200 py-2 text-gray-700 transition-colors duration-200 dark:bg-dark-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-dark-600"
                    @click="toggleSidebar"
                >
                    <span v-if="!isSidebarMinimized">کوچک کردن منو</span>
                    <span v-else class="block">☰</span>
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content ml-64 flex-1 p-8" :class="{ 'ml-20': isSidebarMinimized }">
            <div class="mb-6 flex items-center justify-between">
                <h1 class="text-2xl font-bold">داشبورد ادمین</h1>
                <div class="flex items-center">
                    <span class="ml-4">خوش آمدید، {{ user?.first_name || "ادمین" }}!</span>
                    <button class="btn rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700" @click="logout">
                        خروج
                    </button>
                </div>
            </div>

            <div class="mb-6 rounded-lg bg-white p-4 shadow dark:bg-dark-800">
                <h2 class="mb-4 text-xl font-semibold">آمار سیستم</h2>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                        <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کل کاربران</div>
                    </div>
                    <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                        <div class="text-2xl font-bold">{{ stats.activeUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کاربران فعال</div>
                    </div>
                    <div class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
                        <div class="text-2xl font-bold">{{ stats.adminUsers }}</div>
                        <div class="text-gray-600 dark:text-gray-400">کاربران ادمین</div>
                    </div>
                    <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
                        <div class="text-2xl font-bold">{{ stats.todayRegistrations }}</div>
                        <div class="text-gray-600 dark:text-gray-400">ثبت نام امروز</div>
                    </div>
                </div>
            </div>

            <div class="rounded-lg bg-white p-6 shadow dark:bg-dark-800">
                <h2 class="mb-4 text-xl font-semibold">آخرین فعالیت ها</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                        <thead class="bg-gray-50 dark:bg-dark-700">
                            <tr>
                                <th
                                    class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                                >
                                    کاربر
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                                >
                                    فعالیت
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                                >
                                    زمان
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 dark:bg-dark-800 dark:divide-dark-100">
                            <tr v-for="activity in recentActivities" :key="activity.id">
                                <td class="whitespace-nowrap px-6 py-4">{{ activity.user }}</td>
                                <td class="whitespace-nowrap px-6 py-4">{{ activity.action }}</td>
                                <td class="whitespace-nowrap px-6 py-4">{{ timeAgo(activity.timestamp) }}</td>
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

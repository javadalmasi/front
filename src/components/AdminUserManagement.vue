<template>
    <div class="admin-user-management p-6">
        <div class="mb-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold">مدیریت کاربران</h1>
            <button
                @click="showCreateUserModal = true"
                class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
                ایجاد کاربر جدید
            </button>
        </div>

        <!-- Search and Filter Controls -->
        <div class="mb-6 p-4 bg-white dark:bg-dark-800 rounded-lg shadow">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جستجو</label>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="جستجوی نام، ایمیل، یا شماره تلفن..."
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        @input="debouncedSearch"
                    />
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                    <thead class="bg-gray-50 dark:bg-dark-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                نام
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                ایمیل
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                تلفن
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                نقش
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                وضعیت
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                تاریخ عضویت
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                عملیات
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-100">
                        <tr v-for="user in users" :key="user.id">
                            <td class="px-6 py-4 whitespace-nowrap">{{ user.first_name }} {{ user.last_name }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ user.email || "-" }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ user.phone || "-" }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span
                                    :class="{
                                        'bg-blue-100 text-blue-800': user.role === 'admin',
                                        'bg-green-100 text-green-800': user.role === 'user',
                                    }"
                                    class="px-2 py-1 text-xs rounded-full"
                                >
                                    {{ user.role === "admin" ? "ادمین" : "کاربر" }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span
                                    :class="{
                                        'bg-green-100 text-green-800': user.is_active,
                                        'bg-red-100 text-red-800': !user.is_active,
                                    }"
                                    class="px-2 py-1 text-xs rounded-full"
                                >
                                    {{ user.is_active ? "فعال" : "غیرفعال" }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ timeAgo(user.created_at) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    @click="editUser(user)"
                                    class="text-blue-600 hover:text-blue-900 ml-4"
                                    title="ویرایش"
                                >
                                    <i class="i-fa6-solid:pencil"></i>
                                </button>
                                <button
                                    @click="deleteUser(user.id)"
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

            <!-- Pagination -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-dark-700 flex items-center justify-between">
                <div class="text-sm text-gray-700 dark:text-gray-300">نمایش {{ users.length }} از {{ totalUsers }}</div>
                <div class="flex space-x-2">
                    <button
                        @click="previousPage"
                        :disabled="currentPage === 1"
                        class="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-md text-sm font-medium"
                        :class="{
                            'bg-gray-200 dark:bg-dark-600': currentPage === 1,
                            'hover:bg-gray-100 dark:hover:bg-dark-600': currentPage !== 1,
                        }"
                    >
                        قبلی
                    </button>
                    <span class="px-4 py-2 text-sm font-medium"> {{ currentPage }} از {{ totalPages }} </span>
                    <button
                        @click="nextPage"
                        :disabled="currentPage === totalPages"
                        class="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-md text-sm font-medium"
                        :class="{
                            'bg-gray-200 dark:bg-dark-600': currentPage === totalPages,
                            'hover:bg-gray-100 dark:hover:bg-dark-600': currentPage !== totalPages,
                        }"
                    >
                        بعدی
                    </button>
                </div>
            </div>
        </div>

        <!-- Create User Modal -->
        <div v-if="showCreateUserModal" class="modal">
            <div class="modal-container bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">ایجاد کاربر جدید</h3>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام</label>
                        <input
                            v-model="newUser.first_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >نام خانوادگی</label
                        >
                        <input
                            v-model="newUser.last_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
                    <input
                        v-model="newUser.email"
                        type="email"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تلفن</label>
                    <input
                        v-model="newUser.phone"
                        type="tel"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور</label>
                    <input
                        v-model="newUser.password"
                        type="password"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نقش</label>
                    <select
                        v-model="newUser.role"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">کاربر</option>
                        <option value="admin">ادمین</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        @click="showCreateUserModal = false"
                        class="btn bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                    >
                        لغو
                    </button>
                    <button
                        @click="createNewUser"
                        class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                        ایجاد
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditUserModal" class="modal">
            <div class="modal-container bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">ویرایش کاربر</h3>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام</label>
                        <input
                            v-model="editUserForm.first_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >نام خانوادگی</label
                        >
                        <input
                            v-model="editUserForm.last_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
                    <input
                        v-model="editUserForm.email"
                        type="email"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تلفن</label>
                    <input
                        v-model="editUserForm.phone"
                        type="tel"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نقش</label>
                    <select
                        v-model="editUserForm.role"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">کاربر</option>
                        <option value="admin">ادمین</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="flex items-center">
                        <input
                            v-model="editUserForm.is_active"
                            type="checkbox"
                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-dark-700"
                        />
                        <span class="mr-2 text-sm text-gray-700 dark:text-gray-300">فعال</span>
                    </label>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        @click="showEditUserModal = false"
                        class="btn bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                    >
                        لغو
                    </button>
                    <button
                        @click="updateUser"
                        class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                        به‌روزرسانی
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminUserManagement",
    data() {
        return {
            users: [],
            totalUsers: 0,
            currentPage: 1,
            totalPages: 1,
            searchQuery: "",
            showCreateUserModal: false,
            showEditUserModal: false,
            newUser: {
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                password: "",
                role: "user",
            },
            editUserForm: {
                id: "",
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                role: "user",
                is_active: true,
            },
            debouncedSearchTimer: null,
        };
    },
    async mounted() {
        await this.loadUsers();
    },
    methods: {
        async loadUsers() {
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }
                const response = await this.fetchJson(
                    `${this.userApiUrl()}/api/admin/users?page=${this.currentPage}&limit=10&query=${
                        this.searchQuery
                    }`,
                    null,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.success && response.data) {
                    this.users = response.data.users;
                    this.totalUsers = response.data.total;
                    this.totalPages = Math.ceil(this.totalUsers / 10);
                } else {
                    alert("Error loading users: " + response.message);
                }
            } catch (error) {
                console.error("Error loading users:", error);
                alert("An error occurred while loading users.");
            }
        },
        debouncedSearch() {
            if (this.debouncedSearchTimer) {
                clearTimeout(this.debouncedSearchTimer);
            }
            this.debouncedSearchTimer = setTimeout(() => {
                this.currentPage = 1;
                this.loadUsers();
            }, 500);
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadUsers();
            }
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadUsers();
            }
        },
        editUser(user) {
            this.editUserForm = { ...user };
            this.showEditUserModal = true;
        },
        async updateUser() {
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }
                const result = await this.fetchJson(
                    `${this.userApiUrl()}/api/admin/users/${this.editUserForm.id}`,
                    null,
                    {
                        method: "POST",
                        body: JSON.stringify(this.editUserForm),
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (result.success) {
                    this.showEditUserModal = false;
                    await this.loadUsers();
                    alert("کاربر با موفقیت به‌روزرسانی شد");
                } else {
                    alert("Error updating user: " + result.message);
                }
            } catch (error) {
                console.error("Error updating user:", error);
                alert("An error occurred while updating the user.");
            }
        },
        async deleteUser(userId) {
            if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
                return;
            }
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }
                const result = await this.fetchJson(`${this.userApiUrl()}/api/admin/users/${userId}`, null, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (result.success) {
                    await this.loadUsers();
                    alert("کاربر با موفقیت حذف شد");
                } else {
                    alert("Error deleting user: " + result.message);
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("An error occurred while deleting the user.");
            }
        },
        async createNewUser() {
            try {
                const token = this.getAuthToken();
                if (!token) {
                    this.$router.push("/auth");
                    return;
                }
                const result = await this.fetchJson(`${this.userApiUrl()}/api/admin/users`, null, {
                    method: "POST",
                    body: JSON.stringify(this.newUser),
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (result.success) {
                    this.showCreateUserModal = false;
                    this.newUser = {
                        first_name: "",
                        last_name: "",
                        email: "",
                        phone: "",
                        password: "",
                        role: "user",
                    };
                    await this.loadUsers();
                    alert("کاربر جدید با موفقیت ایجاد شد");
                } else {
                    alert("Error creating user: " + result.message);
                }
            } catch (error) {
                console.error("Error creating user:", error);
                alert("An error occurred while creating the user.");
            }
        },
    },
};
</script>

<style scoped>
.admin-user-management {
    direction: rtl;
}
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-container {
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
}
</style>

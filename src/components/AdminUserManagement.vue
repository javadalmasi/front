<template>
    <div class="admin-user-management p-6">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold">مدیریت کاربران</h1>
            <button
                class="btn rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="showCreateUserModal = true"
            >
                ایجاد کاربر جدید
            </button>
        </div>

        <!-- Search and Filter Controls -->
        <div class="mb-6 rounded-lg bg-white p-4 shadow dark:bg-dark-800">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">جستجو</label>
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
        <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-dark-800">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                    <thead class="bg-gray-50 dark:bg-dark-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                نام
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                ایمیل
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                تلفن
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                نقش
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                وضعیت
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                تاریخ عضویت
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs text-gray-500 font-medium tracking-wider uppercase dark:text-gray-300"
                            >
                                عملیات
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200 dark:bg-dark-800 dark:divide-dark-100">
                        <tr v-for="user in users" :key="user.id">
                            <td class="whitespace-nowrap px-6 py-4">{{ user.first_name }} {{ user.last_name }}</td>
                            <td class="whitespace-nowrap px-6 py-4">
                                {{ user.email || "-" }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4">
                                {{ user.phone || "-" }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4">
                                <span
                                    :class="{
                                        'bg-blue-100 text-blue-800': user.role === 'admin',
                                        'bg-green-100 text-green-800': user.role === 'user',
                                    }"
                                    class="rounded-full px-2 py-1 text-xs"
                                >
                                    {{ user.role === "admin" ? "ادمین" : "کاربر" }}
                                </span>
                            </td>
                            <td class="whitespace-nowrap px-6 py-4">
                                <span
                                    :class="{
                                        'bg-green-100 text-green-800': user.is_active,
                                        'bg-red-100 text-red-800': !user.is_active,
                                    }"
                                    class="rounded-full px-2 py-1 text-xs"
                                >
                                    {{ user.is_active ? "فعال" : "غیرفعال" }}
                                </span>
                            </td>
                            <td class="whitespace-nowrap px-6 py-4">
                                {{ timeAgo(user.created_at) }}
                            </td>
                            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                <button
                                    class="ml-4 text-blue-600 hover:text-blue-900"
                                    title="ویرایش"
                                    @click="editUser(user)"
                                >
                                    <i class="i-fa6-solid:pencil"></i>
                                </button>
                                <button
                                    class="text-red-600 hover:text-red-900"
                                    title="حذف"
                                    @click="deleteUser(user.id)"
                                >
                                    <i class="i-fa6-solid:trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between bg-gray-50 px-6 py-4 dark:bg-dark-700">
                <div class="text-sm text-gray-700 dark:text-gray-300">نمایش {{ users.length }} از {{ totalUsers }}</div>
                <div class="flex space-x-2">
                    <button
                        :disabled="currentPage === 1"
                        class="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium dark:border-dark-400"
                        :class="{
                            'bg-gray-200 dark:bg-dark-600': currentPage === 1,
                            'hover:bg-gray-100 dark:hover:bg-dark-600': currentPage !== 1,
                        }"
                        @click="previousPage"
                    >
                        قبلی
                    </button>
                    <span class="px-4 py-2 text-sm font-medium"> {{ currentPage }} از {{ totalPages }} </span>
                    <button
                        :disabled="currentPage === totalPages"
                        class="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium dark:border-dark-400"
                        :class="{
                            'bg-gray-200 dark:bg-dark-600': currentPage === totalPages,
                            'hover:bg-gray-100 dark:hover:bg-dark-600': currentPage !== totalPages,
                        }"
                        @click="nextPage"
                    >
                        بعدی
                    </button>
                </div>
            </div>
        </div>

        <!-- Create User Modal -->
        <div v-if="showCreateUserModal" class="modal">
            <div class="modal-container max-w-md w-full rounded-lg bg-white p-6 shadow-xl dark:bg-dark-800">
                <h3 class="mb-4 text-lg font-semibold">ایجاد کاربر جدید</h3>

                <div class="grid grid-cols-2 mb-4 gap-4">
                    <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">نام</label>
                        <input
                            v-model="newUser.first_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300"
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
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">ایمیل</label>
                    <input
                        v-model="newUser.email"
                        type="email"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">تلفن</label>
                    <input
                        v-model="newUser.phone"
                        type="tel"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">رمز عبور</label>
                    <input
                        v-model="newUser.password"
                        type="password"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-6">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">نقش</label>
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
                        class="btn rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        @click="showCreateUserModal = false"
                    >
                        لغو
                    </button>
                    <button
                        class="btn rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        @click="createNewUser"
                    >
                        ایجاد
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit User Modal -->
        <div v-if="showEditUserModal" class="modal">
            <div class="modal-container max-w-md w-full rounded-lg bg-white p-6 shadow-xl dark:bg-dark-800">
                <h3 class="mb-4 text-lg font-semibold">ویرایش کاربر</h3>

                <div class="grid grid-cols-2 mb-4 gap-4">
                    <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">نام</label>
                        <input
                            v-model="editUserForm.first_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300"
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
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">ایمیل</label>
                    <input
                        v-model="editUserForm.email"
                        type="email"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-4">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">تلفن</label>
                    <input
                        v-model="editUserForm.phone"
                        type="tel"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="mb-6">
                    <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">نقش</label>
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
                            class="border-gray-300 rounded text-blue-600 shadow-sm focus:border-blue-300 dark:bg-dark-700 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span class="mr-2 text-sm text-gray-700 dark:text-gray-300">فعال</span>
                    </label>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        class="btn rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        @click="showEditUserModal = false"
                    >
                        لغو
                    </button>
                    <button
                        class="btn rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        @click="updateUser"
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

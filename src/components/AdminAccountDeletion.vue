<template>
    <div class="admin-account-deletion p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">مدیریت درخواست‌های حذف حساب</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">مدیریت درخواست‌های حذف حساب کاربران</p>
        </div>

        <!-- Pending Deletion Requests Table -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 bg-gray-50 dark:bg-dark-700 flex justify-between items-center">
                <h2 class="text-lg font-semibold">درخواست‌های حذف حساب در انتظار</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
                    <thead class="bg-gray-50 dark:bg-dark-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                نام کاربر
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                ایمیل
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                تاریخ درخواست
                            </th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                عملیات
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-100">
                        <tr v-for="request in deletionRequests" :key="request.id">
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ request.first_name }} {{ request.last_name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ request.email }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {{ timeAgo(request.requested_at) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    @click="approveDeletion(request)"
                                    class="text-green-600 hover:text-green-900 ml-4"
                                    title="تایید"
                                >
                                    <i class="i-fa6-solid:check"></i>
                                </button>
                                <button
                                    @click="showRejectionModal(request)"
                                    class="text-red-600 hover:text-red-900"
                                    title="رد"
                                >
                                    <i class="i-fa6-solid:xmark"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Rejection Modal -->
        <div v-if="showRejectionModalFlag" class="modal">
            <div class="modal-container bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 class="text-lg font-semibold mb-4">رد درخواست حذف حساب</h3>

                <p class="mb-4">
                    برای رد درخواست حذف حساب کاربر
                    <strong>{{ rejectionRequest?.first_name }} {{ rejectionRequest?.last_name }}</strong
                    >، دلیل رد را وارد کنید:
                </p>

                <div class="mb-4">
                    <textarea
                        v-model="rejectionReason"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="دلیل رد درخواست..."
                    ></textarea>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        @click="cancelRejection"
                        class="btn bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                    >
                        لغو
                    </button>
                    <button
                        @click="rejectDeletion"
                        class="btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                    >
                        رد درخواست
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminAccountDeletion",
    data() {
        return {
            deletionRequests: [],
            showRejectionModalFlag: false,
            rejectionRequest: null,
            rejectionReason: "",
        };
    },
    async mounted() {
        await this.checkAdminAccess();
        await this.loadDeletionRequests();
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
        async loadDeletionRequests() {
            try {
                const response = await this.fetchJson(this.userApiUrl() + "/api/admin/account-deletion/pending", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (response.success && response.data) {
                    this.deletionRequests = response.data;
                } else {
                    console.error("Error loading deletion requests:", response.message || response.error);
                    this.deletionRequests = [];
                }
            } catch (error) {
                console.error("Error loading deletion requests:", error);
                this.deletionRequests = [];
            }
        },
        async approveDeletion(request) {
            if (!confirm(`آیا از تایید درخواست حذف حساب ${request.first_name} ${request.last_name} اطمینان دارید؟`)) {
                return;
            }

            try {
                const response = await this.fetchJson(
                    this.userApiUrl() + `/api/admin/account-deletion/${request.id}/approve`,
                    null,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + this.getAuthToken(),
                        },
                    },
                );

                if (response.success) {
                    // Remove the request from the list
                    this.deletionRequests = this.deletionRequests.filter(r => r.id !== request.id);
                    alert("درخواست حذف حساب تایید شد");
                } else {
                    alert(response.message || "خطا در تایید درخواست حذف حساب");
                }
            } catch (error) {
                console.error("Error approving deletion:", error);
                alert("خطا در تایید درخواست حذف حساب: " + error.message);
            }
        },
        showRejectionModal(request) {
            this.rejectionRequest = request;
            this.showRejectionModalFlag = true;
        },
        cancelRejection() {
            this.showRejectionModalFlag = false;
            this.rejectionRequest = null;
            this.rejectionReason = "";
        },
        async rejectDeletion() {
            if (!this.rejectionReason.trim()) {
                alert("لطفاً دلیل رد درخواست را وارد کنید");
                return;
            }

            if (
                !confirm(
                    `آیا از رد درخواست حذف حساب ${this.rejectionRequest.first_name} ${this.rejectionRequest.last_name} اطمینان دارید؟`,
                )
            ) {
                return;
            }

            try {
                const response = await this.fetchJson(
                    this.userApiUrl() + `/api/admin/account-deletion/${this.rejectionRequest.id}/reject`,
                    null,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + this.getAuthToken(),
                        },
                        body: JSON.stringify({
                            reason: this.rejectionReason,
                        }),
                    },
                );

                if (response.success) {
                    // Remove the request from the list
                    this.deletionRequests = this.deletionRequests.filter(r => r.id !== this.rejectionRequest.id);
                    this.cancelRejection();
                    alert("درخواست حذف حساب رد شد");
                } else {
                    alert(response.message || "خطا در رد درخواست حذف حساب");
                }
            } catch (error) {
                console.error("Error rejecting deletion:", error);
                alert("خطا در رد درخواست حذف حساب: " + error.message);
            }
        },
    },
};
</script>

<style scoped>
.admin-account-deletion {
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

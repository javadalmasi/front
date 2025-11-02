<template>
    <div class="admin-email-settings p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">تنظیمات ایمیل</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">پیکربندی SMTP و قالب‌های ایمیل را در اینجا مدیریت کنید.</p>
        </div>

        <!-- SMTP Settings Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">تنظیمات SMTP</h2>

            <form @submit.prevent="saveSmtpSettings">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SMTP Host
                        </label>
                        <input
                            v-model="smtpSettings.host"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            SMTP Port
                        </label>
                        <input
                            v-model="smtpSettings.port"
                            type="number"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="587"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            نام کاربری
                        </label>
                        <input
                            v-model="smtpSettings.username"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="username@example.com"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> گذرواژه </label>
                        <input
                            v-model="smtpSettings.password"
                            type="password"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            نام فرستنده
                        </label>
                        <input
                            v-model="smtpSettings.sender_name"
                            type="text"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="نام سایت"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ایمیل فرستنده
                        </label>
                        <input
                            v-model="smtpSettings.sender_email"
                            type="email"
                            class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="noreply@example.com"
                        />
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <button
                        type="submit"
                        class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                        :disabled="isSavingSmtp"
                    >
                        {{ isSavingSmtp ? "در حال ذخیره..." : "ذخیره تنظیمات SMTP" }}
                    </button>

                    <button
                        @click="testSmtpSettings"
                        type="button"
                        class="btn bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                        :disabled="isTestingSmtp"
                    >
                        {{ isTestingSmtp ? "در حال تست..." : "تست اتصال SMTP" }}
                    </button>
                </div>
            </form>
        </div>

        <!-- Email Templates Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">قالب‌های ایمیل</h2>

            <div class="mb-6 flex justify-between items-center">
                <div class="flex space-x-2">
                    <button
                        v-for="template in emailTemplates"
                        :key="template.id"
                        @click="selectTemplate(template)"
                        :class="{
                            'bg-blue-600 text-white': selectedTemplate?.id === template.id,
                            'bg-gray-200 dark:bg-dark-700': selectedTemplate?.id !== template.id,
                        }"
                        class="px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        {{ getTemplateName(template.name) }}
                    </button>
                </div>

                <button
                    @click="saveTemplate"
                    class="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    :disabled="!selectedTemplate || isSavingTemplate"
                >
                    {{ isSavingTemplate ? "در حال ذخیره..." : "ذخیره قالب" }}
                </button>
            </div>

            <div v-if="selectedTemplate" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> عنوان </label>
                    <input
                        v-model="selectedTemplate.subject"
                        type="text"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="عنوان ایمیل"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        متن ایمیل
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                            (از متغیرهایی مانند {{ user.first_name }}, {{ reset_link }}, {{ otp_code }} پشتیبانی می‌کند)
                        </span>
                    </label>
                    <textarea
                        v-model="selectedTemplate.body"
                        rows="10"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3 dark:border-dark-400 focus:border-blue-500 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="متن قالب ایمیل (HTML پشتیبانی می‌شود)"
                    ></textarea>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                یک قالب را انتخاب کنید تا ویرایش کنید
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminEmailSettings",
    data() {
        return {
            smtpSettings: {
                host: "",
                port: 587,
                username: "",
                password: "",
                sender_name: "",
                sender_email: "",
            },
            emailTemplates: [],
            selectedTemplate: null,
            isSavingSmtp: false,
            isTestingSmtp: false,
            isSavingTemplate: false,
            testEmailRecipient: "",
        };
    },
    async mounted() {
        await this.checkAdminAccess();
        await this.loadSettings();
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
            // Load SMTP settings
            try {
                const smtpResponse = await this.fetchJson(this.userApiUrl() + "/api/admin/smtp-settings", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (smtpResponse.success && smtpResponse.data) {
                    this.smtpSettings = smtpResponse.data;
                }
            } catch (error) {
                console.error("Error loading SMTP settings:", error);
            }

            // Load email templates
            try {
                const templatesResponse = await this.fetchJson(this.userApiUrl() + "/api/admin/email-templates", null, {
                    headers: {
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                });

                if (templatesResponse.success && templatesResponse.data) {
                    this.emailTemplates = templatesResponse.data;

                    if (this.emailTemplates.length > 0) {
                        this.selectedTemplate = { ...this.emailTemplates[0] };
                    }
                }
            } catch (error) {
                console.error("Error loading email templates:", error);
            }
        },

        async saveSmtpSettings() {
            this.isSavingSmtp = true;

            try {
                // Determine if we need to create or update based on whether we have an ID
                let url, method;
                if (this.smtpSettings.id) {
                    // Update existing settings
                    url = `${this.userApiUrl()}/api/admin/smtp-settings/${this.smtpSettings.id}`;
                    method = "POST";
                } else {
                    // Create new settings
                    url = `${this.userApiUrl()}/api/admin/smtp-settings`;
                    method = "POST";
                }

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                    body: JSON.stringify({
                        host: this.smtpSettings.host,
                        port: parseInt(this.smtpSettings.port),
                        username: this.smtpSettings.username,
                        password: this.smtpSettings.password,
                        sender_name: this.smtpSettings.sender_name,
                        sender_email: this.smtpSettings.sender_email,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("تنظیمات SMTP با موفقیت ذخیره شد");
                    // Reload to get the ID if it was created
                    await this.loadSettings();
                } else {
                    alert(result.message || "خطا در ذخیره تنظیمات SMTP");
                }
            } catch (error) {
                console.error("Error saving SMTP settings:", error);
                alert("خطا در ذخیره تنظیمات SMTP: " + error.message);
            } finally {
                this.isSavingSmtp = false;
            }
        },

        async testSmtpSettings() {
            this.isTestingSmtp = true;

            try {
                // Ask for test email recipient
                const recipient = prompt("آدرس ایمیل گیرنده تست را وارد کنید:", this.smtpSettings.sender_email || "");
                if (!recipient) {
                    this.isTestingSmtp = false;
                    return;
                }

                const response = await fetch(this.userApiUrl() + "/api/admin/test-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.getAuthToken(),
                    },
                    body: JSON.stringify({
                        recipient: recipient,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("تست ایمیل با موفقیت ارسال شد");
                } else {
                    alert(result.message || "خطا در ارسال ایمیل تست");
                }
            } catch (error) {
                console.error("Error testing SMTP settings:", error);
                alert("خطا در تست اتصال SMTP: " + error.message);
            } finally {
                this.isTestingSmtp = false;
            }
        },

        selectTemplate(template) {
            this.selectedTemplate = { ...template };
        },

        async saveTemplate() {
            if (!this.selectedTemplate) return;

            this.isSavingTemplate = true;

            try {
                const response = await fetch(
                    this.userApiUrl() + `/api/admin/email-templates/${this.selectedTemplate.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + this.getAuthToken(),
                        },
                        body: JSON.stringify({
                            name: this.selectedTemplate.name,
                            subject: this.selectedTemplate.subject,
                            body: this.selectedTemplate.body,
                        }),
                    },
                );

                const result = await response.json();

                if (result.success) {
                    alert("قالب ایمیل با موفقیت ذخیره شد");
                    // Update the template in the list
                    const index = this.emailTemplates.findIndex(t => t.id === this.selectedTemplate.id);
                    if (index !== -1) {
                        this.emailTemplates[index] = { ...this.selectedTemplate };
                    }
                } else {
                    alert(result.message || "خطا در ذخیره قالب ایمیل");
                }
            } catch (error) {
                console.error("Error saving template:", error);
                alert("خطا در ذخیره قالب ایمیل: " + error.message);
            } finally {
                this.isSavingTemplate = false;
            }
        },

        getTemplateName(name) {
            const names = {
                register_confirmation: "تایید ثبت نام",
                password_reset: "بازنشانی گذرواژه",
                otp_verification: "تایید کد یکبار مصرف",
            };

            return names[name] || name;
        },
    },
};
</script>

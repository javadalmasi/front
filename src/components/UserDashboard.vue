<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center" v-t="'titles.user_dashboard'">داشبورد کاربر</h1>

    <!-- Quick Access Shortcuts -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
      <router-link
        to="/user/gust/subscriptions"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:rss text-2xl block text-blue-500 mb-2"></i>
        <span class="block" v-t="'titles.subscriptions'">اشتراک‌ها</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ subscriptionCount }}</span>
      </router-link>

      <router-link
        to="/user/gust/history"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:clock-rotate-left text-2xl block text-green-500 mb-2"></i>
        <span class="block" v-t="'titles.history'">تاریخچه</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ historyCount }}</span>
      </router-link>

      <router-link
        to="/user/gust/likes"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:thumbs-up text-2xl block text-indigo-500 mb-2"></i>
        <span class="block" v-t="'actions.likes'">پسندیده‌ها</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ likesCount }}</span>
      </router-link>

      <router-link
        to="/user/gust/dislikes"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:thumbs-down text-2xl block text-red-500 mb-2"></i>
        <span class="block" v-t="'actions.dislikes'">نپسندیده‌ها</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ dislikesCount }}</span>
      </router-link>

      <router-link
        to="/user/gust/preferences"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:gear text-2xl block text-yellow-500 mb-2"></i>
        <span class="block" v-t="'titles.preferences'">تنظیمات</span>
      </router-link>

      <router-link
        to="/user/gust/backup"
        class="bg-gray-200 dark:bg-dark-400 p-4 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors shadow"
      >
        <i class="i-fa6-solid:download text-2xl block text-purple-500 mb-2"></i>
        <span class="block" v-t="'titles.data_management'">پشتیبان</span>
      </router-link>
    </div>


    <!-- Recent Activity Logs -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold" v-t="'titles.last_user_logs'">آخرین فعالیت‌های کاربر</h2>
        <button
          class="btn btn-secondary"
          @click="showAllLogs = !showAllLogs"
          v-t="'info.click_to_expand'"
        >
          {{ showAllLogs ? ($t('actions.show_less') || 'نمایش کمتر') : ($t('actions.show_more') || 'نمایش بیشتر') }}
        </button>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4" v-t="'info.logs_info_text'">
        فعالیت‌های شما در مرورگر شما ذخیره می‌شود و بر روی سرور ما نیست. می‌توانید از این داده‌ها نسخه پشتیبان تهیه کنید.
      </p>

      <div v-if="activityLogs.length > 0">
        <div v-for="(log, index) in displayedLogs" :key="index" class="flex items-center mb-2 pb-2 border-b border-gray-300 dark:border-dark-300 relative">
          <i class="i-fa6-solid:circle-dot text-sm text-blue-500 ml-3"></i>
          <div class="flex-1">
            <p class="text-sm">{{ log.action }} - {{ log.timestamp }}</p>
            <p v-if="showAllLogs" class="text-xs text-gray-500 dark:text-gray-500">{{ log.details }}</p>
          </div>

          <!-- More indicator that shows details on hover -->
          <div class="relative">
            <button
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
              @mouseenter="showTooltip = index"
              @mouseleave="showTooltip = null"
              @focus="showTooltip = index"
              @blur="showTooltip = null"
              aria-label="اطلاعات بیشتر"
              title="اطلاعات بیشتر"
            >
              <i class="i-fa6-solid:ellipsis text-xs"></i>
            </button>

            <!-- Tooltip with detailed information -->
            <div
              v-if="showTooltip === index"
              class="absolute z-10 left-0 mt-2 w-64 bg-white dark:bg-dark-600 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-dark-400"
              style="transform: translateX(-100%); top: 100%;"
              @mouseenter="showTooltip = index"
              @mouseleave="showTooltip = null"
            >
              <div class="text-sm">
                <div class="font-semibold mb-1 truncate" :title="log.title">{{ log.title }}</div>
                <div v-if="log.duration" class="text-gray-600 dark:text-gray-300 text-xs mb-1">
                  <i class="i-fa6-solid:clock mr-1"></i>
                  مدت ویدیو: {{ log.duration }}
                </div>
                <div class="text-gray-600 dark:text-gray-300 text-xs mb-1">
                  <i class="i-fa6-solid:hourglass-half mr-1"></i>
                  زمان اقامت: {{ log.timeSpent }}
                </div>
                <div class="text-gray-600 dark:text-gray-300 text-xs mb-2 break-all">
                  <i class="i-fa6-solid:link mr-1"></i>
                  <a :href="log.pageUrl" target="_blank" class="text-blue-500 hover:underline break-all text-xs">
                    {{ log.pageUrl }}
                  </a>
                </div>

                <button
                  @click="goToUrl(log.pageUrl)"
                  class="w-full mt-2 text-center text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                >
                  بازدید مجدد
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activityLogs.length > 10" class="mt-4 text-center">
          <button
            v-if="showMoreLogs"
            class="btn btn-secondary"
            @click="displayMoreLogs"
            v-t="'info.load_more'"
          >
            نمایش بیشتر
          </button>
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-600 dark:text-gray-400" v-t="'info.no_recent_activity'">
        فعالیت اخیری وجود ندارد
      </div>


      <!-- Privacy note -->
      <p class="mt-4 text-sm italic text-gray-600 dark:text-gray-400" v-t="'info.privacy_policy_note'">
        توجه داشته باشید که فعالیت‌های شما فقط در مرورگر شما ذخیره می‌شود، نه در سرور ما.
      </p>
    </div>

    <!-- Confirmation Modal for clearing logs -->
    <ConfirmModal
      v-if="showConfirmClearLogs"
      :message="$t('info.confirm_clear_all_logs') || 'آیا از پاک کردن تمام گزارش‌های فعالیت اطمینان دارید؟ این عمل قابل بازگشت نیست!'"
      @confirm="clearAllLogs"
      @close="showConfirmClearLogs = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "UserDashboard",
  components: {
    ConfirmModal
  },
  data() {
    return {
      subscriptionCount: 0,
      historyCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      recentVideos: [],  // For recent activity display
      activityLogs: [],
      showAllLogs: false,
      showConfirmClearLogs: false,
      showMoreLogs: true,
      logsPerPage: 10,
      displayedLogs: [],
      currentPage: 0,
      showTooltip: null,
    };
  },
  async mounted() {
    document.title = this.$t("titles.user_dashboard") + " - " + this.getSiteName();
    await this.updateCounts();
    await this.getRecentActivity();
    await this.loadActivityLogs();
  },
  methods: {
    async updateCounts() {
      // Get subscription count
      const subscriptions = this.getLocalSubscriptions() || [];
      this.subscriptionCount = Array.isArray(subscriptions) ? subscriptions.length : 0;

      // Get history count
      if (window.db) {
        try {
          const tx = window.db.transaction("watch_history", "readonly");
          const store = tx.objectStore("watch_history");
          this.historyCount = await store.count();
        } catch (e) {
          console.error("Error getting history count:", e);
          this.historyCount = 0;
        }
      }

      // Get likes count
      const likes = JSON.parse(localStorage.getItem("likes") || "[]");
      this.likesCount = Array.isArray(likes) ? likes.length : 0;

      // Get dislikes count
      const dislikes = JSON.parse(localStorage.getItem("dislikes") || "[]");
      this.dislikesCount = Array.isArray(dislikes) ? dislikes.length : 0;
    },
    async backupData(type) {
      try {
        let data = {};
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        switch(type) {
          case 'all':
            data = {
              subscriptions: this.getLocalSubscriptions() || [],
              history: await this.getHistoryData(),
              likes: JSON.parse(localStorage.getItem("likes") || "[]"),
              dislikes: JSON.parse(localStorage.getItem("dislikes") || "[]"),
              preferences: this.getAllPreferences(),
            };
            break;
          case 'subscriptions':
            data = this.getLocalSubscriptions() || [];
            break;
          case 'history':
            data = await this.getHistoryData();
            break;
          case 'likes':
            data = JSON.parse(localStorage.getItem("likes") || "[]");
            break;
          case 'dislikes':
            data = JSON.parse(localStorage.getItem("dislikes") || "[]");
            break;
          case 'preferences':
            data = this.getAllPreferences();
            break;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `piped_${type}_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان با موفقیت ایجاد شد');
      } catch (error) {
        console.error("Backup error:", error);
        this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان');
      }
    },
    async getHistoryData() {
      if (!window.db) return [];
      
      return new Promise((resolve, reject) => {
        try {
          const tx = window.db.transaction("watch_history", "readonly");
          const store = tx.objectStore("watch_history");
          const request = store.getAll();
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = (e) => {
            reject(e.target.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    },
    getAllPreferences() {
      const prefs = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pref_')) {
          prefs[key] = localStorage.getItem(key);
        }
      }
      return prefs;
    },
    async importData(type) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            await this.processImportData(type, data);
            this.showToast(this.$t('info.import_success') || 'داده‌ها با موفقیت وارد شدند');
            await this.updateCounts();
          } catch (error) {
            console.error("Import error:", error);
            this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن داده‌ها');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    async processImportData(type, data) {
      switch(type) {
        case 'all':
          if (data.subscriptions) {
            localStorage.setItem("localSubscriptions", JSON.stringify(data.subscriptions));
          }
          if (data.history && window.db) {
            await this.importHistoryData(data.history);
          }
          if (data.likes) {
            localStorage.setItem("likes", JSON.stringify(data.likes));
          }
          if (data.dislikes) {
            localStorage.setItem("dislikes", JSON.stringify(data.dislikes));
          }
          if (data.preferences) {
            Object.keys(data.preferences).forEach(key => {
              localStorage.setItem(key, data.preferences[key]);
            });
          }
          break;
        case 'subscriptions':
          localStorage.setItem("localSubscriptions", JSON.stringify(data));
          break;
        case 'history':
          if (window.db) {
            await this.importHistoryData(data);
          }
          break;
        case 'likes':
          localStorage.setItem("likes", JSON.stringify(data));
          break;
        case 'dislikes':
          localStorage.setItem("dislikes", JSON.stringify(data));
          break;
        case 'preferences':
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          break;
      }
    },
    async importHistoryData(historyData) {
      if (!window.db) return;
      
      const tx = window.db.transaction("watch_history", "readwrite");
      const store = tx.objectStore("watch_history");
      
      // Clear existing history first
      store.clear();
      
      // Add new history data
      for (const item of historyData) {
        store.add(item);
      }
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e);
      });
    },
    async resetAllData() {
      try {
        // Clear all localStorage items related to user data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('pref_') || 
            key === 'localSubscriptions' || 
            key === 'likes' || 
            key === 'dislikes' ||
            key === 'watchHistory' ||
            key === 'searchHistory'
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear IndexedDB history if available
        if (window.db) {
          const tx = window.db.transaction("watch_history", "readwrite");
          const store = tx.objectStore("watch_history");
          store.clear();
        }
        
        this.showToast(this.$t('info.all_data_reset') || 'همه داده‌ها بازنشانی شد');
        await this.updateCounts();
      } catch (error) {
        console.error("Reset error:", error);
        this.showToast(this.$t('info.reset_error') || 'خطا در بازنشانی داده‌ها');
      }
    },
    async clearSubscriptions() {
      try {
        localStorage.removeItem("localSubscriptions");
        this.showToast(this.$t('info.subscriptions_cleared') || 'اشتراک‌ها پاک شدند');
        await this.updateCounts();
      } catch (error) {
        console.error("Clear subscriptions error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن اشتراک‌ها');
      }
    },
    async handleDangerAction(action) {
      switch(action) {
        case 'resetAllData':
          await this.resetAllData();
          break;
        case 'clearSubscriptions':
          await this.clearSubscriptions();
          break;
        case 'clearHistory':
          await this.clearHistory();
          break;
        case 'clearLikes':
          await this.clearLikes();
          break;
        case 'clearDislikes':
          await this.clearDislikes();
          break;
        case 'resetPreferences':
          await this.resetPreferences();
          break;
      }
    },
    async clearHistory() {
      try {
        if (window.db) {
          const tx = window.db.transaction("watch_history", "readwrite");
          const store = tx.objectStore("watch_history");
          store.clear();
        }
        this.showToast(this.$t('info.history_cleared') || 'تاریخچه پاک شد');
        await this.updateCounts();
      } catch (error) {
        console.error("Clear history error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن تاریخچه');
      }
    },
    async clearLikes() {
      try {
        localStorage.removeItem("likes");
        this.showToast(this.$t('info.likes_cleared') || 'پسند شده‌ها پاک شدند');
        await this.updateCounts();
      } catch (error) {
        console.error("Clear likes error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن پسند شده‌ها');
      }
    },
    async clearDislikes() {
      try {
        localStorage.removeItem("dislikes");
        this.showToast(this.$t('info.dislikes_cleared') || 'پسند نشده‌ها پاک شدند');
        await this.updateCounts();
      } catch (error) {
        console.error("Clear dislikes error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن پسند نشده‌ها');
      }
    },
    async resetPreferences() {
      // Clear all preference-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pref_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      this.showToast(this.$t('info.preferences_reset') || 'تنظیمات بازنشانی شدند');
    },
    getSiteName() {
      return process.env.VITE_SITE_NAME || "Piped";
    },
    goToUrl(url) {
      // Navigate to the URL
      this.$router.push(url);
    },
    showToast(message) {
      // Using the same toast mechanism as in other components
      const toast = document.createElement("div");
      toast.className = "toast toast-bottom toast-center";
      toast.innerHTML = `
        <div class="alert alert-info">
          <span>${message}</span>
        </div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    },
    async loadActivityLogs() {
      // In a real implementation, we would fetch activity logs from wherever they are stored
      // For now, we'll simulate with some sample data

      // Sample activity logs - in reality this would come from localStorage or IndexedDB
      this.activityLogs = [
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 3600000).toLocaleString(),
          details: "تماشای ویدیو: چگونه یک وب‌سایت بسازیم",
          url: "/watch?v=dQw4w9WgXcQ",
          title: "چگونه یک وب‌سایت بسازیم",
          duration: "15:42",
          pageUrl: window.location.origin + "/watch?v=dQw4w9WgXcQ",
          timeSpent: "3 min 24 sec"
        },
        {
          action: "پسندیدن ویدیو",
          timestamp: new Date(Date.now() - 7200000).toLocaleString(),
          details: "ویدیو: آموزش Vue.js",
          url: "/watch?v=1234567890A",
          title: "آموزش Vue.js",
          duration: "22:18",
          pageUrl: window.location.origin + "/watch?v=1234567890A",
          timeSpent: "1 min 5 sec"
        },
        {
          action: "اشتراک در کانال",
          timestamp: new Date(Date.now() - 10800000).toLocaleString(),
          details: "کانال: Tech Tutorials",
          url: "/channel/UC1234567890",
          title: "Tech Tutorials",
          duration: null,
          pageUrl: window.location.origin + "/channel/UC1234567890",
          timeSpent: "2 min 10 sec"
        },
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 14400000).toLocaleString(),
          details: "تماشای ویدیو: معرفی Piped",
          url: "/watch?v=abcdefg1234",
          title: "معرفی Piped",
          duration: "8:31",
          pageUrl: window.location.origin + "/watch?v=abcdefg1234",
          timeSpent: "5 min 42 sec"
        },
        {
          action: "لغو پسندیدن",
          timestamp: new Date(Date.now() - 18000000).toLocaleString(),
          details: "ویدیو: چرا نباید از یوتیوب استفاده کرد",
          url: "/watch?v=hijklm56789",
          title: "چرا نباید از یوتیوب استفاده کرد",
          duration: "12:45",
          pageUrl: window.location.origin + "/watch?v=hijklm56789",
          timeSpent: "45 sec"
        },
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 21600000).toLocaleString(),
          details: "تماشای ویدیو: سیاست حفظ حریم خصوصی",
          url: "/watch?v=nopqrs90123",
          title: "سیاست حفظ حریم خصوصی",
          duration: "18:22",
          pageUrl: window.location.origin + "/watch?v=nopqrs90123",
          timeSpent: "8 min 12 sec"
        },
        {
          action: "نپسندیدن ویدیو",
          timestamp: new Date(Date.now() - 25200000).toLocaleString(),
          details: "ویدیو: تبلیغات نامناسب",
          url: "/watch?v=tuvwx456789",
          title: "تبلیغات نامناسب",
          duration: "5:17",
          pageUrl: window.location.origin + "/watch?v=tuvwx456789",
          timeSpent: "2 min 3 sec"
        },
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 28800000).toLocaleString(),
          details: "تماشای ویدیو: فناوری‌های آزاد",
          url: "/watch?v=yz123456789",
          title: "فناوری‌های آزاد",
          duration: "25:11",
          pageUrl: window.location.origin + "/watch?v=yz123456789",
          timeSpent: "10 min 5 sec"
        },
        {
          action: "پسندیدن ویدیو",
          timestamp: new Date(Date.now() - 32400000).toLocaleString(),
          details: "ویدیو: معرفی پروژه Open Source",
          url: "/watch?v=ab567890123",
          title: "معرفی پروژه Open Source",
          duration: "14:33",
          pageUrl: window.location.origin + "/watch?v=ab567890123",
          timeSpent: "6 min 18 sec"
        },
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 36000000).toLocaleString(),
          details: "تماشای ویدیو: چگونه امنیت خود را افزایش دهیم",
          url: "/watch?v=cd901234567",
          title: "چگونه امنیت خود را افزایش دهیم",
          duration: "19:47",
          pageUrl: window.location.origin + "/watch?v=cd901234567",
          timeSpent: "7 min 11 sec"
        },
        {
          action: "لغو اشتراک",
          timestamp: new Date(Date.now() - 39600000).toLocaleString(),
          details: "کانال: Tech News",
          url: "/channel/UC987654321",
          title: "Tech News",
          duration: null,
          pageUrl: window.location.origin + "/channel/UC987654321",
          timeSpent: "30 sec"
        },
        {
          action: "مشاهده ویدیو",
          timestamp: new Date(Date.now() - 43200000).toLocaleString(),
          details: "تماشای ویدیو: اینترنت آزاد",
          url: "/watch?v=ef123456789",
          title: "اینترنت آزاد",
          duration: "21:05",
          pageUrl: window.location.origin + "/watch?v=ef123456789",
          timeSpent: "9 min 3 sec"
        },
      ];

      // Initial display - show first 10 logs
      this.displayedLogs = this.activityLogs.slice(0, this.logsPerPage);
      this.currentPage = 1;
    },
    async getRecentActivity() {
      // Get recent history items from IndexedDB
      if (!window.db) {
        this.recentVideos = [];
        return;
      }

      try {
        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        const index = store.index("watchedAt");

        // Get last 10 most recent videos
        const request = index.getAll(null, 10);

        request.onsuccess = () => {
          const history = request.result.reverse(); // Reverse to show newest first
          // Convert to format for display cards
          this.recentVideos = history.slice(0, 10).map(item => {
            return {
              videoId: item.videoId,
              title: item.title,
              channelName: item.channelName,
              thumbnail: item.thumbnail,
              watchedAt: item.watchedAt
            };
          });
        };

        request.onerror = (e) => {
          console.error("Error getting recent activity:", e.target.error);
          this.recentVideos = [];
        };
      } catch (e) {
        console.error("Error getting recent activity:", e);
        this.recentVideos = [];
      }
    },
    displayMoreLogs() {
      const startIndex = this.currentPage * this.logsPerPage;
      const endIndex = Math.min(startIndex + this.logsPerPage, this.activityLogs.length);

      if (startIndex < this.activityLogs.length) {
        const newLogs = this.activityLogs.slice(startIndex, endIndex);
        this.displayedLogs = [...this.displayedLogs, ...newLogs];
        this.currentPage++;
      }

      // Hide the "Load More" button if we've reached the end
      if (endIndex >= this.activityLogs.length) {
        this.showMoreLogs = false;
      }
    },
    async clearAllLogs() {
      try {
        // In a real implementation, this would clear activity logs from storage
        // For now, just clear the array
        this.activityLogs = [];
        this.displayedLogs = [];

        this.showToast(this.$t('info.logs_cleared') || 'گزارش‌ها پاک شدند');
        this.showConfirmClearLogs = false;
      } catch (error) {
        console.error("Clear logs error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن');
      }
    },
    getLocalSubscriptions() {
      const subscriptions = localStorage.getItem("localSubscriptions");
      return subscriptions ? JSON.parse(subscriptions) : [];
    }
  }
};
</script>

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
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 class="text-xl font-bold" v-t="'titles.last_user_logs'">آخرین فعالیت‌های کاربر</h2>
        <button
          class="btn btn-secondary"
          @click="toggleAllJsonDetails"
        >
          {{ allJsonExpanded ? 'بستن همه' : 'نمایش همه JSON' }}
        </button>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4" v-t="'info.logs_info_text'">
        فعالیت‌های شما در مرورگر شما ذخیره می‌شود و بر روی سرور ما نیست. می‌توانید از این داده‌ها نسخه پشتیبان تهیه کنید.
      </p>

      <!-- Combined Activity Logs (including search history) -->
      <div>
        <div v-if="combinedActivityLogs.length > 0">
          <div v-for="(log, index) in displayedLogs" :key="index" class="flex items-start mb-2 pb-2 border-b border-gray-300 dark:border-dark-300">
            <i
              :class="log.isSearch ? 'i-fa6-solid:magnifying-glass text-blue-500' : 'i-fa6-solid:circle-dot text-blue-500'"
              class="text-sm ml-3 mt-1"
            ></i>
            <div class="flex-1">
              <p class="text-sm">{{ log.action }} - {{ log.timestamp }}</p>

              <!-- Expandable JSON data section -->
              <div v-if="expandedLogIndex === index || expandedLogIndex === 'all'" class="mt-2 bg-gray-100 dark:bg-dark-500 p-3 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-semibold text-sm">اطلاعات JSON:</h4>
                  <div class="flex space-x-2">
                    <button
                      @click="copyJsonData(log)"
                      class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                      title="کپی اطلاعات"
                    >
                      <i class="i-fa6-solid:copy"></i>
                    </button>
                    <button
                      v-if="expandedLogIndex !== 'all'"
                      @click="expandedLogIndex = null"
                      class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                    >
                      <i class="i-fa6-solid:times"></i>
                    </button>
                    <button
                      v-else
                      @click="allJsonExpanded = false; expandedLogIndex = null"
                      class="text-gray-500 hover:text-gray-400 dark:text-gray-200 text-sm"
                    >
                      <i class="i-fa6-solid:times"></i>
                    </button>
                  </div>
                </div>
                <pre class="text-xs bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto" v-html="formatJsonWithLinks(log)"></pre>
              </div>
            </div>

            <!-- Expand/Collapse button that shows JSON details on click -->
            <button
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors flex-shrink-0"
              @click="toggleLogDetails(index)"
              aria-label="نمایش جزئیات بیشتر"
              title="نمایش جزئیات بیشتر"
            >
              <i
                :class="expandedLogIndex === index ? 'i-fa6-solid:minus' : 'i-fa6-solid:expand'"
                class="text-xs"
              ></i>
            </button>
          </div>

          <div v-if="combinedActivityLogs.length > 10" class="mt-4 text-center">
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
      </div>
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
      searchHistory: [],
      combinedActivityLogs: [],
      showAllLogs: false,
      showConfirmClearLogs: false,
      showMoreLogs: true,
      logsPerPage: 10,
      displayedLogs: [],
      currentPage: 0,
      showTooltip: null,
      expandedLogIndex: null,
      allJsonExpanded: false,
    };
  },
  async mounted() {
    document.title = this.$t("titles.user_dashboard") + " - " + this.getSiteName();

    // Wait for database to be ready before updating counts
    await this.waitForDatabase();
    await this.updateCounts();
    await this.getRecentActivity();
    await this.loadActivityLogs();
    await this.loadSearchHistory();
  },
  methods: {
    async updateCounts() {
      // Get subscription count
      try {
        const subscriptions = this.getLocalSubscriptions() || [];
        this.subscriptionCount = Array.isArray(subscriptions) ? subscriptions.length : 0;
      } catch (e) {
        console.error("Error getting subscription count:", e);
        this.subscriptionCount = 0;
      }

      // Get history count
      try {
        if (window.db) {
          const tx = window.db.transaction("watch_history", "readonly");
          const store = tx.objectStore("watch_history");
          const countRequest = store.count();

          // Return a promise that resolves with the count
          this.historyCount = await new Promise((resolve, reject) => {
            countRequest.onsuccess = () => {
              resolve(countRequest.result);
            };
            countRequest.onerror = (event) => {
              console.error("Error counting watch history:", event.target.error);
              reject(event.target.error);
            };
          });
        } else {
          console.warn("Database not available for history count");
          this.historyCount = 0;
        }
      } catch (e) {
        console.error("Error getting history count:", e);
        this.historyCount = 0;
      }

      // Get likes count
      try {
        const likesRaw = localStorage.getItem("likes");
        const likes = likesRaw ? JSON.parse(likesRaw) : [];
        this.likesCount = Array.isArray(likes) ? likes.length : 0;
      } catch (e) {
        console.error("Error getting likes count:", e);
        this.likesCount = 0;
      }

      // Get dislikes count
      try {
        const dislikesRaw = localStorage.getItem("dislikes");
        const dislikes = dislikesRaw ? JSON.parse(dislikesRaw) : [];
        this.dislikesCount = Array.isArray(dislikes) ? dislikes.length : 0;
      } catch (e) {
        console.error("Error getting dislikes count:", e);
        this.dislikesCount = 0;
      }
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
        a.download = `${type}_backup_${timestamp}.json`;
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
      return import.meta.env.VITE_SITE_NAME || "vidioo";
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
      // Load activity logs from localStorage where they're stored by the App component
      try {
        const logs = JSON.parse(localStorage.getItem('userActivityLogs') || '[]');

        // Process logs to ensure they have consistent structure
        this.activityLogs = logs.map(log => ({
          action: log.action || "بازدید صفحه",
          timestamp: log.timestamp || new Date().toLocaleString(),
          details: log.details || `Viewed: ${log.title || 'صفحه ناشناس'}`,
          url: log.url || '',
          title: log.title || 'صفحه ناشناس',
          pageUrl: log.pageUrl || window.location.origin + log.url,
          timeSpent: log.timeSpent || null
        }));

        // Initial display - show first 10 logs
        this.displayedLogs = this.activityLogs.slice(0, this.logsPerPage);
        this.currentPage = 1;

        // Update combined logs after loading activity logs
        this.updateCombinedActivityLogs();
      } catch (error) {
        console.error("Error loading activity logs:", error);
        // Fallback to empty array if there's an error
        this.activityLogs = [];
        this.displayedLogs = [];
      }
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
    },
    toggleLogDetails(index) {
      // If all JSON details are expanded, individual toggle should collapse all first
      if (this.expandedLogIndex === 'all') {
        this.expandedLogIndex = index;
        this.allJsonExpanded = false;
      } else {
        // If clicking the same log, close it; otherwise, expand the new one
        this.expandedLogIndex = this.expandedLogIndex === index ? null : index;
        // When individual log is toggled, make sure allJsonExpanded is false
        if (this.expandedLogIndex !== null) {
          this.allJsonExpanded = false;
        }
      }
    },
    toggleAllJsonDetails() {
      // Show all logs when toggling JSON details
      this.showAllLogs = true;

      // Toggle all JSON details at once
      this.allJsonExpanded = !this.allJsonExpanded;
      if (this.allJsonExpanded) {
        // Expand all JSON details
        this.expandedLogIndex = 'all'; // Special value to indicate all are expanded
      } else {
        // Close all JSON details
        this.expandedLogIndex = null;
      }
    },
    formatJson(obj) {
      // Format the JSON object for better readability per line
      return JSON.stringify(obj, null, 2);
    },
    formatJsonWithLinks(obj) {
      // Create a deep clone to avoid modifying original object
      const clonedObj = JSON.parse(JSON.stringify(obj));

      // Process the object to replace url and pageUrl with HTML links
      if (clonedObj.url && typeof clonedObj.url === 'string' && clonedObj.url.startsWith('http')) {
        clonedObj.url = `__LINK_START__${clonedObj.url}__LINK_END__`;
      }
      if (clonedObj.pageUrl && typeof clonedObj.pageUrl === 'string' && clonedObj.pageUrl.startsWith('http')) {
        clonedObj.pageUrl = `__LINK_START__${clonedObj.pageUrl}__LINK_END__`;
      }

      // Format the JSON string
      let jsonString = JSON.stringify(clonedObj, null, 2);

      // Escape HTML in the JSON string to prevent XSS
      jsonString = jsonString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // Now replace our placeholders with actual HTML links (this is safe since we already escaped other content)
      jsonString = jsonString
        .replace(/__LINK_START__([^""]+)__LINK_END__/g, (match, url) => {
          return `<a href="${url}" target="_blank" class="text-blue-400 hover:underline break-all">${url}</a>`;
        });

      return jsonString;
    },
    async copyJsonData(obj) {
      try {
        const jsonStr = JSON.stringify(obj, null, 2);
        await navigator.clipboard.writeText(jsonStr);
        this.showToast(this.$t('info.copied') || 'کپی شد');
      } catch (err) {
        console.error('Failed to copy JSON data:', err);
        this.showToast(this.$t('info.cannot_copy') || 'نمی‌توان کپی کرد');
      }
    },
    async waitForDatabase() {
      // Wait for the database to be ready
      if (!window.db) {
        // If IndexedDB is not available in this browser
        if (!("indexedDB" in window)) {
          console.warn("IndexedDB not supported in this browser");
          return;
        }

        // Wait for a reasonable amount of time for the database to initialize
        return new Promise((resolve) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds with 100ms intervals

          const checkDb = () => {
            if (window.db) {
              resolve();
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkDb, 100);
            } else {
              console.warn("Database not ready after waiting, continuing with limited functionality");
              resolve();
            }
          };

          checkDb();
        });
      }
    },
    async loadSearchHistory() {
      try {
        const history = localStorage.getItem("search_history");
        const parsedHistory = history ? JSON.parse(history) : [];

        // If the history is in the old format (just strings), convert it to the new format
        if (parsedHistory.length > 0 && typeof parsedHistory[0] === 'string') {
          this.searchHistory = parsedHistory.map(query => ({
            query: query,
            timestamp: new Date().toISOString() // Use current timestamp for old entries
          }));
        } else {
          this.searchHistory = parsedHistory;
        }

        this.updateCombinedActivityLogs();
      } catch (error) {
        console.error("Error loading search history:", error);
        this.searchHistory = [];
      }
    },
    updateCombinedActivityLogs() {
      // Convert search history items to log format
      const searchLogs = this.searchHistory.map(searchItem => ({
        action: `جستجو: ${searchItem.query}`,
        timestamp: new Date(searchItem.timestamp).toLocaleString(),
        isSearch: true,
        details: `Search query: ${searchItem.query}`,
        url: `/results?search_query=${encodeURIComponent(searchItem.query)}`,
        title: searchItem.query
      }));

      // Combine with activity logs and sort by timestamp (newest first)
      this.combinedActivityLogs = [
        ...searchLogs,
        ...this.activityLogs
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Update displayed logs
      this.displayedLogs = this.combinedActivityLogs.slice(0, this.logsPerPage);
      this.currentPage = 1;
      this.showMoreLogs = this.combinedActivityLogs.length > this.logsPerPage;
    },
    displayMoreLogs() {
      const startIndex = this.currentPage * this.logsPerPage;
      const endIndex = Math.min(startIndex + this.logsPerPage, this.combinedActivityLogs.length);

      if (startIndex < this.combinedActivityLogs.length) {
        const newLogs = this.combinedActivityLogs.slice(startIndex, endIndex);
        this.displayedLogs = [...this.displayedLogs, ...newLogs];
        this.currentPage++;
      }

      // Hide the "Load More" button if we've reached the end
      if (endIndex >= this.combinedActivityLogs.length) {
        this.showMoreLogs = false;
      }
    }
  }
};
</script>

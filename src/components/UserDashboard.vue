<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center" v-t="'titles.user_dashboard'">داشبورد کاربر</h1>
    
    <!-- Dashboard Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold mb-2" v-t="'titles.subscriptions'">اشتراک‌ها</h2>
        <p class="text-3xl font-bold" v-text="subscriptionCount"></p>
        <router-link to="/user/gust/subscriptions" class="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          {{ $t('actions.view_details') || 'مشاهده جزئیات' }}
        </router-link>
      </div>

      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold mb-2" v-t="'titles.history'">تاریخچه</h2>
        <p class="text-3xl font-bold" v-text="historyCount"></p>
        <router-link to="/user/gust/history" class="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          {{ $t('actions.view_details') || 'مشاهده جزئیات' }}
        </router-link>
      </div>

      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold mb-2" v-t="'actions.likes'">پسند شده‌ها</h2>
        <p class="text-3xl font-bold" v-text="likesCount"></p>
        <router-link to="/user/gust/likes" class="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          {{ $t('actions.view_details') || 'مشاهده جزئیات' }}
        </router-link>
      </div>

      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-lg font-semibold mb-2" v-t="'actions.dislikes'">پسند نشده‌ها</h2>
        <p class="text-3xl font-bold" v-text="dislikesCount"></p>
        <router-link to="/user/gust/dislikes" class="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          {{ $t('actions.view_details') || 'مشاهده جزئیات' }}
        </router-link>
      </div>
    </div>

    <!-- Import/Export Section -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-8">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.data_management'">مدیریت داده‌ها</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-lg font-semibold mb-2" v-t="'titles.backup_data'">پشتیبان‌گیری داده‌ها</h3>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-secondary" @click="backupData('all')" v-t="'actions.backup_all'">پشتیبان گیری همه</button>
            <button class="btn btn-secondary" @click="backupData('subscriptions')" v-t="'actions.backup_subscriptions'">اشتراک‌ها</button>
            <button class="btn btn-secondary" @click="backupData('history')" v-t="'actions.backup_history'">تاریخچه</button>
            <button class="btn btn-secondary" @click="backupData('likes')" v-t="'actions.backup_likes'">پسند شده‌ها</button>
            <button class="btn btn-secondary" @click="backupData('dislikes')" v-t="'actions.backup_dislikes'">پسند نشده‌ها</button>
            <button class="btn btn-secondary" @click="backupData('preferences')" v-t="'actions.backup_preferences'">تنظیمات</button>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-2" v-t="'titles.import_data'">وارد کردن داده‌ها</h3>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-info" @click="importData('all')" v-t="'actions.import_all'">وارد کردن همه</button>
            <button class="btn btn-info" @click="importData('subscriptions')" v-t="'actions.import_subscriptions'">اشتراک‌ها</button>
            <button class="btn btn-info" @click="importData('history')" v-t="'actions.import_history'">تاریخچه</button>
            <button class="btn btn-info" @click="importData('likes')" v-t="'actions.import_likes'">پسند شده‌ها</button>
            <button class="btn btn-info" @click="importData('dislikes')" v-t="'actions.import_dislikes'">پسند نشده‌ها</button>
            <button class="btn btn-info" @click="importData('preferences')" v-t="'actions.import_preferences'">تنظیمات</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences Link -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-8">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.preferences'">تنظیمات</h2>
      <router-link to="/user/gust/preferences" class="btn btn-primary">
        {{ $t('actions.manage_preferences') || 'مدیریت تنظیمات' }}
      </router-link>
    </div>

    <!-- Danger Zone -->
    <DangerZone @action-confirmed="handleDangerAction" />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
import DangerZone from "./DangerZone.vue";

export default {
  name: "UserDashboard",
  components: {
    ConfirmModal,
    DangerZone
  },
  data() {
    return {
      subscriptionCount: 0,
      historyCount: 0,
      likesCount: 0,
      dislikesCount: 0,
    };
  },
  async mounted() {
    document.title = this.$t("titles.user_dashboard") + " - " + this.getSiteName();
    await this.updateCounts();
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
    getLocalSubscriptions() {
      const subscriptions = localStorage.getItem("localSubscriptions");
      return subscriptions ? JSON.parse(subscriptions) : [];
    }
  }
};
</script>

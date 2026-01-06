<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary ml-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.danger_zone'">منطقه خطر</h1>
    </div>
    
    <!-- Warning Banner -->
    <div class="bg-red-100 dark:bg-red-900/20 p-4 rounded-xl shadow mb-6 border border-red-300 dark:border-red-700">
      <div class="flex items-start">
        <i class="i-fa6-solid:triangle-exclamation text-red-600 dark:text-red-400 text-xl mt-1 ml-3"></i>
        <div>
          <h2 class="text-lg font-bold text-red-800 dark:text-red-200" v-t="'info.warning'">هشدار</h2>
          <p class="text-red-700 dark:text-red-300" v-t="'info.danger_zone_warning'">
            این اقدامات مخرب هستند و قابل بازگشت نیستند. مراقب باشید!
          </p>
        </div>
      </div>
    </div>
    
    <!-- Reset All Data -->
    <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4 flex items-center">
        <i class="i-fa6-solid:sync-alt text-red-500 ml-2"></i>
        <span v-t="'actions.reset_all_data'">بازنشانی همه داده‌ها</span>
      </h2>
      <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.reset_all_data_description'">
        این کار تمام اشتراک‌ها، تاریخچه، ویدیوهای پسندیده، ویدیوهای نپسندیده و تنظیمات پیش‌فرض را پاک می‌کند.
      </p>
      <button 
        class="btn btn-danger" 
        @click="showConfirmResetAll = true"
        v-t="'actions.reset_all_data'"
      >
        بازنشانی همه داده‌ها
      </button>
    </div>
    
    <!-- Data Type Specific Resets -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Clear Subscriptions -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:bell-slash text-red-500 ml-2"></i>
          <span v-t="'actions.clear_subscriptions'">پاک کردن اشتراک‌ها</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_subscriptions_description'">
          تمام اشتراک‌ها را از لیست شما حذف می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearSubscriptions = true"
          v-t="'actions.clear_subscriptions'"
        >
          پاک کردن اشتراک‌ها
        </button>
      </div>

      <!-- Clear History -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:trash-can text-red-500 ml-2"></i>
          <span v-t="'actions.clear_watch_history'">پاک کردن تاریخچه تماشا</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_history_description'">
          تمام تاریخچه تماشا ویدیوها را پاک می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearHistory = true"
          v-t="'actions.clear_watch_history'"
        >
          پاک کردن تاریخچه
        </button>
      </div>

      <!-- Clear Likes -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:thumbs-up text-red-500 ml-2"></i>
          <span v-t="'actions.clear_likes'">پاک کردن پسندیده‌ها</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_likes_description'">
          تمام ویدیوهای پسندیده شده را از لیست شما حذف می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearLikes = true"
          v-t="'actions.clear_likes'"
        >
          پاک کردن پسندیده‌ها
        </button>
      </div>

      <!-- Clear Dislikes -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:thumbs-down text-red-500 ml-2"></i>
          <span v-t="'actions.clear_dislikes'">پاک کردن نپسندیده‌ها</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_dislikes_description'">
          تمام ویدیوهای نپسندیده شده را از لیست شما حذف می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearDislikes = true"
          v-t="'actions.clear_dislikes'"
        >
          پاک کردن نپسندیده‌ها
        </button>
      </div>
    </div>

    <!-- Additional Data Type Resets -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Clear Activity Logs -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:clock-rotate-left text-red-500 ml-2"></i>
          <span v-t="'actions.clear_activity_logs'">پاک کردن فعالیت‌های اخیر</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_activity_logs_description'">
          تمام گزارش‌های فعالیت‌های اخیر کاربر را پاک می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearActivityLogs = true"
          v-t="'actions.clear_activity_logs'"
        >
          پاک کردن فعالیت‌های اخیر
        </button>
      </div>

      <!-- Clear Search History -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:magnifying-glass text-red-500 ml-2"></i>
          <span v-t="'actions.clear_search_history'">پاک کردن تاریخچه جستجو</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_search_history_description'">
          تمام تاریخچه جستجوهای انجام شده را پاک می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearSearchHistory = true"
          v-t="'actions.clear_search_history'"
        >
          پاک کردن تاریخچه جستجو
        </button>
      </div>

      <!-- Clear Channel History -->
      <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-2 flex items-center">
          <i class="i-fa6-solid:user-group text-red-500 ml-2"></i>
          <span v-t="'actions.clear_channel_history'">پاک کردن تاریخچه کانال</span>
        </h3>
        <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.clear_channel_history_description'">
          تمام تاریخچه بازدیدهای کانال را پاک می‌کند.
        </p>
        <button
          class="btn btn-danger"
          @click="showConfirmClearChannelHistory = true"
          v-t="'actions.clear_channel_history'"
        >
          پاک کردن تاریخچه کانال
        </button>
      </div>
    </div>
    
    <!-- Reset Preferences -->
    <div class="bg-gray-100 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4 flex items-center">
        <i class="i-fa6-solid:sliders text-red-500 ml-2"></i>
        <span v-t="'actions.reset_preferences'">بازنشانی تنظیمات</span>
      </h2>
      <p class="mb-4 text-gray-700 dark:text-gray-300" v-t="'info.reset_preferences_description'">
        تمام تنظیمات شخصی‌سازی شده را به مقادیر پیش‌فرض بازنشانی می‌کند.
      </p>
      <button 
        class="btn btn-danger" 
        @click="showConfirmResetPreferences = true"
        v-t="'actions.reset_preferences'"
      >
        بازنشانی تنظیمات
      </button>
    </div>
    
    <!-- Confirmation Modals -->
    <ConfirmModal
      v-if="showConfirmResetAll"
      :message="$t('info.confirm_reset_all_data') || 'آیا از بازنشانی تمام داده‌های خود اطمینان دارید؟ این عملیات قابل بازگشت نیست!'"
      @confirm="resetAllData"
      @close="showConfirmResetAll = false"
    />
    
    <ConfirmModal
      v-if="showConfirmClearSubscriptions"
      :message="$t('info.confirm_clear_subscriptions') || 'آیا از پاک کردن تمام اشتراک‌ها اطمینان دارید؟'"
      @confirm="clearSubscriptions"
      @close="showConfirmClearSubscriptions = false"
    />
    
    <ConfirmModal
      v-if="showConfirmClearHistory"
      :message="$t('info.confirm_clear_history') || 'آیا از پاک کردن تاریخچه تماشا اطمینان دارید؟'"
      @confirm="clearHistory"
      @close="showConfirmClearHistory = false"
    />
    
    <ConfirmModal
      v-if="showConfirmClearLikes"
      :message="$t('info.confirm_clear_likes') || 'آیا از پاک کردن تمام ویدیوهای پسندیده شده اطمینان دارید؟'"
      @confirm="clearLikes"
      @close="showConfirmClearLikes = false"
    />
    
    <ConfirmModal
      v-if="showConfirmClearDislikes"
      :message="$t('info.confirm_clear_dislikes') || 'آیا از پاک کردن تمام ویدیوهای نپسندیده شده اطمینان دارید؟'"
      @confirm="clearDislikes"
      @close="showConfirmClearDislikes = false"
    />
    
    <ConfirmModal
      v-if="showConfirmResetPreferences"
      :message="$t('info.confirm_reset_preferences') || 'آیا از بازنشانی تنظیمات به حالت اولیه اطمینان دارید؟'"
      @confirm="resetPreferences"
      @close="showConfirmResetPreferences = false"
    />

    <ConfirmModal
      v-if="showConfirmClearActivityLogs"
      :message="$t('info.confirm_clear_activity_logs') || 'آیا از پاک کردن تمام گزارش‌های فعالیت اخیر اطمینان دارید؟'"
      @confirm="clearActivityLogs"
      @close="showConfirmClearActivityLogs = false"
    />

    <ConfirmModal
      v-if="showConfirmClearSearchHistory"
      :message="$t('info.confirm_clear_search_history') || 'آیا از پاک کردن تمام تاریخچه جستجو اطمینان دارید؟'"
      @confirm="clearSearchHistory"
      @close="showConfirmClearSearchHistory = false"
    />

    <ConfirmModal
      v-if="showConfirmClearChannelHistory"
      :message="$t('info.confirm_clear_channel_history') || 'آیا از پاک کردن تمام تاریخچه کانال اطمینان دارید؟'"
      @confirm="clearChannelHistory"
      @close="showConfirmClearChannelHistory = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
import { debugLogger } from "../utils/DebugLogger";

export default {
  name: "DangerZonePage",
  components: {
    ConfirmModal
  },
  data() {
    return {
      showConfirmResetAll: false,
      showConfirmClearSubscriptions: false,
      showConfirmClearHistory: false,
      showConfirmClearLikes: false,
      showConfirmClearDislikes: false,
      showConfirmResetPreferences: false,
      showConfirmClearActivityLogs: false,
      showConfirmClearSearchHistory: false,
      showConfirmClearChannelHistory: false,
    };
  },
  methods: {
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
        
        this.showToast(this.$t('info.all_data_reset') || 'همه داده‌ها بازنشانی شدند');
        
        // Close modal
        this.showConfirmResetAll = false;
      } catch (error) {
        debugLogger.error("Reset all error:", error);
        this.showToast(this.$t('info.reset_error') || 'خطا در بازنشانی داده‌ها');
      }
    },
    async clearSubscriptions() {
      try {
        localStorage.removeItem("localSubscriptions");
        this.showToast(this.$t('info.subscriptions_cleared') || 'اشتراک‌ها پاک شدند');
        this.showConfirmClearSubscriptions = false;
      } catch (error) {
        debugLogger.error("Clear subscriptions error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن اشتراک‌ها');
      }
    },
    async clearHistory() {
      try {
        if (window.db) {
          const tx = window.db.transaction("watch_history", "readwrite");
          const store = tx.objectStore("watch_history");
          store.clear();
        }
        this.showToast(this.$t('info.history_cleared') || 'تاریخچه تماشا پاک شد');
        this.showConfirmClearHistory = false;
      } catch (error) {
        debugLogger.error("Clear history error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن تاریخچه');
      }
    },
    async clearLikes() {
      try {
        localStorage.removeItem("likes");
        this.showToast(this.$t('info.likes_cleared') || 'ویدیوهای پسندیده شده پاک شدند');
        this.showConfirmClearLikes = false;
      } catch (error) {
        debugLogger.error("Clear likes error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن ویدیوهای پسندیده شده');
      }
    },
    async clearDislikes() {
      try {
        localStorage.removeItem("dislikes");
        this.showToast(this.$t('info.dislikes_cleared') || 'ویدیوهای نپسندیده شده پاک شدند');
        this.showConfirmClearDislikes = false;
      } catch (error) {
        debugLogger.error("Clear dislikes error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن ویدیوهای نپسندیده شده');
      }
    },
    async resetPreferences() {
      try {
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
        this.showConfirmResetPreferences = false;
      } catch (error) {
        debugLogger.error("Reset preferences error:", error);
        this.showToast(this.$t('info.reset_error') || 'خطا در بازنشانی تنظیمات');
      }
    },
    async clearActivityLogs() {
      try {
        localStorage.removeItem("userActivityLogs");
        this.showToast(this.$t('info.activity_logs_cleared') || 'گزارش فعالیت‌های اخیر پاک شد');
        this.showConfirmClearActivityLogs = false;
      } catch (error) {
        debugLogger.error("Clear activity logs error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن گزارش فعالیت‌ها');
      }
    },
    async clearSearchHistory() {
      try {
        localStorage.removeItem("search_history");
        this.showToast(this.$t('info.search_history_cleared') || 'تاریخچه جستجو پاک شد');
        this.showConfirmClearSearchHistory = false;
      } catch (error) {
        debugLogger.error("Clear search history error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن تاریخچه جستجو');
      }
    },
    async clearChannelHistory() {
      try {
        // Wait for database to be ready
        if (!window.db) {
          // If IndexedDB is not available in this browser
          if (!("indexedDB" in window)) {
            debugLogger.warn("IndexedDB not supported in this browser");
            this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
            return;
          }

          // Wait for a reasonable amount of time for the database to initialize
          await new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds with 100ms intervals

            const checkDb = () => {
              if (window.db) {
                resolve();
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkDb, 100);
              } else {
                debugLogger.warn("Database not ready after waiting, skipping channel history clear");
                resolve();
              }
            };

            checkDb();
          });
        }

        // Check if we have access to the database
        if (!window.db) {
          debugLogger.error("Database not available for channel history clear");
          this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
          return;
        }

        // Check if the channel_history store exists
        if (!window.db.objectStoreNames.contains("channel_history")) {
          debugLogger.error("channel_history object store does not exist");
          this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
          return;
        }

        const tx = window.db.transaction("channel_history", "readwrite");
        const store = tx.objectStore("channel_history");
        store.clear();

        this.showToast(this.$t('info.channel_history_cleared') || 'تاریخچه کانال پاک شد');
        this.showConfirmClearChannelHistory = false;
      } catch (error) {
        debugLogger.error("Clear channel history error:", error);
        this.showToast(this.$t('info.clear_error') || 'خطا در پاک کردن تاریخچه کانال');
      }
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
    }
  }
};
</script>
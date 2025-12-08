<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary ml-4">
        <i class="i-fa6-solid:arrow-left"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.data_management'">مدیریت داده‌ها</h1>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Backup Section -->
      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-xl font-bold mb-4" v-t="'titles.backup_data'">پشتیبان‌گیری داده‌ها</h2>
        
        <div class="space-y-4">
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:download text-blue-500 ml-2"></i>
              <span v-t="'actions.backup_all'">پشتیبان گیری همه</span>
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3" v-t="'info.backup_all_description'">
              شامل اشتراک‌ها، تاریخچه، پسندیده‌ها، نپسندیده‌ها و تنظیمات
            </p>
            <button 
              class="btn btn-secondary w-full" 
              @click="backupAllData"
              v-t="'actions.create_backup'"
            >
              ایجاد نسخه پشتیبان
            </button>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:rss text-blue-500 ml-2"></i>
              <span v-t="'titles.subscriptions'">اشتراک‌ها</span>
            </h3>
            <div class="flex gap-2">
              <button 
                class="btn btn-secondary flex-1" 
                @click="backupSubscriptions"
                v-t="'actions.export'"
              >
                صدور
              </button>
              <button 
                class="btn btn-info flex-1" 
                @click="importSubscriptions"
                v-t="'actions.import'"
              >
                ورود
              </button>
            </div>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:clock-rotate-left text-blue-500 ml-2"></i>
              <span v-t="'titles.history'">تاریخچه</span>
            </h3>
            <div class="flex gap-2">
              <button 
                class="btn btn-secondary flex-1" 
                @click="backupHistory"
                v-t="'actions.export'"
              >
                صدور
              </button>
              <button 
                class="btn btn-info flex-1" 
                @click="importHistory"
                v-t="'actions.import'"
              >
                ورود
              </button>
            </div>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:thumbs-up text-blue-500 ml-2"></i>
              <span v-t="'actions.likes'">پسندیده‌ها</span>
            </h3>
            <div class="flex gap-2">
              <button 
                class="btn btn-secondary flex-1" 
                @click="backupLikes"
                v-t="'actions.export'"
              >
                صدور
              </button>
              <button 
                class="btn btn-info flex-1" 
                @click="importLikes"
                v-t="'actions.import'"
              >
                ورود
              </button>
            </div>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:thumbs-down text-blue-500 ml-2"></i>
              <span v-t="'actions.dislikes'">نپسندیده‌ها</span>
            </h3>
            <div class="flex gap-2">
              <button 
                class="btn btn-secondary flex-1" 
                @click="backupDislikes"
                v-t="'actions.export'"
              >
                صدور
              </button>
              <button 
                class="btn btn-info flex-1" 
                @click="importDislikes"
                v-t="'actions.import'"
              >
                ورود
              </button>
            </div>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:gear text-blue-500 ml-2"></i>
              <span v-t="'titles.preferences'">تنظیمات</span>
            </h3>
            <div class="flex gap-2">
              <button
                class="btn btn-secondary flex-1"
                @click="backupPreferences"
                v-t="'actions.export'"
              >
                صدور
              </button>
              <button
                class="btn btn-info flex-1"
                @click="importPreferences"
                v-t="'actions.import'"
              >
                ورود
              </button>
            </div>
            <div class="mt-2">
              <button
                class="btn btn-warning w-full"
                @click="showConfirmResetPreferences = true"
                v-t="'actions.restore_preferences'"
              >
                بازگرداندن تنظیمات به حالت پیش
              </button>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2" v-t="'info.reset_preferences_description'">
                تمام تنظیمات شخصی‌سازی شده را به مقادیر پیش‌فرض بازنشانی می‌کند.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Restore Section -->
      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
        <h2 class="text-xl font-bold mb-4" v-t="'titles.restore_data'">بازیابی داده‌ها</h2>
        
        <div class="space-y-4">
          <div class="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:upload text-blue-500 ml-2"></i>
              <span v-t="'actions.restore_all'">بازیابی همه</span>
            </h3>
            <p class="text-sm text-blue-800 dark:text-blue-200 mb-3" v-t="'info.restore_warning'">
              این کار تمام داده‌های فعلی شما را با داده‌های پشتیبان جایگزین می‌کند.
            </p>
            <button 
              class="btn btn-info w-full" 
              @click="restoreAllData"
              v-t="'actions.restore_data'"
            >
              بازیابی همه داده‌ها
            </button>
          </div>
          
          <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:folder-open text-blue-500 ml-2"></i>
              <span v-t="'info.information'">راهنمای استفاده</span>
            </h3>
            <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li v-t="'info.backup_instructions_1'">1. برای پشتیبان‌گیری، دکمه مربوطه را کلیک کنید</li>
              <li v-t="'info.backup_instructions_2'">2. برای ورود داده، دکمه ورود را کلیک کرده و فایل پشتیبان را انتخاب کنید</li>
              <li v-t="'info.backup_instructions_3'">3. داده‌ها به صورت محلی در مرورگر شما ذخیره می‌شوند</li>
              <li v-t="'info.backup_instructions_4'">4. داده‌ها در فرمت JSON خواهند بود</li>
            </ul>
          </div>
          
          <div class="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 class="font-semibold mb-2 flex items-center">
              <i class="i-fa6-solid:exclamation-triangle text-yellow-500 ml-2"></i>
              <span v-t="'info.note'">توجه</span>
            </h3>
            <p class="text-sm text-yellow-800 dark:text-yellow-200" v-t="'info.backup_restore_note'">
              مطمئن شوید از فایل‌های معتبر و ایمن استفاده می‌کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Data Summary Section -->
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.data_summary'">خلاصه داده‌ها</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg text-center">
          <i class="i-fa6-solid:rss text-2xl text-blue-500 block mb-2"></i>
          <p class="font-semibold" v-t="'titles.subscriptions'">اشتراک‌ها</p>
          <p class="text-2xl font-bold" v-text="subscriptionCount"></p>
        </div>
        
        <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg text-center">
          <i class="i-fa6-solid:clock-rotate-left text-2xl text-green-500 block mb-2"></i>
          <p class="font-semibold" v-t="'titles.history'">تاریخچه</p>
          <p class="text-2xl font-bold" v-text="historyCount"></p>
        </div>

        <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg text-center">
          <i class="i-fa6-solid:thumbs-up text-2xl text-indigo-500 block mb-2"></i>
          <p class="font-semibold" v-t="'actions.likes'">پسندیده‌ها</p>
          <p class="text-2xl font-bold" v-text="likesCount"></p>
        </div>

        <div class="bg-gray-100 dark:bg-dark-500 p-4 rounded-lg text-center">
          <i class="i-fa6-solid:thumbs-down text-2xl text-red-500 block mb-2"></i>
          <p class="font-semibold" v-t="'actions.dislikes'">نپسندیده‌ها</p>
          <p class="text-2xl font-bold" v-text="dislikesCount"></p>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmResetPreferences"
      :message="$t('actions.confirm_reset_preferences')"
      @confirm="resetPreferences"
      @close="showConfirmResetPreferences = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "DataManagement",
  components: {
    ConfirmModal
  },
  data() {
    return {
      subscriptionCount: 0,
      historyCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      showConfirmResetPreferences: false,
    };
  },
  async mounted() {
    document.title = this.$t("titles.data_management") + " - " + this.getSiteName();
    await this.updateCounts();
  },
  methods: {
    async updateCounts() {
      // Get subscription count
      const subs = this.getLocalSubscriptions() || [];
      this.subscriptionCount = Array.isArray(subs) ? subs.length : 0;

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
    getLocalSubscriptions() {
      const subs = localStorage.getItem("localSubscriptions");
      return subs ? JSON.parse(subs) : [];
    },
    async backupAllData() {
      try {
        const data = {
          subscriptions: this.getLocalSubscriptions() || [],
          history: await this.getHistoryData(),
          likes: JSON.parse(localStorage.getItem("likes") || "[]"),
          dislikes: JSON.parse(localStorage.getItem("dislikes") || "[]"),
          preferences: this.getAllPreferences(),
          timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `piped_backup_${this.getTimestamp()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان با موفقیت ایجاد شد');
      } catch (error) {
        console.error("Backup all error:", error);
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
                    if (key.startsWith('pref_')) {
                      localStorage.setItem(key, data.preferences[key]);
                    }
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
                  if (key.startsWith('pref_')) {
                    localStorage.setItem(key, data[key]);
                  }
                });
                break;
            }

            this.showToast(this.$t('info.import_success') || 'داده‌ها با موفقیت وارد شدند');
            await this.updateCounts(); // Refresh the counts
          } catch (error) {
            console.error("Import error:", error);
            this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن داده‌ها');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    async importHistoryData(historyData) {
      if (!window.db) return;

      const clearTx = window.db.transaction("watch_history", "readwrite");
      const clearStore = clearTx.objectStore("watch_history");
      clearStore.clear();

      clearTx.oncomplete = () => {
        const addTx = window.db.transaction("watch_history", "readwrite");
        const addStore = addTx.objectStore("watch_history");

        historyData.forEach(item => {
          addStore.add(item);
        });

        addTx.oncomplete = () => {
          this.showToast(this.$t('info.history_imported_successfully') || 'تاریخچه با موفقیت وارد شد');
        };

        addTx.onerror = (e) => {
          console.error("Error importing history:", e);
          this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن تاریخچه');
        };
      };

      clearTx.onerror = (e) => {
        console.error("Error clearing history:", e);
        this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن تاریخچه');
      };
    },
    backupSubscriptions() {
      const subs = this.getLocalSubscriptions() || [];
      const data = JSON.stringify(subs, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piped_subscriptions_${this.getTimestamp()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان اشتراک‌ها ایجاد شد');
    },
    backupHistory() {
      if (window.db) {
        this.getHistoryData().then(historyData => {
          const data = JSON.stringify(historyData, null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `piped_history_${this.getTimestamp()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان تاریخچه ایجاد شد');
        }).catch(e => {
          console.error("Backup history error:", e);
          this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان تاریخچه');
        });
      } else {
        this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
      }
    },
    backupLikes() {
      const likes = JSON.parse(localStorage.getItem("likes") || "[]");
      const data = JSON.stringify(likes, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piped_likes_${this.getTimestamp()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان پسندیده‌ها ایجاد شد');
    },
    backupDislikes() {
      const dislikes = JSON.parse(localStorage.getItem("dislikes") || "[]");
      const data = JSON.stringify(dislikes, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piped_dislikes_${this.getTimestamp()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان نپسندیده‌ها ایجاد شد');
    },
    backupPreferences() {
      const prefs = this.getAllPreferences();
      const data = JSON.stringify(prefs, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piped_preferences_${this.getTimestamp()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان تنظیمات ایجاد شد');
    },
    importSubscriptions() {
      this.importData('subscriptions');
    },
    importHistory() {
      this.importData('history');
    },
    importLikes() {
      this.importData('likes');
    },
    importDislikes() {
      this.importData('dislikes');
    },
    importPreferences() {
      this.importData('preferences');
    },
    restoreAllData() {
      this.importData('all');
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
        console.error("Reset preferences error:", error);
        this.showToast(this.$t('info.reset_error') || 'خطا در بازنشانی تنظیمات');
      }
    },
    getTimestamp() {
      return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
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
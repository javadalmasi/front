<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary mr-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.history'">تاریخچه تماشا</h1>
    </div>

    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <button class="btn btn-danger" @click="showConfirmClearDialog = true" v-t="'actions.clear_history'">
          پاک کردن همه
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2">
          <input
            id="autoDelete"
            v-model="autoDeleteHistory"
            type="checkbox"
            @change="onChange"
          />
          <span v-t="'actions.auto_delete_watch_history'">حذف خودکار تاریخچه</span>
        </label>

        <div v-if="autoDeleteHistory" class="flex items-center gap-2">
          <label v-t="'info.auto_delete_after'">حذف پس از</label>
          <input
            v-model="autoDeleteDelayHours"
            type="number"
            min="1"
            class="input w-24"
            @change="onChange"
          />
          <span v-t="'info.hours'">ساعت</span>
        </div>
      </div>
    </div>

    <div v-if="videos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="video in videos"
        :key="video.videoId"
        class="bg-gray-200 dark:bg-dark-400 rounded-xl shadow p-4 relative group"
      >
        <router-link :to="'/watch?v=' + video.videoId">
          <div class="relative">
            <img
              :src="getCDNThumbnailUrl(video.thumbnail)"
              :alt="video.title"
              class="w-full aspect-video object-cover rounded-lg"
              @error="$event.target.src = '/img/placeholder-video-thumbnail.webp'"
            />
            <div
              v-if="video.watchedAt"
              class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
            >
              {{ formatDate(video.watchedAt) }}
            </div>
          </div>
          <div class="mt-2">
            <h3 class="font-bold line-clamp-2" v-text="video.title"></h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" v-text="video.channelName"></p>
          </div>
        </router-link>

        <button
          class="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removeFromHistory(video.videoId)"
          title="Remove from history"
        >
          <i class="i-fa6-solid:xmark"></i>
        </button>
      </div>
    </div>
    <div v-else class="text-center py-10">
      <h2 class="text-xl font-bold mb-2" v-t="'info.no_history'">تاریخچه‌ای وجود ندارد</h2>
      <p
        class="mb-4"
        v-if="!getPreferenceBoolean('watchHistory', true)"
        v-t="'info.history_desc'"
      >
        ویدیوهای تماشا شده در اینجا ظاهر می‌شوند. تاریخچه تماشا را در تنظیمات فعال کنید تا تاریخچه تماشای خود را ذخیره کنید.
      </p>
      <p
        class="mb-4"
        v-else
        v-t="'info.no_videos_in_history'"
      >
        شما هنوز هیچ ویدیویی را تماشا نکرده‌اید.
      </p>
      <router-link
        v-if="!getPreferenceBoolean('watchHistory', true)"
        to="/user/gust/preferences"
        class="btn btn-primary"
        v-t="'actions.enable_watch_history'"
      >
      </router-link>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmClearDialog"
      :message="$t('actions.confirm_clear_history')"
      @confirm="clearHistory"
      @close="showConfirmClearDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
import { getOptimalThumbnailUrl } from '../utils/ThumbnailUtils.js';

export default {
  name: "UserHistory",
  components: {
    ConfirmModal
  },
  data() {
    return {
      videos: [],
      showConfirmClearDialog: false,
      autoDeleteHistory: false,
      autoDeleteDelayHours: "24",
    };
  },
  async mounted() {
    document.title = this.$t("titles.history") + " - " + this.getSiteName();

    this.autoDeleteHistory = this.getPreferenceBoolean("autoDeleteWatchHistory", false);
    this.autoDeleteDelayHours = this.getPreferenceString("autoDeleteWatchHistoryDelayHours", "24");

    // Initialize to empty array to prevent any undefined issues
    this.videos = [];

    // Use local IndexedDB history
    if (window.db && this.getPreferenceBoolean("watchHistory", true)) {
      try {
        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        const index = store.index("watchedAt");

        const request = index.openCursor(null, "prev");
        const videos = []; // Local temporary array to collect videos

        request.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            const video = cursor.value;
            if (!video.error) {
              videos.push({
                videoId: video.videoId,
                title: video.title,
                channelName: video.uploaderName,
                thumbnail: video.thumbnail,
                watchedAt: video.watchedAt
              });
            }
            cursor.continue();
          } else {
            // Assign collected videos to component's data
            this.videos = videos;
          }
        };

        // Add error handler for proper debugging
        request.onerror = e => {
          console.error("Error accessing history from IndexedDB:", e.target.error);
          this.videos = []; // Ensure it's reset even if there's an error
        };
      } catch (error) {
        console.error("Error accessing IndexedDB:", error);
        this.videos = [];
      }
    }
  },
  methods: {
    getCDNThumbnailUrl(thumbnail) {
      if (!thumbnail) return thumbnail; // Return as is if null/undefined

      // Check if thumbnail is already a full URL
      if (thumbnail.startsWith('http')) {
        return getOptimalThumbnailUrl(thumbnail, { type: 'general' });
      }
      // If it's a relative path, return as is
      return thumbnail;
    },
    removeFromHistory(videoId) {
      if (window.db) {
        const tx = window.db.transaction("watch_history", "readwrite");
        const store = tx.objectStore("watch_history");
        store.delete(videoId);

        // Remove from UI as well
        this.videos = this.videos.filter(video => video.videoId !== videoId);
        this.showToast(this.$t('info.video_removed_from_history') || 'ویدیو از تاریخچه حذف شد');
      }
    },
    async clearHistory() {
      if (window.db) {
        const tx = window.db.transaction("watch_history", "readwrite");
        const store = tx.objectStore("watch_history");
        store.clear();
        this.videos = [];
        this.showToast(this.$t('info.history_cleared') || 'تاریخچه پاک شد');
      }
    },
    onChange() {
      this.setPreference("autoDeleteWatchHistory", this.autoDeleteHistory);
      this.setPreference("autoDeleteWatchHistoryDelayHours", this.autoDeleteDelayHours);

      if (!this.autoDeleteHistory) return false;
    },
    backupHistory() {
      try {
        // Fetch all history records from IndexedDB
        if (!window.db) {
          this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
          return;
        }

        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        const request = store.getAll();

        request.onsuccess = () => {
          const historyData = request.result;
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

          const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `history_backup_${timestamp}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان تاریخچه ایجاد شد');
        };

        request.onerror = (e) => {
          console.error("Error getting history data:", e);
          this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان');
        };
      } catch (error) {
        console.error("Backup error:", error);
        this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان');
      }
    },
    importHistory() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const historyData = JSON.parse(e.target.result);

            if (!window.db) {
              this.showToast(this.$t('info.no_db_available') || 'پایگاه داده در دسترس نیست');
              return;
            }

            // Clear existing history first
            const clearTx = window.db.transaction("watch_history", "readwrite");
            const clearStore = clearTx.objectStore("watch_history");
            clearStore.clear();

            clearTx.oncomplete = () => {
              // Add new history data
              const addTx = window.db.transaction("watch_history", "readwrite");
              const addStore = addTx.objectStore("watch_history");

              historyData.forEach(video => {
                addStore.add(video);
              });

              addTx.oncomplete = () => {
                // Refresh the UI
                this.videos = historyData.map(video => ({
                  videoId: video.videoId,
                  title: video.title,
                  channelName: video.uploaderName,
                  thumbnail: video.thumbnail,
                  watchedAt: video.watchedAt
                }));

                this.showToast(this.$t('info.import_success') || 'تاریخچه با موفقیت وارد شد');
              };

              addTx.onerror = (e) => {
                console.error("Error adding history data:", e);
                this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن تاریخچه');
              };
            };

            clearTx.onerror = (e) => {
              console.error("Error clearing history:", e);
              this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن تاریخچه');
            };
          } catch (error) {
            console.error("Import error:", error);
            this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن تاریخچه');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    formatDate(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      return date.toLocaleDateString(this.$i18n.locale || 'fa', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
    setPreference(key, value) {
      // This would typically be a method to set preferences
      // In the context of the app, it would likely use localStorage
      localStorage.setItem(`pref_${key}`, value);
    },
    getPreferenceBoolean(key, defaultValue) {
      const value = localStorage.getItem(`pref_${key}`);
      if (value === null) return defaultValue;
      return value === "true";
    },
    getPreferenceString(key, defaultValue = "") {
      const value = localStorage.getItem(`pref_${key}`);
      return value !== null ? value : defaultValue;
    }
  }
};
</script>
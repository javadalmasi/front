<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary ml-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.history'">تاریخچه</h1>
    </div>

    <!-- Tabs for Video History, Search History and Channel History -->
    <div class="flex border-b border-gray-200 dark:border-dark-100 mb-6">
      <button
        :class="['tab', { 'active': activeTab === 'videos' }]"
        @click="activeTab = 'videos'"
        v-t="'titles.watch_history'"
      >
        تاریخچه ویدیوها
      </button>
      <button
        :class="['tab', { 'active': activeTab === 'searches' }]"
        @click="activeTab = 'searches'"
        v-t="'titles.search_history'"
      >
        تاریخچه جستجوها
      </button>
      <button
        :class="['tab', { 'active': activeTab === 'channels' }]"
        @click="activeTab = 'channels'"
        v-t="'titles.channel_history'"
      >
        تاریخچه کانال‌ها
      </button>
    </div>

    <!-- Video History Tab -->
    <div v-if="activeTab === 'videos'">
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
                @error="onImageError"
              />
              <div
                v-if="video.watchedAt"
                class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
              >
                {{ formatDate(video.watchedAt) }}
              </div>
            </div>
            <div class="mt-2">
              <div class="font-medium text-[14px] leading-6 line-clamp-2" v-text="video.title"></div>
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
    </div>

    <!-- Search History Tab -->
    <div v-if="activeTab === 'searches'">
      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
        <div class="flex flex-wrap gap-4 mb-4">
          <button class="btn btn-danger" @click="showConfirmClearSearchDialog = true" v-t="'actions.clear_search_history'">
            پاک کردن تاریخچه جستجو
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2">
            <input
              id="autoDeleteSearch"
              v-model="autoDeleteSearchHistory"
              type="checkbox"
              @change="onAutoDeleteSearchHistoryChange"
            />
            <span v-t="'actions.auto_delete_search_history'">حذف خودکار تاریخچه جستجو</span>
          </label>

          <div v-if="autoDeleteSearchHistory" class="flex flex-wrap items-center gap-2">
            <label v-t="'info.auto_delete_after'">حذف پس از</label>
            <input
              v-model="autoDeleteSearchHistoryDelayHours"
              type="number"
              min="1"
              class="input w-24"
              @change="onAutoDeleteSearchHistoryChange"
            />
            <span v-t="'info.hours'">ساعت</span>
          </div>
        </div>

        <div v-if="autoDeleteSearchHistory" class="flex flex-wrap items-center gap-4 mt-4">
          <label class="flex items-center gap-2">
            <span v-t="'actions.auto_delete_search_history_count'">یا حذف بیش از</span>
          </label>
          <div class="flex flex-wrap items-center gap-2">
            <input
              v-model="autoDeleteSearchHistoryMaxCount"
              type="number"
              min="50"
              class="input w-24"
              @change="onAutoDeleteSearchHistoryChange"
            />
            <span v-t="'info.items'">مورد</span>
          </div>
        </div>
      </div>

      <div v-if="searchHistory.length > 0" class="space-y-4">
        <div
          v-for="(searchItem, index) in searchHistory"
          :key="index"
          class="bg-gray-200 dark:bg-dark-400 rounded-xl shadow p-4 relative group flex justify-between items-center"
        >
          <router-link :to="`/results?search_query=${encodeURIComponent(searchItem.query)}`" class="flex-1">
            <div class="font-medium text-[16px] leading-6" v-text="searchItem.query"></div>
            <div class="text-xs text-gray-500 mt-1" v-text="new Date(searchItem.timestamp).toLocaleString()"></div>
          </router-link>

          <button
            class="delete-search-item bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2"
            @click="removeFromSearchHistory(searchItem.query)"
            title="Remove from search history"
          >
            <i class="i-fa6-solid:trash"></i>
          </button>
        </div>

      </div>
      <div v-else class="text-center py-10">
        <h2 class="text-xl font-bold mb-2" v-t="'info.no_search_history'">تاریخچه جستجویی وجود ندارد</h2>
        <p class="mb-4" v-t="'info.no_searches_in_history'">
          جستجوهای شما در اینجا ظاهر می‌شوند.
        </p>
      </div>
    </div>

    <!-- Channel History Tab -->
    <div v-if="activeTab === 'channels'">
      <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
        <div class="flex flex-wrap gap-4 mb-4">
          <button class="btn btn-danger" @click="showConfirmClearChannelDialog = true" v-t="'actions.clear_channel_history'">
            پاک کردن همه
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2">
            <input
              id="autoDeleteChannel"
              v-model="autoDeleteChannelHistory"
              type="checkbox"
              @change="onAutoDeleteChannelHistoryChange"
            />
            <span v-t="'actions.auto_delete_channel_history'">حذف خودکار تاریخچه کانال</span>
          </label>

          <div v-if="autoDeleteChannelHistory" class="flex items-center gap-2">
            <label v-t="'info.auto_delete_after'">حذف پس از</label>
            <input
              v-model="autoDeleteChannelHistoryDelayHours"
              type="number"
              min="1"
              class="input w-24"
              @change="onAutoDeleteChannelHistoryChange"
            />
            <span v-t="'info.hours'">ساعت</span>
          </div>
        </div>
      </div>

      <div v-if="channels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="channel in channels"
          :key="channel.channelId"
          class="bg-gray-200 dark:bg-dark-400 rounded-xl shadow p-4 relative group"
        >
          <router-link :to="channel.url">
            <div class="flex items-center">
              <img
                :src="channel.avatar"
                :alt="channel.name"
                class="w-16 h-16 rounded-full object-cover"
                @error="onImageError"
              />
              <div class="mr-3">
                <div class="font-medium text-[14px] leading-6 line-clamp-2" v-text="channel.name"></div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1" v-text="formatDate(channel.visitedAt)"></p>
              </div>
            </div>
          </router-link>

          <button
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeFromChannelHistory(channel.channelId)"
            title="Remove from channel history"
          >
            <i class="i-fa6-solid:xmark"></i>
          </button>
        </div>
      </div>
      <div v-else class="text-center py-10">
        <h2 class="text-xl font-bold mb-2" v-t="'info.no_channel_history'">تاریخچه کانالی وجود ندارد</h2>
        <p
          class="mb-4"
          v-if="!getPreferenceBoolean('channelHistory', true)"
          v-t="'info.channel_history_desc'"
        >
          بازدیدهای شما از کانال‌ها در اینجا ظاهر می‌شوند. تاریخچه کانال را در تنظیمات فعال کنید تا بازدیدهای خود از کانال‌ها را ذخیره کنید.
        </p>
        <p
          class="mb-4"
          v-else
          v-t="'info.no_channels_in_history'"
        >
          شما هنوز از هیچ کانالی بازدید نکرده‌اید.
        </p>
        <router-link
          v-if="!getPreferenceBoolean('channelHistory', true)"
          to="/user/gust/preferences"
          class="btn btn-primary"
          v-t="'actions.enable_channel_history'"
        >
        </router-link>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <ConfirmModal
      v-if="showConfirmClearDialog"
      :message="$t('actions.confirm_clear_history')"
      @confirm="clearHistory"
      @close="showConfirmClearDialog = false"
    />

    <ConfirmModal
      v-if="showConfirmClearSearchDialog"
      :message="$t('actions.confirm_clear_search_history')"
      @confirm="clearSearchHistory"
      @close="showConfirmClearSearchDialog = false"
    />

    <ConfirmModal
      v-if="showConfirmClearChannelDialog"
      :message="$t('actions.confirm_clear_channel_history')"
      @confirm="clearChannelHistory"
      @close="showConfirmClearChannelDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
import { getOptimalThumbnailUrl, transformThumbnailUrl, getProgressiveThumbnailUrls } from '../utils/ThumbnailUtils.js';

export default {
  name: "UserHistory",
  components: {
    ConfirmModal
  },
  data() {
    return {
      videos: [],
      searchHistory: [],
      channels: [],
      activeTab: 'videos', // Default to videos tab
      showConfirmClearDialog: false,
      showConfirmClearSearchDialog: false,
      showConfirmClearChannelDialog: false,
      autoDeleteHistory: false,
      autoDeleteDelayHours: 24,
      autoDeleteSearchHistory: false,
      autoDeleteSearchHistoryDelayHours: 24,
      autoDeleteSearchHistoryMaxCount: 50,
      autoDeleteChannelHistory: false,
      autoDeleteChannelHistoryDelayHours: 24,
    };
  },
  async mounted() {
    document.title = this.$t("titles.history") + " - " + this.getSiteName();

    this.autoDeleteHistory = this.getPreferenceBoolean("autoDeleteWatchHistory", false);
    this.autoDeleteDelayHours = parseInt(this.getPreferenceString("autoDeleteWatchHistoryDelayHours", "24"));
    this.autoDeleteSearchHistory = this.getPreferenceBoolean("autoDeleteSearchHistory", false);
    this.autoDeleteSearchHistoryDelayHours = parseInt(this.getPreferenceString("autoDeleteSearchHistoryDelayHours", "24"));
    this.autoDeleteSearchHistoryMaxCount = parseInt(this.getPreferenceString("autoDeleteSearchHistoryMaxCount", "50"));
    this.autoDeleteChannelHistory = this.getPreferenceBoolean("autoDeleteChannelHistory", false);
    this.autoDeleteChannelHistoryDelayHours = parseInt(this.getPreferenceString("autoDeleteChannelHistoryDelayHours", "24"));

    // Initialize to empty array to prevent any undefined issues
    this.videos = [];
    this.channels = [];
    const rawSearchHistory = this.getSearchHistory();
    // Convert to new format if needed
    this.searchHistory = rawSearchHistory.map(item =>
      typeof item === 'string' ? { query: item, timestamp: new Date().toISOString() } : item
    );

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

    // Load channel history from IndexedDB
    if (this.getPreferenceBoolean("channelHistory", true)) {
      this.loadChannelHistory();
    }
  },
  watch: {
    // Watch for changes in localStorage search history and update component data
    '$route'() {
      // Update search history when the route changes to keep it in sync
      const rawSearchHistory = this.getSearchHistory();
      this.searchHistory = rawSearchHistory.map(item =>
        typeof item === 'string' ? { query: item, timestamp: new Date().toISOString() } : item
      );
    }
  },
  methods: {
    getCDNThumbnailUrl(thumbnail) {
      if (!thumbnail) return thumbnail; // Return as is if null/undefined

      // Check if thumbnail is already a full URL or a relative path that needs transformation
      // Handle both absolute URLs and relative paths like /vi_webp/{id}/maxresdefault.webp?host=i.ytimg.com
      if (thumbnail.startsWith('http') || thumbnail.startsWith('/vi_webp/')) {
        // Use the progressive loading approach for history view
        const progressiveUrls = getProgressiveThumbnailUrls(thumbnail, {
          type: 'general'
        });
        return progressiveUrls.optimizedUrl; // Return the optimized URL for history view
      }
      // If it's another type of relative path, return as is
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
      this.setPreference("autoDeleteWatchHistoryDelayHours", this.autoDeleteDelayHours.toString());

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
    },
    // New methods for search history
    getSearchHistory() {
      try {
        const history = localStorage.getItem("search_history");
        const parsedHistory = history ? JSON.parse(history) : [];

        // If the history is in the old format (just strings), convert it to the new format
        if (parsedHistory.length > 0 && typeof parsedHistory[0] === 'string') {
          return parsedHistory.map(query => ({
            query: query,
            timestamp: new Date().toISOString() // Use current timestamp for old entries
          }));
        }

        return parsedHistory;
      } catch {
        return [];
      }
    },
    removeFromSearchHistory(searchItem) {
      try {
        let searchHistory = this.getSearchHistory();
        searchHistory = searchHistory.filter(item => item.query !== searchItem);
        localStorage.setItem("search_history", JSON.stringify(searchHistory));
        this.searchHistory = searchHistory;
        this.showToast(this.$t('info.search_removed_from_history') || 'جستجو از تاریخچه حذف شد');
      } catch (error) {
        console.error("Error removing from search history:", error);
      }
    },
    clearSearchHistory() {
      try {
        localStorage.removeItem("search_history");
        this.searchHistory = [];
        this.showToast(this.$t('info.search_history_cleared') || 'تاریخچه جستجو پاک شد');
      } catch (error) {
        console.error("Error clearing search history:", error);
      }
    },
    onAutoDeleteSearchHistoryChange() {
      this.setPreference("autoDeleteSearchHistory", this.autoDeleteSearchHistory);
      this.setPreference("autoDeleteSearchHistoryDelayHours", this.autoDeleteSearchHistoryDelayHours.toString());
      this.setPreference("autoDeleteSearchHistoryMaxCount", this.autoDeleteSearchHistoryMaxCount);

      // Apply auto-delete immediately if enabled
      if (this.autoDeleteSearchHistory) {
        this.applyAutoDeleteSearchHistory();
      }
    },
    applyAutoDeleteSearchHistory() {
      try {
        let searchHistory = this.getSearchHistory();

        // Apply time-based deletion
        if (this.autoDeleteSearchHistory) {
          const maxTimeDiff = Number(this.autoDeleteSearchHistoryDelayHours) * 60 * 60 * 1000;
          searchHistory = searchHistory.filter(item => {
            const itemTime = new Date(item.timestamp).getTime();
            return Date.now() - itemTime <= maxTimeDiff;
          });
        }

        // Apply count-based deletion
        if (searchHistory.length > this.autoDeleteSearchHistoryMaxCount) {
          // Keep only the most recent items up to the max count
          searchHistory = searchHistory.slice(0, this.autoDeleteSearchHistoryMaxCount);
        }

        // Save the filtered history
        localStorage.setItem("search_history", JSON.stringify(searchHistory));
        this.searchHistory = searchHistory;
      } catch (error) {
        console.error("Error applying auto-delete to search history:", error);
      }
    },
    onImageError(event) {
      // Don't use placeholder images - just let the image fail gracefully
      console.warn("History thumbnail failed to load:", event.target.src);
    },
    async loadChannelHistory() {
      // Wait for database to be ready
      if (!window.db) {
        // If IndexedDB is not available in this browser
        if (!("indexedDB" in window)) {
          console.warn("IndexedDB not supported in this browser");
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
              console.warn("Database not ready after waiting, skipping channel history load");
              resolve();
            }
          };

          checkDb();
        });
      }

      // Check if we have access to the database
      if (!window.db) {
        console.error("Database not available for channel history");
        return;
      }

      // Check if the channel_history store exists
      if (!window.db.objectStoreNames.contains("channel_history")) {
        console.error("channel_history object store does not exist");
        return;
      }

      try {
        const tx = window.db.transaction("channel_history", "readonly");
        const store = tx.objectStore("channel_history");
        const index = store.index("visitedAt");

        const request = index.openCursor(null, "prev");
        const channels = []; // Local temporary array to collect channels

        request.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            const channel = cursor.value;
            channels.push({
              channelId: channel.channelId,
              name: channel.name,
              avatar: channel.avatar,
              url: channel.url,
              visitedAt: channel.visitedAt
            });
            cursor.continue();
          } else {
            // Assign collected channels to component's data
            this.channels = channels;
          }
        };

        // Add error handler for proper debugging
        request.onerror = e => {
          console.error("Error accessing channel history from IndexedDB:", e.target.error);
          this.channels = []; // Ensure it's reset even if there's an error
        };
      } catch (error) {
        console.error("Error accessing channel history IndexedDB:", error);
        this.channels = [];
      }
    },
    removeFromChannelHistory(channelId) {
      if (window.db) {
        const tx = window.db.transaction("channel_history", "readwrite");
        const store = tx.objectStore("channel_history");
        store.delete(channelId);

        // Remove from UI as well
        this.channels = this.channels.filter(channel => channel.channelId !== channelId);
        this.showToast(this.$t('info.channel_removed_from_history') || 'کانال از تاریخچه حذف شد');
      }
    },
    async clearChannelHistory() {
      if (window.db) {
        const tx = window.db.transaction("channel_history", "readwrite");
        const store = tx.objectStore("channel_history");
        store.clear();
        this.channels = [];
        this.showToast(this.$t('info.channel_history_cleared') || 'تاریخچه کانال پاک شد');
      }
    },
    onAutoDeleteChannelHistoryChange() {
      this.setPreference("autoDeleteChannelHistory", this.autoDeleteChannelHistory);
      this.setPreference("autoDeleteChannelHistoryDelayHours", this.autoDeleteChannelHistoryDelayHours.toString());

      // Apply auto-delete immediately if enabled
      if (this.autoDeleteChannelHistory) {
        this.applyAutoDeleteChannelHistory();
      }
    },
    applyAutoDeleteChannelHistory() {
      try {
        if (!window.db) return;

        // Apply time-based deletion
        if (this.autoDeleteChannelHistory) {
          const maxTimeDiff = Number(this.autoDeleteChannelHistoryDelayHours) * 60 * 60 * 1000;
          const cutoffTime = Date.now() - maxTimeDiff;

          const tx = window.db.transaction("channel_history", "readwrite");
          const store = tx.objectStore("channel_history");
          const index = store.index("visitedAt");

          const request = index.openCursor();
          request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const channel = cursor.value;
              const channelTime = new Date(channel.visitedAt).getTime();

              if (channelTime < cutoffTime) {
                // Delete this channel entry
                cursor.delete();
              }
              cursor.continue();
            } else {
              // Refresh the UI after deletion
              this.channels = this.channels.filter(channel => {
                const channelTime = new Date(channel.visitedAt).getTime();
                return channelTime >= cutoffTime;
              });
            }
          };
        }
      } catch (error) {
        console.error("Error applying auto-delete to channel history:", error);
      }
    },
  }
};
</script>

<style scoped>
.tab {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #6b7280;
    transition: color 0.2s;
}

.tab:hover {
    color: #374151;
}

.tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
}

.dark .tab {
    color: #9ca3af;
}

.dark .tab:hover {
    color: #d1d5db;
}

.dark .tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
}

.delete-search-item {
    opacity: 0;
    transition: opacity 0.2s;
}

.group:hover .delete-search-item {
    opacity: 1;
}
</style>
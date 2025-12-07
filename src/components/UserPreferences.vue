<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary mr-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.preferences'">تنظیمات</h1>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.appearance'">ظاهر</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="pref block mb-2" v-t="'actions.theme'">تم</label>
          <select 
            v-model="selectedTheme" 
            class="select w-full"
            @change="onChange"
          >
            <option value="dark" v-t="'actions.dark_theme'">تیره</option>
            <option value="light" v-t="'actions.light_theme'">روشن</option>
          </select>
        </div>
        
        <div>
          <label class="pref block mb-2" v-t="'actions.default_homepage'">صفحه اصلی پیش‌فرض</label>
          <select 
            v-model="defaultHomepage" 
            class="select w-full"
            @change="onChange"
          >
            <option value="trending" v-t="'titles.trending'">پرطرفدار</option>
            <option value="feed" v-t="'titles.feed'">فید</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.player'">پخش کننده</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="pref block mb-2" v-t="'actions.default_quality'">کیفیت پیش‌فرض</label>
          <select 
            v-model="defaultQuality" 
            class="select w-full"
            @change="onChange"
          >
            <option value="0" v-t="'actions.auto'">خودکار</option>
            <option value="144">144p</option>
            <option value="240">240p</option>
            <option value="360">360p</option>
            <option value="480">480p</option>
            <option value="720">720p</option>
            <option value="1080">1080p</option>
            <option value="1440">1440p</option>
            <option value="2160">2160p</option>
          </select>
        </div>
        
        <div>
          <label class="pref block mb-2" v-t="'actions.default_speed'">سرعت پیش‌فرض</label>
          <select 
            v-model="defaultSpeed" 
            class="select w-full"
            @change="onChange"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>
        
        <div class="flex items-center">
          <input 
            id="chkAutoplay" 
            v-model="autoplay" 
            type="checkbox" 
            class="checkbox mr-2"
            @change="onChange"
          />
          <label class="pref" for="chkAutoplay" v-t="'actions.autoplay'">پخش خودکار</label>
        </div>
        
        <div class="flex items-center">
          <input 
            id="chkMinimizeComments" 
            v-model="minimizeComments" 
            type="checkbox" 
            class="checkbox mr-2"
            @change="onChange"
          />
          <label class="pref" for="chkMinimizeComments" v-t="'actions.minimize_comments'">کوچک کردن دیدگاه‌ها</label>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.storage'">ذخیره‌سازی</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-center">
          <input 
            id="chkStoreWatchHistory" 
            v-model="watchHistory" 
            type="checkbox" 
            class="checkbox mr-2"
            @change="onChange"
          />
          <label class="pref" for="chkStoreWatchHistory" v-t="'actions.store_watch_history'">ذخیره تاریخچه تماشا</label>
        </div>
        
        <div class="flex items-center">
          <input 
            id="chkStoreSearchHistory" 
            v-model="searchHistory" 
            type="checkbox" 
            class="checkbox mr-2"
            @change="onChange"
          />
          <label class="pref" for="chkStoreSearchHistory" v-t="'actions.store_search_history'">ذخیره تاریخچه جستجو</label>
        </div>
        
        <div v-if="watchHistory" class="flex items-center">
          <input 
            id="chkHideWatched" 
            v-model="hideWatched" 
            type="checkbox" 
            class="checkbox mr-2"
            @change="onChange"
          />
          <label class="pref" for="chkHideWatched" v-t="'actions.hide_watched'">پنهان کردن تماشا شده‌ها</label>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.advanced'">پیشرفته</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="pref block mb-2" v-t="'actions.enabled_codecs'">کدک‌های فعال</label>
          <select 
            v-model="enabledCodecs" 
            class="select w-full"
            multiple
            @change="onChange"
          >
            <option value="vp9">VP9</option>
            <option value="avc">AVC (H.264)</option>
            <option value="av1">AV1</option>
          </select>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" v-t="'info.enabled_codecs_note'">
            چندین گزینه را با نگه داشتن کلید Ctrl (یا Cmd در مک) و کلیک انتخاب کنید
          </p>
        </div>
        
        <div>
          <label class="pref block mb-2" v-t="'actions.mobile_chapter_layout'">چیدمان فصل در موبایل</label>
          <select 
            v-model="mobileChapterLayout" 
            class="select w-full"
            @change="onChange"
          >
            <option value="Horizontal" v-t="'actions.horizontal'">افقی</option>
            <option value="Vertical" v-t="'actions.vertical'">عمودی</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-bold mb-4" v-t="'titles.data_management'">مدیریت داده‌ها</h2>
      
      <div class="flex flex-wrap gap-4">
        <button class="btn btn-secondary" @click="backupPreferences" v-t="'actions.backup_preferences'">
          پشتیبان‌گیری تنظیمات
        </button>
        <button class="btn btn-info" @click="restorePreferences" v-t="'actions.restore_preferences'">
          بازیابی تنظیمات
        </button>
        <input id="fileSelector" ref="fileSelector" class="hidden" type="file" @change="restorePreferences" />
      </div>
    </div>
    
    <div class="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl shadow border border-red-300 dark:border-red-700">
      <h2 class="text-xl font-bold mb-4 text-red-700 dark:text-red-300" v-t="'titles.danger_zone'">منطقه خطر</h2>
      
      <div class="flex flex-wrap gap-4">
        <button class="btn btn-danger" @click="showConfirmResetDialog = true" v-t="'actions.reset_preferences'">
          بازنشانی تنظیمات
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmResetDialog"
      :message="$t('actions.confirm_reset_preferences')"
      @confirm="resetPreferences"
      @close="showConfirmResetDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "UserPreferences",
  components: {
    ConfirmModal
  },
  data() {
    return {
      selectedTheme: "dark",
      defaultHomepage: "trending",
      watchHistory: true,
      searchHistory: false,
      hideWatched: false,
      minimizeComments: false,
      autoplay: true,
      defaultQuality: "0",
      defaultSpeed: "1.0",
      enabledCodecs: ["vp9", "avc"],
      mobileChapterLayout: "Vertical",
      showConfirmResetDialog: false,
    };
  },
  async mounted() {
    document.title = this.$t("titles.preferences") + " - " + this.getSiteName();
    
    // Load preferences from localStorage
    this.selectedTheme = this.getPreferenceString("theme", "dark");
    this.defaultHomepage = this.getPreferenceString("homepage", "trending");
    this.watchHistory = this.getPreferenceBoolean("watchHistory", true);
    this.searchHistory = this.getPreferenceBoolean("searchHistory", false);
    this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
    this.minimizeComments = this.getPreferenceBoolean("minimizeComments", false);
    this.autoplay = this.getPreferenceBoolean("autoplay", true);
    this.defaultQuality = this.getPreferenceString("defaultQuality", "0");
    this.defaultSpeed = this.getPreferenceString("defaultSpeed", "1.0");
    
    // Get codecs from preferences or default to vp9,avc
    let codecString = this.getPreferenceString("enabledCodecs", "vp9,avc");
    this.enabledCodecs = codecString.split(",").filter(c => c);
    
    this.mobileChapterLayout = this.getPreferenceString("mobileChapterLayout", "Vertical");
  },
  computed: {
    isWatchHistoryStorageDisabled() {
      return import.meta.env.VITE_DISABLE_WATCH_HISTORY_STORAGE === "true";
    },
    isSearchHistoryStorageDisabled() {
      return import.meta.env.VITE_DISABLE_SEARCH_HISTORY_STORAGE === "true";
    }
  },
  methods: {
    onChange() {
      // Update theme in real-time
      if (this.selectedTheme !== this.getPreferenceString("theme", "dark")) {
        this.applyTheme(this.selectedTheme);
      }
      
      // Save all preferences to localStorage
      this.setPreference("theme", this.selectedTheme);
      this.setPreference("homepage", this.defaultHomepage);
      this.setPreference("watchHistory", this.watchHistory);
      this.setPreference("searchHistory", this.searchHistory);
      this.setPreference("hideWatched", this.hideWatched);
      this.setPreference("minimizeComments", this.minimizeComments);
      this.setPreference("autoplay", this.autoplay);
      this.setPreference("defaultQuality", this.defaultQuality);
      this.setPreference("defaultSpeed", this.defaultSpeed);
      this.setPreference("enabledCodecs", this.enabledCodecs.join(","));
      this.setPreference("mobileChapterLayout", this.mobileChapterLayout);
      
      // Handle disabling search history
      if (!this.searchHistory) {
        localStorage.removeItem("search_history");
      }
    },
    setPreference(key, value) {
      localStorage.setItem(`pref_${key}`, value);
    },
    getPreferenceString(key, defaultValue = "") {
      const value = localStorage.getItem(`pref_${key}`);
      return value !== null ? value : defaultValue;
    },
    getPreferenceBoolean(key, defaultValue) {
      const value = localStorage.getItem(`pref_${key}`);
      if (value === null) return defaultValue;
      return value === "true";
    },
    applyTheme(theme) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      this.changeTitleBarColor(theme);
      this.updateFavicon(theme);
    },
    changeTitleBarColor(theme) {
      const currentColor = { dark: "#0F0F0F", light: "#FFF" };
      const themeColor = document.querySelector("meta[name='theme-color']");
      if (themeColor) {
        themeColor.setAttribute("content", currentColor[theme]);
      }
    },
    updateFavicon(theme) {
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        if (theme === "dark") {
          favicon.href = "/img/icons/dark-logo-32x32.png";
        } else {
          favicon.href = "/img/icons/light-logo-32x32.png";
        }
      }
    },
    resetPreferences() {
      // Clear all preference-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pref_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset to default values
      this.selectedTheme = "dark";
      this.defaultHomepage = "trending";
      this.watchHistory = true;
      this.searchHistory = false;
      this.hideWatched = false;
      this.minimizeComments = false;
      this.autoplay = true;
      this.defaultQuality = "0";
      this.defaultSpeed = "1.0";
      this.enabledCodecs = ["vp9", "avc"];
      this.mobileChapterLayout = "Vertical";
      
      // Apply theme change
      this.applyTheme("dark");
      
      this.showToast(this.$t('info.preferences_reset') || 'تنظیمات بازنشانی شدند');
    },
    backupPreferences() {
      const preferences = {};
      
      // Get all preference items from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pref_')) {
          preferences[key] = localStorage.getItem(key);
        }
      }
      
      const data = JSON.stringify(preferences, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "piped_preferences.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان تنظیمات ایجاد شد');
    },
    async restorePreferences() {
      if (event) { // Called from file input change
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const preferences = JSON.parse(e.target.result);
            
            // Save all preferences to localStorage
            Object.keys(preferences).forEach(key => {
              localStorage.setItem(key, preferences[key]);
            });
            
            // Reload the page to apply changes
            location.reload();
          } catch (error) {
            console.error("Restore error:", error);
            this.showToast(this.$t('info.restore_error') || 'خطا در بازیابی تنظیمات');
          }
        };
        reader.readAsText(file);
      } else { // Called from button click
        this.$refs.fileSelector.click();
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

<style scoped>
.pref {
  @apply flex items-center gap-2 cursor-pointer;
}

.select {
  @apply w-full md:w-64;
}
</style>
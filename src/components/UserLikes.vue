<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary mr-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'actions.likes'">پسند شده‌ها</h1>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <button class="btn btn-danger" @click="showConfirmClearDialog = true" v-t="'actions.clear_likes'">
          پاک کردن همه
        </button>
      </div>
      
      <div class="mb-4">
        <i18n-t keypath="info.liked_videos_count" tag="div" class="font-bold text-lg">
          {{ videos.length }}
        </i18n-t>
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
          </div>
          <div class="mt-2">
            <div class="font-medium text-[14px] leading-6 line-clamp-2" v-text="video.title"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" v-text="video.channelName"></p>
          </div>
        </router-link>
        
        <button 
          class="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removeFromLikes(video.videoId)"
          title="Remove from likes"
        >
          <i class="i-fa6-solid:xmark"></i>
        </button>
      </div>
    </div>
    <div v-else class="text-center py-10">
      <h2 class="text-xl font-bold mb-2" v-t="'info.no_likes'">ویدیوی پسند شده‌ای وجود ندارد</h2>
      <p class="mb-4" v-t="'info.no_likes_description'">شما هیچ ویدیویی را پسند نکرده‌اید.</p>
      <router-link to="/trending" class="btn btn-primary" v-t="'actions.discover_videos'">
        کشف ویدیوها
      </router-link>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmClearDialog"
      :message="$t('actions.confirm_clear_likes')"
      @confirm="clearLikes"
      @close="showConfirmClearDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";
import { getOptimalThumbnailUrl, transformThumbnailUrl } from '../utils/ThumbnailUtils.js';

export default {
  name: "UserLikes",
  components: {
    ConfirmModal
  },
  data() {
    return {
      videos: [],
      showConfirmClearDialog: false,
    };
  },
  async mounted() {
    document.title = this.$t("actions.likes") + " - " + this.getSiteName();
    await this.fetchLikes();
  },
  methods: {
    getCDNThumbnailUrl(thumbnail) {
      if (!thumbnail) return thumbnail; // Return as is if null/undefined

      // Check if thumbnail is already a full URL
      if (thumbnail.startsWith('http')) {
        // Use optimized dimensions 426x240 at quality 85 for like/dislike views
        return transformThumbnailUrl(thumbnail, {
          width: '426',
          height: '240',
          quality: 85,
          type: 'general'
        });
      }
      // If it's a relative path, return as is
      return thumbnail;
    },
    async fetchLikes() {
      try {
        const likes = JSON.parse(localStorage.getItem("likes") || "[]");
        this.videos = likes;
      } catch (error) {
        console.error("Error fetching likes:", error);
        this.showToast(this.$t('info.error_fetching_likes') || 'خطا در دریافت ویدیوهای پسند شده');
        this.videos = [];
      }
    },
    removeFromLikes(videoId) {
      try {
        let likes = JSON.parse(localStorage.getItem("likes") || "[]");
        likes = likes.filter(video => video.videoId !== videoId);
        localStorage.setItem("likes", JSON.stringify(likes));
        
        // Remove from UI as well
        this.videos = this.videos.filter(video => video.videoId !== videoId);
        this.showToast(this.$t('info.video_removed_from_likes') || 'ویدیو از پسند شده‌ها حذف شد');
      } catch (error) {
        console.error("Error removing from likes:", error);
        this.showToast(this.$t('info.error_removing_from_likes') || 'خطا در حذف از پسند شده‌ها');
      }
    },
    async clearLikes() {
      try {
        localStorage.removeItem("likes");
        this.videos = [];
        this.showToast(this.$t('info.likes_cleared') || 'همه پسند شده‌ها پاک شدند');
      } catch (error) {
        console.error("Error clearing likes:", error);
        this.showToast(this.$t('info.error_clearing_likes') || 'خطا در پاک کردن پسند شده‌ها');
      }
    },
    backupLikes() {
      try {
        const likes = JSON.parse(localStorage.getItem("likes") || "[]");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        const blob = new Blob([JSON.stringify(likes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `likes_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان پسند شده‌ها ایجاد شد');
      } catch (error) {
        console.error("Backup error:", error);
        this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان');
      }
    },
    importLikes() {
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
            localStorage.setItem("likes", JSON.stringify(data));
            await this.fetchLikes(); // Refresh the list
            this.showToast(this.$t('info.import_success') || 'پسند شده‌ها با موفقیت وارد شدند');
          } catch (error) {
            console.error("Import error:", error);
            this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن پسند شده‌ها');
          }
        };
        reader.readAsText(file);
      };
      input.click();
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
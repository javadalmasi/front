<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center mb-6">
      <router-link to="/user/gust" class="btn btn-secondary mr-4">
        <i class="i-fa6-solid:arrow-right"></i>
      </router-link>
      <h1 class="text-2xl font-bold" v-t="'titles.subscriptions'">اشتراک‌ها</h1>
    </div>
    
    <div class="bg-gray-200 dark:bg-dark-400 p-6 rounded-xl shadow mb-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <button class="btn btn-danger" @click="showConfirmClearDialog = true" v-t="'actions.clear_subscriptions'">
          پاک کردن همه
        </button>
      </div>
      
      <div class="mb-4">
        <i18n-t keypath="subscriptions.subscribed_channels_count" tag="div" class="font-bold text-lg">
          {{ subscriptions.length }}
        </i18n-t>
      </div>
    </div>

    <div v-if="subscriptions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="subscription in subscriptions" 
        :key="subscription.url || subscription.id" 
        class="bg-gray-200 dark:bg-dark-400 rounded-xl shadow p-4 flex items-center"
      >
        <img 
          :src="subscription.avatar" 
          :alt="subscription.name" 
          class="w-12 h-12 rounded-full object-contain ml-3"
          @error="$event.target.src = '/img/placeholder-channel-avatar.webp'"
        />
        <div class="flex-1 min-w-0">
          <router-link :to="'/channel/' + subscription.id" class="font-bold line-clamp-1 hover:underline">
            {{ subscription.name }}
          </router-link>
          <div class="text-sm text-gray-600 dark:text-gray-400 truncate">
            {{ subscription.subscriberCountText }}
          </div>
        </div>
        <button 
          class="btn btn-danger btn-sm" 
          @click="unsubscribe(subscription.id)"
          v-t="'actions.unsubscribe'"
        >
          لغو
        </button>
      </div>
    </div>
    <div v-else class="text-center py-10">
      <h2 class="text-xl font-bold mb-2" v-t="'info.no_subscriptions'">هیچ اشتراکی وجود ندارد</h2>
      <p class="mb-4" v-t="'info.no_subscriptions_description'">شما در هیچ چنلی عضو نشده‌اید.</p>
      <router-link to="/trending" class="btn btn-primary" v-t="'actions.discover_channels'">
        کشف چنل‌ها
      </router-link>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmClearDialog"
      :message="$t('actions.confirm_clear_subscriptions')"
      @confirm="clearSubscriptions"
      @close="showConfirmClearDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "UserSubscriptions",
  components: {
    ConfirmModal
  },
  data() {
    return {
      subscriptions: [],
      showConfirmClearDialog: false,
    };
  },
  async mounted() {
    document.title = this.$t("titles.subscriptions") + " - " + this.getSiteName();
    await this.fetchSubscriptions();
  },
  methods: {
    async fetchSubscriptions() {
      try {
        const localSubscriptions = this.getLocalSubscriptions() || [];
        if (!Array.isArray(localSubscriptions)) {
          this.subscriptions = [];
          return;
        }
        
        // If localSubscriptions contains objects (new format)
        if (localSubscriptions.length > 0 && typeof localSubscriptions[0] === 'object') {
          this.subscriptions = localSubscriptions;
        } 
        // If localSubscriptions contains strings (old format), convert to objects
        else if (localSubscriptions.length > 0 && typeof localSubscriptions[0] === 'string') {
          // For old format, we need to fetch channel information
          this.subscriptions = await Promise.all(localSubscriptions.map(async (id) => {
            // In a real implementation, this would fetch channel data from API
            return {
              id: id,
              name: id, // Placeholder name
              avatar: '/img/placeholder-channel-avatar.webp', // Default avatar
              subscriberCountText: 'N/A'
            };
          }));
        } else {
          this.subscriptions = [];
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        this.showToast(this.$t('info.error_fetching_subscriptions') || 'خطا در دریافت اشتراک‌ها');
        this.subscriptions = [];
      }
    },
    getLocalSubscriptions() {
      const subs = localStorage.getItem("localSubscriptions");
      return subs ? JSON.parse(subs) : [];
    },
    async unsubscribe(channelId) {
      try {
        let localSubscriptions = this.getLocalSubscriptions();
        localSubscriptions = localSubscriptions.filter(sub => 
          (typeof sub === 'object' ? sub.id : sub) !== channelId
        );
        
        localStorage.setItem("localSubscriptions", JSON.stringify(localSubscriptions));
        await this.fetchSubscriptions(); // Refresh the list
        this.showToast(this.$t('info.unsubscribed_successfully') || 'عضویت لغو شد');
      } catch (error) {
        console.error("Error unsubscribing:", error);
        this.showToast(this.$t('info.error_unsubscribing') || 'خطا در لغو عضویت');
      }
    },
    async clearSubscriptions() {
      try {
        localStorage.removeItem("localSubscriptions");
        this.subscriptions = [];
        this.showToast(this.$t('info.subscriptions_cleared') || 'همه اشتراک‌ها پاک شدند');
      } catch (error) {
        console.error("Error clearing subscriptions:", error);
        this.showToast(this.$t('info.error_clearing_subscriptions') || 'خطا در پاک کردن اشتراک‌ها');
      }
    },
    backupSubscriptions() {
      try {
        const subscriptions = this.getLocalSubscriptions();
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        const blob = new Blob([JSON.stringify(subscriptions, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscriptions_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(this.$t('info.backup_created_successfully') || 'پشتیبان اشتراک‌ها ایجاد شد');
      } catch (error) {
        console.error("Backup error:", error);
        this.showToast(this.$t('info.backup_error') || 'خطا در ایجاد پشتیبان');
      }
    },
    importSubscriptions() {
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
            localStorage.setItem("localSubscriptions", JSON.stringify(data));
            await this.fetchSubscriptions(); // Refresh the list
            this.showToast(this.$t('info.import_success') || 'اشتراک‌ها با موفقیت وارد شدند');
          } catch (error) {
            console.error("Import error:", error);
            this.showToast(this.$t('info.import_error') || 'خطا در وارد کردن اشتراک‌ها');
          }
        };
        reader.readAsText(file);
      };
      input.click();
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
    toggleSubscriptionState(channelId, isSubscribed, channelData) {
      // This would typically handle the subscription toggle logic
      // For now, we'll just update the UI and local storage
    },
    async fetchSubscriptionStatus(channelId) {
      // This would check if the user is subscribed to a specific channel
      const localSubscriptions = this.getLocalSubscriptions();
      return localSubscriptions.some(sub => 
        (typeof sub === 'object' ? sub.id : sub) === channelId
      );
    }
  }
};
</script>

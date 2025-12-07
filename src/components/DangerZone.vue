<template>
  <div class="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl shadow border border-red-300 dark:border-red-700">
    <h2 class="text-xl font-bold mb-4 text-red-700 dark:text-red-300" v-t="'titles.danger_zone'">منطقه خطر</h2>
    <p class="mb-4 text-red-600 dark:text-red-400" v-t="'info.danger_zone_warning'">
      این اقدامات مخرب هستند و قابل بازگشت نیستند. مراقب باشید!
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button 
        class="btn btn-danger" 
        @click="confirmAction('resetAllData')"
        v-t="'actions.reset_all_data'">
        بازنشانی همه داده‌ها
      </button>
      <button 
        class="btn btn-danger" 
        @click="confirmAction('clearSubscriptions')"
        v-t="'actions.clear_subscriptions'">
        پاک کردن اشتراک‌ها
      </button>
      <button 
        class="btn btn-danger" 
        @click="confirmAction('clearHistory')"
        v-t="'actions.clear_history'">
        پاک کردن تاریخچه
      </button>
      <button 
        class="btn btn-danger" 
        @click="confirmAction('clearLikes')"
        v-t="'actions.clear_likes'">
        پاک کردن پسند شده‌ها
      </button>
      <button 
        class="btn btn-danger" 
        @click="confirmAction('clearDislikes')"
        v-t="'actions.clear_dislikes'">
        پاک کردن پسند نشده‌ها
      </button>
      <button 
        class="btn btn-danger" 
        @click="confirmAction('resetPreferences')"
        v-t="'actions.reset_preferences'">
        بازنشانی تنظیمات
      </button>
    </div>
    
    <!-- Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirmDialog"
      :message="confirmMessage"
      @confirm="executeConfirmedAction"
      @close="showConfirmDialog = false"
    />
  </div>
</template>

<script>
import ConfirmModal from "./ConfirmModal.vue";

export default {
  name: "DangerZone",
  components: {
    ConfirmModal
  },
  data() {
    return {
      showConfirmDialog: false,
      confirmMessage: "",
      actionToConfirm: null,
    };
  },
  methods: {
    confirmAction(action) {
      const messages = {
        resetAllData: this.$t('actions.confirm_reset_all_data') || 'آیا مطمئن هستید که می‌خواهید همه داده‌ها را بازنشانی کنید؟ این عملیات قابل بازگشت نیست!',
        clearSubscriptions: this.$t('actions.confirm_clear_subscriptions') || 'آیا مطمئن هستید که می‌خواهید همه اشتراک‌ها را پاک کنید؟',
        clearHistory: this.$t('actions.confirm_clear_history') || 'آیا مطمئن هستید که می‌خواهید تاریخچه تماشا را پاک کنید؟',
        clearLikes: this.$t('actions.confirm_clear_likes') || 'آیا مطمئن هستید که می‌خواهید همه ویدیوهای پسند شده را پاک کنید؟',
        clearDislikes: this.$t('actions.confirm_clear_dislikes') || 'آیا مطمئن هستید که می‌خواهید همه ویدیوهای پسند نشده را پاک کنید؟',
        resetPreferences: this.$t('actions.confirm_reset_preferences') || 'آیا مطمئن هستید که می‌خواهید تنظیمات را بازنشانی کنید؟'
      };
      
      this.confirmMessage = messages[action];
      this.actionToConfirm = action;
      this.showConfirmDialog = true;
    },
    executeConfirmedAction() {
      this.$emit('action-confirmed', this.actionToConfirm);
      this.showConfirmDialog = false;
    }
  }
};
</script>

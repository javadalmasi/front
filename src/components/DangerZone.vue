<template>
  <div class="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl border border-red-300 dark:border-red-700 shadow">
    <h2 v-t="'titles.danger_zone'" class="text-xl font-bold text-red-700 dark:text-red-300 mb-4">منطقه خطر</h2>
    <p v-t="'info.danger_zone_warning'" class="text-red-600 dark:text-red-400 mb-4">
      این اقدامات مخرب هستند و قابل بازگشت نیستند. مراقب باشید!
    </p>
    
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <button
        class="btn btn-danger"
        v-t="'actions.reset_all_data'"
        @click="confirmAction('resetAllData')">
      </button>
      <button
        class="btn btn-danger"
        v-t="'actions.clear_subscriptions'"
        @click="confirmAction('clearSubscriptions')">
      </button>
      <button
        class="btn btn-danger"
        v-t="'actions.clear_history'"
        @click="confirmAction('clearHistory')">
      </button>
      <button
        class="btn btn-danger"
        v-t="'actions.clear_likes'"
        @click="confirmAction('clearLikes')">
      </button>
      <button
        class="btn btn-danger"
        v-t="'actions.clear_dislikes'"
        @click="confirmAction('clearDislikes')">
      </button>
      <button
        class="btn btn-danger"
        v-t="'actions.reset_preferences'"
        @click="confirmAction('resetPreferences')">
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

<template>
  <div class="p-6 border border-red-300 dark:border-red-700 rounded-xl bg-red-100 dark:bg-red-900/20 shadow">
    <h2 v-t="'titles.danger_zone'" class="mb-4 text-xl font-bold text-red-700 dark:text-red-300">منطقه خطر</h2>
    <p v-t="'info.danger_zone_warning'" class="mb-4 text-red-600 dark:text-red-400">
      این اقدامات مخرب هستند و قابل بازگشت نیستند. مراقب باشید!
    </p>
    
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <button
        v-t="'actions.reset_all_data'"
        class="btn btn-danger"
        @click="confirmAction('resetAllData')">
      </button>
      <button
        v-t="'actions.clear_subscriptions'"
        class="btn btn-danger"
        @click="confirmAction('clearSubscriptions')">
      </button>
      <button
        v-t="'actions.clear_history'"
        class="btn btn-danger"
        @click="confirmAction('clearHistory')">
      </button>
      <button
        v-t="'actions.clear_likes'"
        class="btn btn-danger"
        @click="confirmAction('clearLikes')">
      </button>
      <button
        v-t="'actions.clear_dislikes'"
        class="btn btn-danger"
        @click="confirmAction('clearDislikes')">
      </button>
      <button
        v-t="'actions.reset_preferences'"
        class="btn btn-danger"
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

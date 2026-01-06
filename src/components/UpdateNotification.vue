<template>
  <div
    v-if="showUpdateNotification"
    class="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]"
    :class="{ 'animate-fade-in': showUpdateNotification }"
  >
    <div class="flex-1">
      <p class="font-medium">{{ $t('app.update_available') || 'نسخه جدید برنامه در دسترس است' }}</p>
      <p class="text-sm opacity-90 mt-1">{{ $t('app.update_description') || 'برای بارگذاری نسخه جدید کلیک کنید' }}</p>
    </div>
    <button
      @click="refreshApp"
      class="ml-4 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
    >
      {{ $t('app.refresh') || 'بروزرسانی' }}
    </button>
    <button
      @click="dismissNotification"
      class="ml-2 text-white hover:text-gray-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script>
import { registerSW } from 'virtual:pwa-register';
import { debugLogger } from "../utils/DebugLogger";

export default {
  name: 'UpdateNotification',
  data() {
    return {
      showUpdateNotification: false,
      registration: null,
    };
  },
  mounted() {
    // Listen for the custom event dispatched by the service worker registration
    window.addEventListener('pwaUpdateAvailable', this.showUpdateNotificationHandler);

    // Also register service worker with update functionality for direct updates
    this.setupServiceWorkerUpdate();
  },
  beforeUnmount() {
    window.removeEventListener('pwaUpdateAvailable', this.showUpdateNotificationHandler);
  },
  methods: {
    setupServiceWorkerUpdate() {
      // Register service worker with update functionality
      const { needRefresh, updateServiceWorker } = registerSW({
        onNeedRefresh: () => {
          // Show update notification when new version is available
          debugLogger.log('New version available, showing update notification');
          this.showUpdateNotification = true;
        },
        onRegisteredSW: (swScriptUrl, registration) => {
          debugLogger.log('Service Worker registered with scope:', registration?.scope);
          this.registration = registration;

          // Check for updates periodically
          if (registration && registration.active) {
            setInterval(() => {
              registration.update();
            }, 60000); // Check for updates every minute
          }
        },
        onRegisterError: (error) => {
          debugLogger.error('Service Worker registration error:', error);
        }
      });

      // Also check for updates immediately
      if (needRefresh) {
        this.showUpdateNotification = true;
      }
    },
    showUpdateNotificationHandler() {
      this.showUpdateNotification = true;
    },
    async refreshApp() {
      try {
        // Clear browser cache to ensure fresh content
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }

        // Update service worker and refresh
        if (this.registration) {
          await this.registration.update();
          await this.registration.unregister();
        }

        // Force refresh the page to get the new version
        window.location.reload(true);
      } catch (error) {
        debugLogger.error('Error during refresh:', error);
        // Fallback: just reload the page
        window.location.reload(true);
      }
    },
    dismissNotification() {
      this.showUpdateNotification = false;
    }
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
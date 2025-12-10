<template>
  <div
    :class="[
      'fixed top-16 h-full z-50 transition-all duration-300 ease-in-out',
      'bg-gray-50 dark:bg-dark-800 border-l border-gray-200 dark:border-dark-100',
      {
        'right-0': !isMobile, // Desktop: align to right
        'right-0': isMobile, // Mobile: overlay from right for RTL
        'w-64': sidebarState === 'open' && !isMobile,
        'w-20': sidebarState === 'semi-open' && !isWatchPage && !isMobile,
        'w-screen': isMobile && sidebarState !== 'closed', // Mobile: full width when open
        'w-0 overflow-hidden': sidebarState === 'closed' || (isMobile && sidebarState === 'closed'),
        'z-50': !isMobile, // Consistent z-index on other pages
        'z-60': isWatchPage && sidebarState !== 'closed', // Higher z-index on watch page
      },
    ]"
    :style="{ height: isMobile ? '100vh' : 'calc(100vh - 4rem)', direction: 'rtl' }"
  >
    <!-- Scrollable content area -->
    <div class="h-full overflow-y-auto pt-2">
      <!-- Dashboard sections -->
      <div>
        <div
          v-if="sidebarState === 'open'"
          class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
        >
          {{ $t("actions.dashboard_sections") || "بخش‌های داشبورد" }}
        </div>
        <div
          v-for="item in dashboardItems"
          :key="item.name"
          :class="{
            'bg-gray-200 dark:bg-dark-700': $route.path === item.route,
          }"
          class="mx-2 my-1 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
          @click="navigateTo(item.route)"
        >
          <div class="w-10 flex items-center justify-center text-lg leading-[1.7]">
            <div :class="item.icon" />
          </div>
          <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">
            {{ item.name }}
          </span>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="mt-4">
        <div
          v-if="sidebarState === 'open'"
          class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
        >
          {{ $t("actions.data_management") || "مدیریت داده‌ها" }}
        </div>
        <div
          :class="{
            'bg-gray-200 dark:bg-dark-700': $route.path === '/user/gust/backup',
          }"
          class="mx-2 my-1 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700"
          @click="navigateTo('/user/gust/backup')"
        >
          <div class="w-10 flex items-center justify-center text-lg leading-[1.7]">
            <div class="i-fa6-solid:download" />
          </div>
          <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">
            {{ $t("actions.backup_import_data") || "نسخه پشتیبان و ورود داده" }}
          </span>
        </div>
      </div>

      <!-- Danger Zone Section -->
      <div class="mt-4">
        <div
          v-if="sidebarState === 'open'"
          class="px-4 py-2 text-sm text-gray-500 leading-[1.65] dark:text-gray-400"
        >
          {{ $t("actions.danger_zone") || "منطقه خطر" }}
        </div>
        <div
          :class="{
            'bg-gray-200 dark:bg-dark-700': $route.path === '/user/gust/danger',
          }"
          class="mx-2 my-1 flex cursor-pointer items-center rounded-lg px-4 py-3 font-semibold hover:bg-gray-200 dark:hover:bg-dark-700 text-red-600 dark:text-red-400"
          @click="navigateTo('/user/gust/danger')"
        >
          <div class="w-10 flex items-center justify-center text-lg leading-[1.7]">
            <div class="i-fa6-solid:exclamation-triangle" />
          </div>
          <span v-if="sidebarState === 'open'" class="mr-4 text-base leading-[1.65]">
            {{ $t("actions.dangerous_settings") || "تنظیمات خطرناک" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserDashboardSidebar",
  props: {
    sidebarState: {
      type: String,
      required: true,
    },
    isWatchPage: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      required: true,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["toggle-theme"],
  data() {
    return {
      dashboardItems: [
        {
          name: this.$t("titles.user_dashboard"),
          route: "/user/gust",
          icon: "i-fa6-solid:house-user"
        },
        {
          name: this.$t("titles.user_subscriptions"),
          route: "/user/gust/subscriptions",
          icon: "i-fa6-solid:bell"
        },
        {
          name: this.$t("titles.user_history"),
          route: "/user/gust/history",
          icon: "i-fa6-solid:clock-rotate-left"
        },
        {
          name: this.$t("titles.user_likes"),
          route: "/user/gust/likes",
          icon: "i-fa6-solid:thumbs-up"
        },
        {
          name: this.$t("titles.user_dislikes"),
          route: "/user/gust/dislikes",
          icon: "i-fa6-solid:thumbs-down"
        },
        {
          name: this.$t("titles.user_preferences"),
          route: "/user/gust/preferences",
          icon: "i-fa6-solid:gear"
        },
      ],
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
      if (this.isMobile || this.isWatchPage) {
        window.dispatchEvent(
          new CustomEvent("sidebarStateChanged", {
            detail: { state: "closed" },
          }),
        );
      }
    },
  },
};
</script>
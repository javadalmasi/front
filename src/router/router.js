import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/trending",
        name: "Trending",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/preferences",
        name: "Preferences",
        component: () => import("../components/PreferencesPage.vue"),
    },
    {
        path: "/results",
        name: "SearchResults",
        component: () => import("../components/SearchResults.vue"),
    },
    {
        path: "/playlist",
        name: "Playlist",
        component: () => import("../components/PlaylistPage.vue"),
    },
    {
        path: "/:path(v|w|embed|live|shorts|watch)/:v?",
        name: "WatchVideo",
        component: () => import("../components/WatchVideo.vue"),
    },
    {
        path: "/watch_videos",
        name: "WatchVideos",
        component: () => import("../components/WatchVideo.vue"),
    },
    {
        path: "/clip/:clipId",
        name: "Clips",
        component: () => import("../components/ClipsPage.vue"),
    },
    {
        path: "/:path(channel|user|c)/:channelId/:videos?",
        name: "Channel",
        component: () => import("../components/ChannelPage.vue"),
    },
    {
        path: "/@:channelId",
        name: "Channel handle",
        component: () => import("../components/ChannelPage.vue"),
    },
    {
        path: "/auth",
        name: "Authentication",
        component: () => import("../components/AuthenticationPage.vue"),
    },
    {
        path: "/login",
        name: "Login",
        redirect: "/auth",
    },
    {
        path: "/register",
        name: "Register",
        redirect: "/auth",
    },
    {
        path: "/feed",
        alias: ["/feed/subscriptions"],
        name: "Feed",
        component: () => import("../components/FeedPage.vue"),
    },
    {
        path: "/import",
        name: "Import",
        component: () => import("../components/ImportPage.vue"),
    },
    {
        path: "/:videoId([a-zA-Z0-9_-]{11})",
        component: () => import("../components/VideoRedirect.vue"),
    },
    {
        path: "/subscriptions",
        name: "Subscriptions",
        component: () => import("../components/SubscriptionsPage.vue"),
    },
    {
        path: "/history",
        name: "Watch History",
        component: () => import("../components/HistoryPage.vue"),
    },

    {
        path: "/playlists",
        name: "Playlists",
        component: () => import("../components/PlaylistsPage.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "Page Not Found",
        component: () => import("../components/PageNotFound.vue"),
    },
    // Password Reset routes
    {
        path: "/forgot-password",
        name: "ForgotPassword",
        component: () => import("../components/ForgotPasswordPage.vue"),
    },
    {
        path: "/reset-password",
        name: "ResetPassword",
        component: () => import("../components/PasswordResetPage.vue"),
    },
    {
        path: "/profile",
        name: "Profile",
        component: () => import("../components/ProfilePage.vue"),
        meta: { requiresAuth: true },
    },
    // Admin routes
    {
        path: "/admin",
        name: "AdminDashboard",
        component: () => import("../components/AdminDashboard.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: "/admin/users",
        name: "AdminUserManagement",
        component: () => import("../components/AdminUserManagement.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: "/admin/email-settings",
        name: "AdminEmailSettings",
        component: () => import("../components/AdminEmailSettings.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: "/admin/sms-settings",
        name: "AdminSmsSettings",
        component: () => import("../components/AdminSmsSettings.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: "/admin/account-deletion",
        name: "AdminAccountDeletion",
        component: () => import("../components/AdminAccountDeletion.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: "/admin/backups",
        name: "AdminBackupManagement",
        component: () => import("../components/AdminBackupManagement.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: function (_to, _from, savedPosition) {
        return savedPosition ? savedPosition : window.scrollTo(0, 0);
    },
});

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
    // Check if the route requires authentication
    if (to.meta.requiresAuth) {
        // Check if user is authenticated
        const mixin = window.appMixin.methods;
        const token = mixin.getAuthToken();

        if (!token) {
            // Redirect to login if not authenticated
            next("/auth");
            return;
        }

        // If the route also requires admin access, check the user's role
        if (to.meta.requiresAdmin) {
            try {
                // Get the current user profile to verify admin status
                const response = await mixin.fetchJson(mixin.userApiUrl() + "/user/profile", null, {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                if (response.success && response.data) {
                    // Check if the user has admin role
                    if (response.data.role !== "admin") {
                        // Redirect to home if not admin
                        next("/");
                        return;
                    }
                } else {
                    // If API call fails, redirect to login
                    next("/auth");
                    return;
                }
            } catch (error) {
                console.error("Error checking admin access:", error);
                next("/auth");
                return;
            }
        }
    }

    next();
});

export default router;

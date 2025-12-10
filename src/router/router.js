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
        path: "/results",
        name: "SearchResults",
        component: () => import("../components/SearchResults.vue"),
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
        path: "/likes",
        name: "Likes",
        component: () => import("../components/LikesPage.vue"),
    },
    {
        path: "/dislikes",
        name: "Dislikes",
        component: () => import("../components/DislikesPage.vue"),
    },
    {
        path: "/user/gust",
        name: "UserDashboard",
        component: () => import("../components/UserDashboard.vue"),
    },
    {
        path: "/user/gust/subscriptions",
        name: "UserSubscriptions",
        component: () => import("../components/UserSubscriptions.vue"),
    },
    {
        path: "/user/gust/history",
        name: "UserHistory",
        component: () => import("../components/UserHistory.vue"),
    },
    {
        path: "/user/gust/likes",
        name: "UserLikes",
        component: () => import("../components/UserLikes.vue"),
    },
    {
        path: "/user/gust/dislikes",
        name: "UserDislikes",
        component: () => import("../components/UserDislikes.vue"),
    },
    {
        path: "/user/gust/preferences",
        name: "UserPreferences",
        component: () => import("../components/UserPreferences.vue"),
    },
    {
        path: "/user/gust/backup",
        name: "DataManagement",
        component: () => import("../components/DataManagement.vue"),
    },
    {
        path: "/user/gust/danger",
        name: "DangerZone",
        component: () => import("../components/DangerZonePage.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "Page Not Found",
        component: () => import("../components/PageNotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: function (_to, _from, savedPosition) {
        return savedPosition ? savedPosition : window.scrollTo(0, 0);
    },
});

export default router;

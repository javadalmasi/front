<template>
    <div class="flex gap-3">
        <!-- Avatar -->
        <router-link :to="comment.commentorUrl" class="flex-shrink-0">
            <img
                loading="lazy"
                :src="comment.thumbnail"
                class="w-10 h-10 rounded-full bg-surface"
                alt=""
            />
        </router-link>

        <!-- Comment Content -->
        <div class="flex-1">
            <!-- Header: Author and Timestamp -->
            <div class="flex items-baseline gap-2 text-sm">
                <router-link :to="comment.commentorUrl" class="font-semibold text-main">{{ comment.author }}</router-link>
                <span class="text-soft">{{ comment.commentedTime }}</span>
            </div>

             <!-- Pinned Comment Badge -->
            <div v-if="comment.pinned" class="text-xs text-soft flex items-center gap-1 mt-1">
                <i class="i-fa6-solid:thumbtack" />
                <span>{{ $t('comment.pinned_by', { author: uploader }) }}</span>
            </div>

            <!-- Body -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <CollapsableText :text="comment.commentText" class="mt-1 text-sm text-main" />

            <!-- Footer: Actions -->
            <div class="mt-2 flex items-center gap-4 text-sm text-soft">
                <div v-if="likesDislikesEnabled && comment.likeCount > 0" class="flex items-center gap-1.5">
                    <i class="i-fa6-solid:thumbs-up" />
                    <span>{{ numberFormat(comment.likeCount) }}</span>
                </div>
                <button
                    v-if="comment.repliesPage && !commentsDisabled"
                    class="btn btn-ghost btn-xs"
                    @click="toggleReplies"
                >
                    {{ $t(showingReplies ? 'actions.hide_replies' : 'actions.show_replies') }}
                </button>
            </div>

            <!-- Replies Section -->
            <div v-if="showingReplies" class="mt-3 flex flex-col gap-3">
                <div v-if="loadingReplies" class="text-soft text-sm">{{ $t('comment.loading') }}</div>
                <CommentItem
                    v-for="reply in replies"
                    :key="reply.commentId"
                    :comment="reply"
                    :uploader="uploader"
                    :video-id="videoId"
                    :comments-disabled="commentsDisabled"
                />
                <button v-if="nextpage" class="btn btn-ghost btn-sm" @click="loadReplies(true)">
                    {{ $t('actions.load_more_replies') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import CollapsableText from "./CollapsableText.vue";

export default {
    name: "CommentItem", // Required for recursive components
    components: { CollapsableText },
    props: {
        comment: { type: Object, required: true },
        uploader: { type: String, default: null },
        videoId: { type: String, default: null },
        commentsDisabled: { type: Boolean, default: false },
    },
    data() {
        return {
            loadingReplies: false,
            showingReplies: false,
            replies: [],
            nextpage: null,
        };
    },
    computed: {
        likesDislikesEnabled() {
            return import.meta.env.VITE_DISABLE_LIKES_DISLIKES !== "true";
        },
    },
    methods: {
        toggleReplies() {
            this.showingReplies = !this.showingReplies;
            // Load replies only on the first time it's opened
            if (this.showingReplies && this.replies.length === 0) {
                this.loadReplies();
            }
        },
        async loadReplies(loadMore = false) {
            if (this.loadingReplies || this.commentsDisabled) return;

            this.loadingReplies = true;
            try {
                const pageToFetch = loadMore ? this.nextpage : this.comment.repliesPage;
                if (!pageToFetch) return;

                const json = await this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.videoId, {
                    nextpage: pageToFetch,
                });

                this.replies.push(...json.comments);
                this.nextpage = json.nextpage;
            } catch (error) {
                console.error("Failed to load replies:", error);
            } finally {
                this.loadingReplies = false;
            }
        },
    },
};
</script>
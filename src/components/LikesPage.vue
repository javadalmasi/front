<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4" v-t="'actions.likes'"></h1>
        
        <div class="flex justify-between items-center mb-4">
            <div>
                <button 
                    v-if="likedVideos.length > 0" 
                    @click="deleteAll" 
                    class="btn btn-danger"
                    v-t="'actions.delete_all'"
                ></button>
            </div>
            <div class="flex gap-2">
                <button 
                    @click="exportData('json')" 
                    class="btn btn-secondary"
                    v-t="'actions.export_json'"
                ></button>
                <button 
                    @click="exportData('csv')" 
                    class="btn btn-secondary"
                    v-t="'actions.export_csv'"
                ></button>
                <button 
                    @click="importData" 
                    class="btn btn-secondary"
                    v-t="'actions.import_data'"
                ></button>
            </div>
        </div>
        
        <div v-if="likedVideos.length === 0" class="text-center py-8">
            <p v-t="'info.no_liked_videos'" class="text-lg"></p>
        </div>
        
        <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div 
                    v-for="video in likedVideos" 
                    :key="video.videoId" 
                    class="relative"
                >
                    <ContentItem 
                        :item="{
                            url: `/watch?v=${video.videoId}`,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            duration: video.duration,
                            type: 'stream'
                        }" 
                        :clamp-title-lines="true" 
                        height="94" 
                        width="168" 
                        class="mb-2"
                    />
                    <div class="absolute top-2 right-2">
                        <button
                            @click.prevent="deleteItem(video.videoId)"
                            class="btn btn-danger"
                            :title="$t('actions.remove')"
                        >
                            <i class="i-fa6-solid:trash" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ContentItem from "./ContentItem.vue";

export default {
    name: "LikesPage",
    components: { ContentItem },
    data() {
        return {
            likedVideos: []
        };
    },
    mounted() {
        this.loadLikedVideos();
    },
    methods: {
        getLikedVideos() {
            try {
                const likedData = localStorage.getItem("likes");
                return likedData ? JSON.parse(likedData) : [];
            } catch {
                return [];
            }
        },
        loadLikedVideos() {
            this.likedVideos = this.getLikedVideos();
        },
        deleteItem(videoId) {
            // Remove from likes using the global method from mixin
            if (this.$root && this.$root.removeLike) {
                this.$root.removeLike(videoId);
            } else {
                // Fallback: remove directly from localStorage
                let likes = this.getLikedVideos();
                likes = likes.filter(video => video.videoId !== videoId);
                localStorage.setItem("likes", JSON.stringify(likes));
            }
            this.loadLikedVideos(); // Reload the list
            this.showToast(this.$t("info.item_removed"));
        },
        deleteAll() {
            if (confirm(this.$t("info.confirm_delete_all_likes"))) {
                localStorage.removeItem("likes");
                this.likedVideos = [];
                this.showToast(this.$t("info.all_likes_removed"));
            }
        },
        showToast(message) {
            // Create and show toast notification
            const toast = document.createElement("div");
            toast.className = "toast toast-top toast-center";
            toast.innerHTML = `
                <div class="alert alert-success">
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        },
        exportData(format) {
            if (this.likedVideos.length === 0) {
                this.showToast(this.$t("info.no_data_to_export"));
                return;
            }

            let data, mimeType, filename;
            
            if (format === 'json') {
                data = JSON.stringify(this.likedVideos, null, 2);
                mimeType = 'application/json';
                filename = 'liked_videos.json';
            } else if (format === 'csv') {
                // Create CSV content
                const headers = [
                    this.$t('info.video_id'), 
                    this.$t('info.title'), 
                    this.$t('info.uploader'), 
                    this.$t('info.thumbnail_url')
                ];
                const rows = this.likedVideos.map(video => [
                    video.videoId,
                    `"${video.title.replace(/"/g, '""')}"`,
                    `"${video.uploaderName.replace(/"/g, '""')}"`,
                    video.thumbnail
                ]);
                
                data = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                mimeType = 'text/csv';
                filename = 'liked_videos.csv';
            }
            
            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast(this.$t("info.exported_successfully"));
        },
        importData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.csv';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        let importedData = [];
                        const content = event.target.result;
                        
                        if (file.name.endsWith('.json')) {
                            importedData = JSON.parse(content);
                        } else if (file.name.endsWith('.csv')) {
                            // Parse CSV content
                            const lines = content.split('\n');
                            if (lines.length < 2) {
                                throw new Error("Invalid CSV file: no data rows");
                            }
                            
                            // Get headers and normalize them to English equivalents
                            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
                            
                            // Create a mapping to identify the column positions
                            const columnMap = {};
                            headers.forEach((header, index) => {
                                // Normalize header to English equivalents (supporting both English and translated headers)
                                if (['video id', 'video_id', 'videoid', 'id', this.$t('info.video_id').toLowerCase()].includes(header.toLowerCase())) {
                                    columnMap.videoId = index;
                                } else if (['title', 'name', this.$t('info.title').toLowerCase()].includes(header.toLowerCase())) {
                                    columnMap.title = index;
                                } else if (['uploader', 'author', 'creator', this.$t('info.uploader').toLowerCase()].includes(header.toLowerCase())) {
                                    columnMap.uploaderName = index;
                                } else if (['thumbnail url', 'thumbnail_url', 'thumbnail', 'image', this.$t('info.thumbnail_url').toLowerCase()].includes(header.toLowerCase())) {
                                    columnMap.thumbnail = index;
                                }
                            });
                            
                            // Check if required columns are present
                            if (columnMap.videoId === undefined) {
                                throw new Error("CSV file must contain a 'Video ID' column");
                            }
                            
                            importedData = lines.slice(1).filter(line => line.trim()).map(line => {
                                // Handle CSV parsing with proper quote handling
                                const values = this.parseCSVLine(line);
                                
                                return {
                                    videoId: columnMap.videoId !== undefined ? values[columnMap.videoId] : '',
                                    title: columnMap.title !== undefined ? values[columnMap.title] : '',
                                    uploaderName: columnMap.uploaderName !== undefined ? values[columnMap.uploaderName] : '',
                                    thumbnail: columnMap.thumbnail !== undefined ? values[columnMap.thumbnail] : ''
                                };
                            }).filter(video => video.videoId); // Only include videos with a valid ID
                        }
                        
                        if (Array.isArray(importedData)) {
                            // Merge with existing data, avoiding duplicates
                            const existingIds = new Set(this.likedVideos.map(video => video.videoId));
                            const newVideos = importedData.filter(video => 
                                video.videoId && !existingIds.has(video.videoId)
                            );
                            
                            this.likedVideos = [...this.likedVideos, ...newVideos];
                            localStorage.setItem("likes", JSON.stringify(this.likedVideos));

                            this.loadLikedVideos();
                            this.showToast(this.$t("info.imported_successfully"));
                        } else {
                            throw new Error("Invalid data format");
                        }
                    } catch (e) {
                        console.error("Error importing data:", e);
                        this.showToast(this.$t("info.import_failed"));
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }
    }
};
</script>

<style scoped>
.grid {
    display: grid;
}
</style>
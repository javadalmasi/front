<template>
    <ModalComponent>
        <div class="min-w-max flex flex-col">
            <h2 v-t="'actions.export_history'" class="mb-4 text-center text-xl font-bold leading-[1.65]" />
            <form>
                <div>
                    <label v-t="'actions.file_format'" class="mr-2" for="export-format" />
                    <select id="export-format" v-model="exportAs" class="select">
                        <option
                            v-for="option in exportOptions"
                            :key="option"
                            :value="option"
                            v-text="formatField(option)"
                        />
                    </select>
                </div>
                <div v-if="exportAs === 'history'">
                    <label v-for="field in fields" :key="field" class="flex items-center gap-2">
                        <input
                            v-model="selectedFields"
                            class="checkbox"
                            type="checkbox"
                            :value="field"
                            :disabled="field === 'videoId'"
                        />
                        <span v-text="formatField(field)" />
                    </label>
                </div>
            </form>
            <button class="btn mt-4" @click="handleExport" v-text="$t('actions.export')" />
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    data() {
        return {
            exportOptions: ["history"],
            exportAs: "history",
            fields: [
                "videoId",
                "title",
                "uploaderName",
                "uploaderUrl",
                "duration",
                "thumbnail",
                "watchedAt",
                "currentTime",
            ],
            selectedFields: [
                "videoId",
                "title",
                "uploaderName",
                "uploaderUrl",
                "duration",
                "thumbnail",
                "watchedAt",
                "currentTime",
            ],
        };
    },
    methods: {
        async fetchAllVideos() {
            if (window.db) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                const request = store.getAll();
                return new Promise((resolve, reject) => {
                    (request.onsuccess = e => {
                        const videos = e.target.result;
                        this.exportVideos = videos;
                        resolve();
                    }),
                        (request.onerror = e => {
                            reject(e);
                        });
                });
            }
        },
        handleExport() {
            if (this.exportAs === "history") {
                this.fetchAllVideos()
                    .then(() => {
                        this.exportAsHistory();
                    })
                    .catch(e => {
                        console.error(e);
                    });
            }
        },
        exportAsHistory() {
            const dateStr = new Date().toISOString().split(".")[0];
            let json = {
                format: this.getSiteName(),
                version: 1,
                watchHistory: this.exportVideos.map(video => {
                    let obj = {};
                    this.selectedFields.forEach(field => {
                        obj[field] = video[field];
                    });
                    return obj;
                }),
            };
            this.download(JSON.stringify(json), `history_${dateStr}.json`, "application/json");
        },
        formatField(field) {
            // camelCase to Title Case
            return field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
        },
    },
};
</script>
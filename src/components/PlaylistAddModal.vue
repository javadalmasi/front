<template>
    <ModalComponent @close="$emit('close')">
        <h2 v-t="'actions.select_playlist'" class="text-2xl font-bold mb-4 text-center" />
        
        <div class="mb-4 flex items-center">
            <input
                id="useDefaultPlaylist"
                v-model="useDefaultPlaylist"
                type="checkbox"
                class="checkbox mr-2"
                @change="toggleDefaultPlaylist"
            />
            <label for="useDefaultPlaylist" v-t="'actions.use_default_playlist'" class="text-lg"></label>
        </div>

        <div v-if="!useDefaultPlaylist" class="mt-3 w-full">
            <select v-model="selectedPlaylist" class="select w-full">
                <option value="" v-t="'actions.please_select_playlist'"></option>
                <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id" v-text="playlist.name" />
            </select>
        </div>

        <div v-else class="mt-3 w-full bg-gray-100 dark:bg-dark-800 p-4 rounded-lg">
            <div class="flex items-center">
                <i class="i-fa6-solid:bookmark mr-2"></i>
                <span class="font-semibold" v-text="defaultPlaylistName"></span>
            </div>
        </div>

        <div class="mt-4 w-full flex flex-wrap gap-2">
            <button
                v-if="!useDefaultPlaylist"
                ref="createButton"
                v-t="'actions.create_playlist'"
                class="btn flex-1 min-w-[120px]"
                @click="showCreatePlaylistModal = true"
            />
            <button
                ref="addButton"
                v-t="'actions.add_to_playlist'"
                class="btn btn-primary flex-1 min-w-[120px]"
                @click="handleClick(selectedPlaylist)"
            />
            <button
                v-if="!useDefaultPlaylist"
                ref="addDefaultButton"
                v-t="'actions.set_as_default'"
                class="btn btn-secondary flex-1 min-w-[120px]"
                @click="setDefaultPlaylist"
            />
        </div>
    </ModalComponent>
    <CreatePlaylistModal
        v-if="showCreatePlaylistModal"
        @close="showCreatePlaylistModal = false"
        @created="addCreatedPlaylist"
    />
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
import CreatePlaylistModal from "./CreatePlaylistModal.vue";

export default {
    components: {
        ModalComponent,
        CreatePlaylistModal,
    },
    props: {
        videoInfo: {
            type: Object,
            required: true,
        },
        videoId: {
            type: String,
            required: true,
        },
    },
    emits: ["close"],
    data() {
        return {
            playlists: [],
            selectedPlaylist: null,
            processing: false,
            showCreatePlaylistModal: false,
            useDefaultPlaylist: false,
            defaultPlaylistName: this.$t('actions.default_playlist'),
        };
    },
    mounted() {
        this.getPlaylists().then(json => {
            this.playlists = json;
            
            // Check if user has a default playlist preference
            const defaultPlaylistId = this.getPreferenceString("defaultPlaylistId" + this.hashCode(this.apiUrl()));
            if (defaultPlaylistId) {
                // Check if the default playlist still exists in the user's playlists
                const defaultPlaylist = this.playlists.find(playlist => playlist.id === defaultPlaylistId);
                if (defaultPlaylist) {
                    this.selectedPlaylist = defaultPlaylistId;
                    this.useDefaultPlaylist = true;
                } else {
                    // If default playlist doesn't exist, reset the preference
                    this.removePreference("defaultPlaylistId" + this.hashCode(this.apiUrl()));
                }
            } else {
                // If no default playlist is set, use the last selected one (if it exists)
                this.selectedPlaylist = this.getPreferenceString("selectedPlaylist" + this.hashCode(this.apiUrl()));
            }
            
            // If no playlist is selected and no playlists exist, create a default one
            if (this.playlists.length === 0) {
                this.createDefaultPlaylist().then(() => {
                    this.selectedPlaylist = this.getPreferenceString("defaultPlaylistId" + this.hashCode(this.apiUrl()));
                    this.useDefaultPlaylist = true;
                });
            } else if (!this.selectedPlaylist && !defaultPlaylistId) {
                // If there are playlists but none selected, use the first one as default
                this.selectedPlaylist = this.playlists[0].id;
            }
        });
        
        window.addEventListener("keydown", this.handleKeyDown);
        window.blur();
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Enter" && !this.showCreatePlaylistModal) {
                this.handleClick(this.selectedPlaylist);
                event.preventDefault();
            }
        },
        handleClick(playlistId) {
            if (!playlistId) {
                if (this.useDefaultPlaylist) {
                    // Use default playlist if user has set one
                    const defaultPlaylistId = this.getPreferenceString("defaultPlaylistId" + this.hashCode(this.apiUrl()));
                    if (defaultPlaylistId) {
                        playlistId = defaultPlaylistId;
                    } else {
                        alert(this.$t("actions.please_select_playlist"));
                        return;
                    }
                } else {
                    alert(this.$t("actions.please_select_playlist"));
                    return;
                }
            }

            if (this.processing) return;

            this.$refs.addButton.disabled = true;
            this.processing = true;

            this.addVideosToPlaylist(playlistId, [this.videoId], [this.videoInfo]).then(json => {
                this.setPreference("selectedPlaylist" + this.hashCode(this.apiUrl()), playlistId);
                this.$emit("close");
                if (json.error) alert(json.error);
            });
        },
        addCreatedPlaylist(playlistId, playlistName) {
            this.playlists.push({ id: playlistId, name: playlistName });
            this.selectedPlaylist = playlistId;
            this.showCreatePlaylistModal = false;
        },
        toggleDefaultPlaylist() {
            if (this.useDefaultPlaylist) {
                // When enabling default playlist, use the one stored in preferences
                const defaultPlaylistId = this.getPreferenceString("defaultPlaylistId" + this.hashCode(this.apiUrl()));
                if (defaultPlaylistId) {
                    this.selectedPlaylist = defaultPlaylistId;
                }
            }
        },
        setDefaultPlaylist() {
            if (this.selectedPlaylist) {
                this.setPreference("defaultPlaylistId" + this.hashCode(this.apiUrl()), this.selectedPlaylist);
                this.useDefaultPlaylist = true;
                this.$refs.addDefaultButton.textContent = this.$t('actions.default_set');
            }
        },
        async createDefaultPlaylist() {
            // Create a default playlist named "Default Playlist"
            const defaultName = this.$t('actions.default_playlist');
            const result = await this.createPlaylist(defaultName);
            if (result && result.playlistId) {
                this.setPreference("defaultPlaylistId" + this.hashCode(this.apiUrl()), result.playlistId);
                this.playlists.push({ id: result.playlistId, name: defaultName });
                this.selectedPlaylist = result.playlistId;
                this.useDefaultPlaylist = true;
            }
            return result;
        }
    },
};
</script>

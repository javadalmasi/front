<template>
    <ModalComponent @close="$emit('close')">
        <div class="flex flex-col">
            <h2 v-t="'actions.create_playlist'" class="text-2xl font-bold mb-4 text-center" />
            
            <div class="mb-4">
                <label v-t="'actions.playlist_name'" for="playlistNameInput" class="block text-lg font-medium mb-2"></label>
                <input 
                    ref="input" 
                    id="playlistNameInput"
                    v-model="playlistName" 
                    type="text" 
                    class="input w-full" 
                    :placeholder="$t('actions.enter_playlist_name')"
                    @keyup.enter="onCreatePlaylist"
                />
            </div>
            
            <div class="mt-4 flex flex-wrap gap-2">
                <button 
                    v-t="'actions.cancel'" 
                    class="btn btn-secondary flex-1 min-w-[120px]" 
                    @click="$emit('close')" 
                />
                <button 
                    v-t="'actions.create_playlist'" 
                    class="btn btn-primary flex-1 min-w-[120px]" 
                    :disabled="!playlistName.trim()" 
                    @click="onCreatePlaylist" 
                />
            </div>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    emits: ["created", "close"],
    data() {
        return {
            playlistName: "",
        };
    },
    mounted() {
        this.$refs.input.focus();
        window.addEventListener("keydown", this.handleKeyDown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Escape") {
                this.$emit('close');
                event.preventDefault();
            } else if (event.code === "Enter") {
                this.onCreatePlaylist();
                event.preventDefault();
            }
        },
        onCreatePlaylist() {
            if (!this.playlistName.trim()) return;

            this.createPlaylist(this.playlistName).then(response => {
                if (response.error) {
                    alert(response.error);
                } else {
                    this.$emit("created", response.playlistId, this.playlistName);
                    this.$emit("close");
                }
            }).catch(error => {
                console.error("Error creating playlist:", error);
                alert(this.$t("info.error_occurred"));
            });
        },
    },
};
</script>

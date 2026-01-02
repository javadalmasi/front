<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function backToHome() {
    router.push('/');
}
</script>

<template>
    <div class="min-h-[88vh] flex flex-col items-center justify-center">
        <h1 class="font-bold !text-9xl">404</h1>
        <h2 v-t="'info.page_not_found'" class="leading-[1.55] !text-2xl" />
        <button v-t="'actions.back_to_home'" class="btn mt-16" @click="backToHome" />
    </div>
</template>

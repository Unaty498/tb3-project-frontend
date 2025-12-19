<template>
    <div v-if="show" class="modal">
        <div class="modal-content">
            <h3>{{ title }}</h3>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    show: boolean;
    title: string;
}>();
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-content {
    background-color: var(--color-background);
    color: var(--color-text);
    padding: 20px;
    border-radius: 5px;
    min-width: 400px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
}
</style>

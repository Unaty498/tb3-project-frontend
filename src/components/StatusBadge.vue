<template>
    <span :class="['badge', active ? 'active' : 'inactive']">
        {{ active ? "Active" : "Inactive" }}
    </span>
</template>

<script setup lang="ts">
defineProps<{
    active: boolean;
}>();
</script>

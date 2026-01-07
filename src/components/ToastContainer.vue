<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        @click="removeToast(toast.id)"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  min-width: 200px;
}

.toast-error {
  background-color: #ff4444;
}

.toast-success {
  background-color: #00C851;
}

.toast-info {
  background-color: #33b5e5;
}

.toast-warning {
  background-color: #fb3;
  color: black;
}

/* Transitions */
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="vote in toasts"
        :key="vote.id"
        class="flex items-center gap-3
               bg-white/90 backdrop-blur
               border border-gray-100 shadow-xl
               rounded-2xl px-4 py-3 w-72"
      >
        <!-- Ícone -->
        <div
          class="w-9 h-9 rounded-full bg-green-100
                 flex items-center justify-center
                 text-green-600 text-sm font-bold"
        >
          $
        </div>

        <!-- Conteúdo -->
        <div class="flex-1">
          <p class="text-sm text-gray-800 leading-tight">
            <span class="font-semibold">
              {{ vote.nickname || 'Alguém' }}
            </span>
            <span class="text-gray-500">
              enviou um Pix
            </span>
          </p>

          <p class="text-[11px] text-gray-400 mt-0.5">
            contribuição registrada
          </p>
        </div>
      </div>
    </transition-group>
  </div>
</template>


<script setup lang="ts">
defineProps<{ toasts: any[] }>()
</script>

<style scoped>

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

</style>

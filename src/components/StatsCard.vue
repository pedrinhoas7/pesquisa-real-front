<template>
  <div
    class="bg-white rounded-xl px-6 py-4
           border border-gray-100 shadow-sm
           flex items-center gap-4"
  >
    <!-- Icon -->
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center"
      :class="iconBg"
    >
      <slot name="icon" />
    </div>

    <!-- Content -->
    <div>
      <p class="text-lg font-semibold text-gray-900">
        {{ value }}
      </p>
      <p class="text-sm text-gray-500">
        {{ label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  iconBg: string
}>()
</script>

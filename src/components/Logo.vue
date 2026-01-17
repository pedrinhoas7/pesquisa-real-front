<template>
    <img
      :src="Logo"
      alt="Logo Pesquisa Real"
      :class="`w-${props.size} h-${props.size}`" />
</template>
<script setup lang="ts">
import Logo from '@/assets/img/logo.png'

const props = defineProps<{
  size: String
}>()

</script>

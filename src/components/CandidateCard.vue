<template>
  <div class="bg-white rounded-2xl px-5 py-4
           border border-gray-100 shadow-sm
           flex flex-col gap-4
           md:flex-row md:items-center ">
    <!-- LEFT: Avatar + Info -->
    <div class="flex items-center gap-4 md:flex-[2]">
      <div class="w-14 h-14 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
        <img :src="candidate.avatar" :alt="candidate.name" class="w-full h-full object-cover" />
      </div>

      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 leading-tight">
          {{ candidate.name }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ candidate.role }}
        </p>
      </div>
    </div>

    <!-- CENTER: Progress -->
    <div class="md:flex-[3] space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span class="font-medium text-gray-700">
          {{ candidate.percentage }}%
        </span>
      </div>

      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="h-full rounded-full transition-[width] duration-500" :style="{
          width: candidate.percentage + '%',
          backgroundColor: candidate.color
        }" />
      </div>
    </div>

    <!-- RIGHT: Numbers -->
    <!-- Numbers -->
    <div class="flex gap-3 md:gap-4 justify-center items-center md:flex-1">


      <div class="bg-gray-50 rounded-lg px-3 py-2 text-center min-w-[72px]">
        <p class="text-lg font-semibold text-gray-900 leading-none">
          {{ candidate.votes }}
        </p>
        <p class="text-[11px] text-gray-400">
          Votos
        </p>
      </div>
    </div>


    <!-- CTA -->
    <button class="w-full md:w-auto
             bg-emerald-600 hover:bg-emerald-700 transition
             text-white font-medium px-5 py-2 rounded-lg" @click="$emit('participate', candidate)">
      Votar
    </button>
  </div>
</template>


<script setup lang="ts">
import type { Candidate } from '@/types/Candidate'

defineProps<{
  candidate: Candidate
}>()
</script>

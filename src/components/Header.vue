<template>
    <header class="bg-white shadow-sm">
        <div class=" mx-auto px-6 py-4 flex items-center justify-between">
            <!-- Logo + título -->
            <div class="flex items-center gap-4">
                <Logo size="12" />

                <div>
                    <h1 class="text-lg font-semibold text-gray-900 leading-tight">
                        Pesquisa Real
                    </h1>
                    <p class="text-xs text-gray-500">
                        Enquete Pública Simbólica
                    </p>
                </div>
            </div>

            <!--       <nav class="hidden md:flex items-center gap-8 text-sm text-gray-600">
        <a href="#como-funciona" class="hover:text-gray-900 transition">
          Como funciona
        </a>
        <a href="#conferir" class="hover:text-gray-900 transition">
          Conferir participação
        </a>
      </nav>

      <button
        class="bg-yellow-400 hover:bg-yellow-500 transition
               text-gray-900 font-medium px-5 py-2 rounded-lg"
      >
        Participar
      </button> -->
        </div>
    </header>
</template>

<script setup lang="ts">
import Logo from '@/components/Logo.vue'
</script>

<template>
  <footer class="mt-2">
    <!-- Aviso legal -->
    <div class="bg-yellow-50 border-t border-b border-yellow-200">
      <div class="max-w-6xl mx-auto px-6 py-4
               flex items-center gap-3 text-sm text-yellow-800">
        <span class="text-lg">⚠️</span>
        <p>
          Esta plataforma realiza uma pesquisa pública simbólica, sem valor eleitoral oficial. A participação é
          voluntária e as contribuições são tratadas como doações.
        </p>
      </div>
    </div>

    <!-- Rodapé institucional -->
    <div class="bg-white border-t">
      <div class="max-w-6xl mx-auto px-6 py-6
           text-center text-sm text-gray-500 space-y-2">
        <p class="font-medium text-gray-700 flex items-center justify-center gap-2">
          <Logo size="10" />
          <span>Pesquisa Real © 2026</span>
        </p>

        <p>
          Projeto independente de enquete pública simbólica.
        </p>

        <p>
          Contato:
          <a href="mailto:raziel_r@protom.me" class="text-blue-600 hover:underline">
            raziel_r@protom.me
          </a>
        </p>
      </div>
    </div>

  </footer>
</template>

<script setup lang="ts">
import Logo from '@/components/Logo.vue'
</script>
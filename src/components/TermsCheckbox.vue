<template>
  <div class="space-y-2">
    <!-- Checkbox -->
    <label class="flex items-start gap-3 text-sm text-gray-600">
      <input type="checkbox" @change="$emit('accept')" class="mt-1 accent-emerald-600" />

      <span>
        Concordo com os
        <button type="button" class="text-emerald-600 hover:underline font-medium" @click="open = true">
          Termos de Compromisso
        </button>
        <span class="text-xs text-gray-400 ml-1">(v1.0)</span>
      </span>
    </label>

    <!-- Modal de Termos -->
    <div v-if="open" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
             flex items-center justify-center px-4">
      <div class="bg-white w-full max-w-2xl max-h-[80vh]
               rounded-2xl shadow-xl
               flex flex-col">
        <!-- Header -->
        <header class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            Termos de Compromisso — Pesquisa Real
          </h2>
          <p class="text-sm text-gray-500">
            Versão 1.0
          </p>
        </header>

        <!-- Content -->
        <div class="px-6 py-4 overflow-y-auto text-sm text-gray-700 space-y-4">
          <p>
            A <strong>Pesquisa Real</strong> é uma plataforma digital independente,
            de caráter privado e não governamental, destinada à realização de
            <strong>pesquisas públicas simbólicas</strong>, sem qualquer valor
            eleitoral, estatístico oficial ou efeito jurídico perante a Justiça Eleitoral.
          </p>

          <p>
            A participação ocorre por meio de <strong>doação voluntária</strong>,
            que não configura voto eleitoral, financiamento de campanha ou apoio político oficial.
          </p>

          <p>
            A plataforma não possui vínculo com partidos políticos, candidatos,
            coligações ou com a Justiça Eleitoral, não realizando votação oficial,
            apuração eleitoral ou qualquer atividade regulada pelo Tribunal Superior Eleitoral (TSE).
          </p>

          <p>
            Os dados pessoais informados são utilizados exclusivamente para controle
            de participação e são criptografados, em conformidade com
            a legislação vigente de proteção de dados.
          </p>

          <p>
            Será creditado apenas um voto por CPF, sendo vedada a participação
            múltipla de um mesmo indivíduo.
          </p>


          <p class="font-medium">
            Ao aceitar estes termos, o usuário declara ciência do caráter simbólico
            da plataforma e concorda integralmente com suas condições.
          </p>
        </div>

        <!-- Footer -->
        <footer class="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button class="px-4 py-2 text-sm font-medium
                   bg-emerald-600 hover:bg-emerald-700
                   text-white rounded-lg" @click="open = false">
            Fechar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm h-screen
           flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-md rounded-2xl
             shadow-xl border border-gray-100">
      <!-- Header -->
      <header class="px-6 py-5 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">
          Participar da pesquisa
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Participação limitada a um voto por CPF
        </p>
      </header>

      <!-- Body -->
      <div class="px-6 py-5 space-y-5">
        <!-- Candidate -->
        <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4" :style="`border: 2px solid ${candidate.color};`">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img :src="candidate.avatar" :alt="candidate.name" class="w-full h-full object-cover" />
          </div>

          <div>
            <p class="font-medium text-gray-900 leading-tight">
              {{ candidate.name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ candidate.role }}
            </p>
          </div>
        </div>

        <!-- FORM -->
        <div v-if="flowState === 'form'" class="space-y-4">
          <!-- CPF -->
          <input v-mask="'###.###.###-##'" v-model="cpf" type="text" placeholder="Seu CPF" class="w-full border border-gray-300 rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-emerald-500" />

          <!-- Apelido -->
          <input v-model="nickname" type="text" placeholder="Seu apelido (opcional)" maxlength="30" class="w-full border border-gray-300 rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-emerald-500" />

          <!-- Termos -->
          <TermsCheckbox :checked="agreedToTerms" @accept="agreedToTerms = !agreedToTerms" />

          <!-- Voto público -->
          <label class="flex items-start gap-3 text-sm text-gray-600">
            <input type="checkbox" v-model="isPublicVote" class="mt-1 rounded border-gray-300 accent-emerald-600" />

            <span>
              Tornar meu voto público
              <span class="block text-xs text-gray-400">
                Seu apelido poderá aparecer na lista de participantes
              </span>
            </span>
          </label>

          <!-- CTA -->
          <button type="button" :disabled="!agreedToTerms" @click="onSubmit" class="w-full bg-emerald-600 hover:bg-emerald-700
                   text-white font-semibold py-3 rounded-xl
                   transition disabled:opacity-50">
            {{ pixRequired ? 'Continuar' : 'Confirmar voto' }}
          </button>
        </div>

        <!-- PIX -->
        <PixQRCode v-if="flowState === 'pix'" :candidate="candidate" :cpf="cpf" :nickname="nickname" :voteId="voteId"
          @success="$emit('close')" @close="$emit('close')" />

        <!-- SUCCESS -->
        <SuccessModal v-if="flowState === 'success'" @contribute="flowState = 'pix'" @close="$emit('close')" />

        <CpfAlreadyVotedModal v-if="flowState === 'cpf-used'" @contribute="flowState = 'pix'" @close="$emit('close')" />
      </div>

      <!-- Footer -->
      <footer v-if="flowState === 'form'" class="px-6 py-4 border-t border-gray-100 text-center">
        <button class="text-sm text-gray-500 hover:text-gray-700" @click="$emit('close')">
          Cancelar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TermsCheckbox from './TermsCheckbox.vue'
import PixQRCode from './PixQRCode.vue'
import SuccessModal from './SuccessModal.vue'
import type { Candidate } from '@/types/Candidate'
import { vote } from '@/services/vote'
import axios from 'axios'
import CpfAlreadyVotedModal from './CpfAlreadyVotedModal.vue'


type FlowState = 'form' | 'pix' | 'success' | 'cpf-used'


const props = defineProps<{
  candidate: Candidate
  pixRequired: boolean
}>()

const cpf = ref('')
const nickname = ref('')
const agreedToTerms = ref(false)
const flowState = ref<FlowState>('form')
const voteId = ref<string | null>(null)
const isPublicVote = ref(false)

async function onSubmit() {
  const unmaskedCpf = cpf.value.replace(/\D/g, '')

  if (unmaskedCpf.length !== 11) {
    alert('CPF inválido')
    return
  }

  try {
    const { data } = await vote(
      props.candidate.id,
      unmaskedCpf,
      nickname.value || null,
      isPublicVote.value
    )

    voteId.value = data.transactionId
    flowState.value = props.pixRequired ? 'pix' : 'success'

  } catch (err: any) {
    if (err?.response?.status === 409) {
      flowState.value = 'cpf-used'
      voteId.value = err.response.data?.transactionId ?? null
      return
    }

    console.error(err)
  }

}
</script>

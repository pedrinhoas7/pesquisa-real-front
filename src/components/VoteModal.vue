<template>
  <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
           flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-md rounded-2xl
             shadow-xl border border-gray-100">
      <!-- Header -->
      <header class="px-6 py-5 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">
          Participar da pesquisa
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Sua participação será registrada como doação simbólica
        </p>
      </header>

      <!-- Body -->
      <div class="px-6 py-5 space-y-5">
        <!-- Candidate -->
        <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4"
          :style="`border: 2px solid ${props.candidate.color};`">
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

        <!-- Inputs -->
        <div class="space-y-3">
          <input v-mask="'###.###.###-##'" v-model="cpf" type="text" placeholder="Seu CPF" class="w-full border border-gray-300 rounded-lg px-3 py-2
         focus:outline-none focus:ring-2 focus:ring-emerald-500" />


          <input type="text" placeholder="Seu Apelido (opcional)" class="w-full border border-gray-300 rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <!-- Terms -->
        <TermsCheckbox @accept="agreedToTerms = !agreedToTerms" />

        <!-- CTA -->
        <button type="button" :disabled="loading || !agreedToTerms" @click="onSubmit" class="w-full bg-emerald-600 hover:bg-emerald-700
         text-white font-semibold py-3 rounded-xl
         transition disabled:opacity-50">
          {{ loading
            ? 'Processando...'
            : pixRequired
              ? 'Gerar Pix de R$ 1,00'
              : 'Confirmar Participação'
          }}
        </button>


        <PixQRCode v-if="flowState === 'pix' && qrCodeBase64" :pixRequired="pixRequired" :qr-code-base64="qrCodeBase64" :candidate="candidate"
          :transactionId="transactionId" @close="$emit('close')" />


        <SuccessModal v-if="flowState === 'success'" @contribute="gerarPix()" @close="$emit('close')" />



      </div>

      <!-- Footer -->
      <footer class="px-6 py-4 border-t border-gray-100 text-center">
        <button class="text-sm text-gray-500 hover:text-gray-700" @click="$emit('close')">
          Cancelar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TermsCheckbox from './TermsCheckbox.vue'
import PixQRCode from './PixQRCode.vue'
import type { Candidate } from '@/types/Candidate'
import { generatePix } from '@/services/pix';
import SuccessModal from './SuccessModal.vue'


type FlowState = 'form' | 'pix' | 'success'


const props = defineProps<{
  candidate: Candidate
}>()

const cpf = ref('')
const loading = ref(false)
const qrCodeBase64 = ref<string | null>(null)
const transactionId = ref<string | null>(null)
const agreedToTerms = ref(false)
const pixRequired = ref(false)
const flowState = ref<FlowState>('form')


async function gerarPix() {
  try {
    loading.value = true
    flowState.value = 'pix'
    const unmaskedCpf = cpf.value.replace(/\D/g, '')
    if (unmaskedCpf.length !== 11) {
      alert('CPF inválido')
      return
    }


    const { data } = await generatePix(props.candidate.id, unmaskedCpf)

    qrCodeBase64.value = data.qrCodeBase64
    transactionId.value = data.transactionId
  } catch (err) {
    console.error(err)
    alert('Erro ao gerar PIX')
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (pixRequired.value) {
    await gerarPix()
  } else {
    flowState.value = 'success'
  }
}



</script>

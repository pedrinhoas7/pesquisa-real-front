<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm
           flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm
             text-center space-y-6 shadow-xl">

      <!-- Success Icon -->
      <div class="mx-auto w-10 h-10 rounded-full
               bg-emerald-100 text-emerald-600
               flex items-center justify-center text-3xl">
        ✓
      </div>
      <!-- Title -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ pixRequired ? 'Confirmação de contribuição via PIX' : 'Participação confirmada' }}
        </h2>

        <!-- Mensagem quando PIX não é obrigatório -->
        <p v-if="!pixRequired" class="text-sm text-gray-600 leading-relaxed">
          Sua participação foi registrada com sucesso.
          Contribuições ajudam a viabilizar
          <span class="font-medium text-gray-700">
            futuras pesquisas
          </span>.
        </p>

        <!-- Mensagem quando PIX é obrigatório -->
        <p v-else class="text-sm text-gray-600 leading-relaxed">
          Para concluir sua participação, confirme a contribuição via PIX.
        </p>
      </div>


      <!-- QR Code -->
      <div v-if="qrCodeBase64" class="flex justify-center">
        <img :src="`data:image/png;base64,${qrCodeBase64}`" alt="QR Code PIX"
          class="w-44 h-44 rounded-xl border border-gray-100" />
      </div>

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

      <!-- Status -->
      <div class="space-y-2">
        <p v-if="status === 'PENDING'" class="text-sm text-yellow-600 font-medium">
          ⏳ Aguardando confirmação do pagamento
        </p>

        <p v-else class="text-sm text-emerald-600 font-medium">
          ✅ Contribuição confirmada
        </p>

        <!-- Finalização visual -->
        <div v-if="status !== 'PENDING'" class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div class="bg-emerald-600 h-2 transition-[width] duration-500" :style="{ width: progress + '%' }" />
        </div>

        <p v-if="status !== 'PENDING'" class="text-xs text-gray-400">
          Finalizando…
        </p>
      </div>
      <div class="border-t border-gray-100 w-full">
        <button class="w-full text-sm text-gray-500 pt-3
                 hover:text-gray-700 transition" @click="$emit('close')">
          Cancelar
        </button>
      </div>

    </div>

  </div>
</template>



<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const props = defineProps({
  transactionId: String,
  candidate: Object,
  qrCodeBase64: String,
  pixRequired: Boolean
})

const status = ref('PENDING')
const progress = ref(0)
let unsubscribe = null

function animateProgress() {
  const interval = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(interval)
      return
    }
    progress.value += 10
  }, 150)
}

onMounted(() => {
  if (!props.transactionId) return

  unsubscribe = onSnapshot(
    doc(db, 'transactions', props.transactionId),
    snap => {
      if (!snap.exists()) return
      status.value = snap.data().status

      if (status.value === 'CONFIRMED') {
        animateProgress()
        setTimeout(() => {
          // Redirecionamento após completar a barra
          window.location.href = '/obrigado'
        }, 1500)
      }
    }
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

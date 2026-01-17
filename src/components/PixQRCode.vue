<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm
           flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm
             text-center space-y-6 shadow-xl">
      <!-- Ícone -->
      <div class="mx-auto w-10 h-10 rounded-full
               bg-emerald-100 text-emerald-600
               flex items-center justify-center text-3xl">
        ✓
      </div>

      <!-- Título -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900">
          Contribuição via PIX
        </h2>

        <p class="text-sm text-gray-600 leading-relaxed">
          Escolha o valor da contribuição para concluir sua participação.
        </p>
      </div>

      <!-- Valor -->
      <div v-if="!qrCodeBase64" class="space-y-3 text-left">
        <label class="text-sm font-medium text-gray-700">
          Valor da contribuição (R$)
        </label>

        <div class="space-y-4">
          <!-- Botões rápidos -->
          <div class="grid grid-cols-3 gap-3">
            <button v-for="value in quickValues" :key="value" type="button" @click="setAmount(value)" class="border rounded-lg py-2 text-sm font-medium
               hover:bg-emerald-50 hover:border-emerald-500
               transition">
              R$ {{ value }}
            </button>
          </div>

          <!-- Input bancário -->
          <input :value="formatted" inputmode="numeric" placeholder="0,00" class="w-full border border-gray-300 rounded-lg px-3 py-2
             focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg" @input="onInput" />
        </div>

        <p class="text-xs text-gray-500">
          Valor mínimo: R$ 1,00
        </p>

        <button class="w-full bg-emerald-600 hover:bg-emerald-700
                 text-white font-semibold py-2 rounded-lg
                 transition disabled:opacity-50" :disabled="loading || amount < 1" @click="gerarPix">
          {{ loading ? 'Gerando...' : 'Gerar QR Code' }}
        </button>
      </div>

      <!-- QR Code -->
      <div v-if="qrCodeBase64" class="flex justify-center">
        <img :src="`data:image/png;base64,${qrCodeBase64}`" alt="QR Code PIX"
          class="w-44 h-44 rounded-xl border border-gray-100" />
      </div>

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

      <!-- Status -->
      <div v-if="qrCodeBase64" class="space-y-2">
        <p v-if="status === 'PENDING'" class="text-sm text-yellow-600 font-medium">
          ⏳ Aguardando confirmação do pagamento
        </p>

        <p v-else class="text-sm text-emerald-600 font-medium">
          ✅ Contribuição confirmada
        </p>

        <div v-if="status !== 'PENDING'" class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div class="bg-emerald-600 h-2 transition-[width] duration-500" :style="{ width: progress + '%' }" />
        </div>

        <p v-if="status !== 'PENDING'" class="text-xs text-gray-400">
          Finalizando…
        </p>
      </div>

      <!-- Cancelar -->
      <div class="border-t border-gray-100 w-full">
        <button class="w-full text-sm text-gray-500 pt-3
                 hover:text-gray-700 transition" @click="$emit('close')">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { generatePix } from '@/services/pix'
import type { Candidate } from '@/types/Candidate'

const emit = defineEmits(['success', 'close'])

const props = defineProps<{
  candidate: Candidate
  cpf: string
  nickname: string
  voteId: string
}>()

const amount = computed(() => cents.value / 100)
const loading = ref(false)
const qrCodeBase64 = ref<string | null>(null)
const transactionId = ref<string | null>(null)
const status = ref<'PENDING' | 'CONFIRMED'>('PENDING')
const progress = ref(0)
const quickValues = [10, 50, 100]

function setAmount(value: number) {
  cents.value = value * 100
}

/**
 * Mostra o valor formatado (1,00)
 */
const formattedAmount = computed(() => {
  if (amount.value === null) return ''
  return amount.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

/**
 * Converte texto → número
 */
const cents = ref(0)
const formatted = computed(() => {
  return (cents.value / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

function onInput(event: Event) {
  const input = event.target as HTMLInputElement

  // pega só números
  const digits = input.value.replace(/\D/g, '')

  // evita NaN
  cents.value = digits ? Number(digits) : 0
}
let unsubscribe: (() => void) | null = null

function animateProgress() {
  const interval = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(interval)
      return
    }
    progress.value += 10
  }, 150)
}

async function gerarPix() {
  const unmaskedCpf = props.cpf.replace(/\D/g, '')

  if (unmaskedCpf.length !== 11) {
    alert('CPF inválido')
    return
  }

  if (amount.value < 1) {
    alert('Valor mínimo é R$ 1,00')
    return
  }

  loading.value = true
  try {
    const { data } = await generatePix(
      props.candidate.id,
      unmaskedCpf,
      amount.value, 
      props.nickname,
      props.voteId
    )

    qrCodeBase64.value = data.qrCodeBase64
    transactionId.value = data.transactionId
  } catch (err) {
    console.error(err)
    alert('Erro ao gerar PIX')
  } finally {
    loading.value = false
  }
}

watch(transactionId, id => {
  if (!id) return

  unsubscribe = onSnapshot(
    doc(db, 'transactions', id),
    snap => {
      if (!snap.exists()) return

      status.value = snap.data().status

      if (status.value === 'CONFIRMED') {
        animateProgress()
        setTimeout(() => emit('success'), 1500)
      }
    }
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

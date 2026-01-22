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

      <!-- Copia e cola estilizado -->
      <div v-if="qrCode" class="space-y-2">
        <label class="text-sm font-medium text-gray-700">
          Copia e cola
        </label>

        <div class="relative">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800
             break-all cursor-pointer hover:bg-gray-100 transition-colors select-all" @click="copyToClipboard(qrCode)"
            title="Clique para copiar">
            <!-- Ícone de clipboard -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute top-2 right-2 text-gray-400" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 16h8M8 12h8m-6 8h6m-6-16h6a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z" />
            </svg>
            {{ qrCode }}
          </div>

          <!-- Mensagem de copiado -->
          <transition name="fade">
            <div v-if="copied"
              class="absolute right-0 top-0 mt-1 mr-1 px-2 py-0.5 text-xs text-white bg-[#059669] rounded">
              Copiado!
            </div>
          </transition>
        </div>
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

/* ------------------------
   Estado
------------------------ */
const cents = ref(0)
const loading = ref(false)
const qrCodeBase64 = ref<string | null>(null)
const qrCode = ref<string | null>(null)
const transactionId = ref<string | null>(null)
const status = ref<'PENDING' | 'CONFIRMED'>('PENDING')
const progress = ref(0)
const copied = ref(false)

let unsubscribe: (() => void) | null = null
let safetyTimeout: ReturnType<typeof setTimeout> | null = null

const quickValues = [10, 50, 100]

/* ------------------------
   Computed
------------------------ */
const amount = computed(() => cents.value / 100)

const formatted = computed(() =>
  (cents.value / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
)

/* ------------------------
   Helpers
------------------------ */
function setAmount(value: number) {
  cents.value = value * 100
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '')
  cents.value = digits ? Number(digits) : 0
}

function animateProgress() {
  const interval = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(interval)
      return
    }
    progress.value += 10
  }, 150)
}

function cleanupListener() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  if (safetyTimeout) {
    clearTimeout(safetyTimeout)
    safetyTimeout = null
  }
}

/* ------------------------
   PIX
------------------------ */
async function gerarPix() {
  const unmaskedCpf = props.cpf.replace(/\D/g, '')

  if (!isValidCPF(unmaskedCpf)) {
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

    qrCode.value = data.qrCode
    qrCodeBase64.value = data.qrCodeBase64
    transactionId.value = data.transactionId
  } catch (err) {
    console.error(err)
    alert('Erro ao gerar PIX')
  } finally {
    loading.value = false
  }
}

/* ------------------------
   Clipboard
------------------------ */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  })
}


function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')

  // 1️⃣ tamanho
  if (cleaned.length !== 11) return false

  // 2️⃣ rejeita sequências iguais (111.111.111-11 etc)
  if (/^(\d)\1+$/.test(cleaned)) return false

  const digits = cleaned.split('').map(Number)

  // 3️⃣ primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }

  let firstCheck = (sum * 10) % 11
  if (firstCheck === 10) firstCheck = 0
  if (firstCheck !== digits[9]) return false

  // 4️⃣ segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }

  let secondCheck = (sum * 10) % 11
  if (secondCheck === 10) secondCheck = 0
  if (secondCheck !== digits[10]) return false

  return true
}

/* ------------------------
   Listener da transação
   (NÃO pausa em tab hidden)
------------------------ */
watch(transactionId, id => {
  if (!id || unsubscribe) return

  unsubscribe = onSnapshot(
    doc(db, 'transactions', id),
    snap => {
      if (!snap.exists()) return

      const newStatus = snap.data().status

      if (status.value === newStatus) return
      status.value = newStatus

      if (status.value === 'CONFIRMED') {
        animateProgress()
        setTimeout(() => emit('success'), 1500)
        cleanupListener()
      }
    }
  )

  // ⏱️ timeout de segurança (5 min)
  safetyTimeout = setTimeout(() => {
    if (status.value === 'PENDING') {
      cleanupListener()
      alert('Pagamento não confirmado. Tente novamente.')
    }
  }, 5 * 60 * 1000)
})

/* ------------------------
   Cleanup
------------------------ */
onUnmounted(() => {
  cleanupListener()
})
</script>

<template>
    <div class="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm
           min-h-[320px] max-h-[60vh]">

        <!-- Header -->
        <div class="px-5 py-4 border-b bg-white shadow-sm shrink-0 rounded-t-2xl flex flex-row gap-3">
            <div class="text-emerald-600 w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </div>
            <div>
                <h3 class="text-sm font-semibold text-gray-900 leading-tight">
                    Atividade recente
                </h3>
                <p class="text-xs text-gray-500 mt-0.5 leading-tight">
                    Votos públicos em tempo real
                </p>
            </div>

        </div>

        <!-- Feed -->
        <div class="flex-1 overflow-y-auto divide-y divide-gray-100 shadow-inner">
            <div v-for="vote in votes" :key="vote.id"
                class="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition">
                <!-- Indicador -->
                <div class="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>

                <!-- Texto -->
                <div class="flex-1">
                    <p class="text-sm text-gray-800 leading-snug">
                        <span class="font-medium">
                            {{ vote.nickname || 'Anônimo' }}
                        </span>
                        <span class="text-gray-500">
                            votou em
                        </span>
                        <span class="font-medium text-gray-900">
                            {{ vote.candidateName }}
                        </span>
                    </p>
                </div>

                <!-- Hora -->
                <div class="text-[11px] text-gray-400 whitespace-nowrap">
                    {{ formatTime(vote.createdAt) }}
                </div>
            </div>

            <!-- Empty -->
            <div v-if="!votes.length" class="flex items-center justify-center py-12 text-sm text-gray-400">
                Nenhuma atividade ainda
            </div>
        </div>
    </div>
</template>





<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { Candidate } from '@/types/Candidate'
import Logo from '@/components/Logo.vue'

const votes = ref<any[]>([])
const seenIds = new Set<string>()
let unsubscribe: (() => void) | null = null

const props = defineProps<{
    candidates: Candidate[]
}>()

function formatTime(timestamp: any) {
    if (!timestamp) return ''
    return timestamp.toDate().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

function startListener() {
    if (unsubscribe) return

    const q = query(
        collection(db, 'transactions'),
        where('isPublicVote', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
    )

    unsubscribe = onSnapshot(q, snap => {
        snap.docChanges().forEach(change => {
            if (change.type !== 'added') return
            const data = change.doc.data();
            const vote = {
                id: change.doc.id,
                candidateName: props.candidates.find(c => c.id ===data.candidatoId).name ?? 'Desconhecido',
                ...data
            }

            // evita duplicação
            if (seenIds.has(vote.id)) return
            seenIds.add(vote.id)

            votes.value.unshift(vote)
            votes.value = votes.value.sort((a, b) => b.createdAt - a.createdAt)
        })
    })
}

onMounted(startListener)

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe()
        unsubscribe = null
    }
})
</script>

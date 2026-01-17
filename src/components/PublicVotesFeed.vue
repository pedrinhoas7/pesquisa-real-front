<template>
    <div class="flex flex-col bg-white rounded-2xl border border-gray-100
           min-h-[320px] max-h-[60vh]">
        <!-- Header -->
        <div class="px-4 py-3 border-b bg-gray-50 shrink-0">
            <h3 class="text-sm font-semibold text-gray-800">
                Votos públicos
            </h3>
        </div>

        <!-- Scroll -->
        <div class="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            <div v-for="vote in votes" :key="vote.id" class="flex items-start gap-3 bg-white border border-gray-100
               rounded-xl px-3 py-2 shadow-sm">
                <div class="w-9 h-9 rounded-full bg-gray-200
                 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {{ (vote.nickname.toUpperCase() || 'A')[0] }}
                </div>

                <!-- Content -->
                <div class="flex-1">
                    <p class="text-sm text-gray-800 leading-tight">
                        <span class="font-semibold">
                            {{ vote.nickname || 'Anônimo' }}
                        </span>
                        <span class="text-gray-500">
                            votou em
                        </span>
                        <span class="font-medium">
                            {{ vote.candidateName }}
                        </span>
                    </p>

                    <p class="text-[11px] text-gray-400 mt-0.5">
                        {{ formatTime(vote.createdAt) }}
                    </p>
                </div>
            </div>

            <div v-if="!votes.length" class="flex items-center justify-center py-10 text-gray-400">
                Nenhum voto público ainda
            </div>
        </div>
    </div>
</template>




<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { Candidate } from '@/types/Candidate'

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

            const vote = {
                id: change.doc.id,
                candidateName: props.candidates.find(c => c.id === change.doc.data().candidatoId).name,
                ...change.doc.data()
            }

            // evita duplicação
            if (seenIds.has(vote.id)) return
            seenIds.add(vote.id)

            votes.value.unshift(vote)
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

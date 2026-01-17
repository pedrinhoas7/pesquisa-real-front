<template>
  <div class="mx-auto px-8 md:px-20 space-y-12">

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500">
      Carregando dados…
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-red-500">
      Erro ao carregar o dados
    </div>

    <!-- Dashboard -->
    <template v-else>
      <!-- Stats -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard :value="stats.total.toLocaleString('pt-BR')" label="Total de participações"
          iconBg="bg-emerald-100 text-emerald-600">
          <template #icon>📊</template>
        </StatsCard>

        <StatsCard :value="stats.confirmed.toLocaleString('pt-BR')" label="Confirmados"
          iconBg="bg-blue-100 text-blue-600">
          <template #icon>✔️</template>
        </StatsCard>

        <StatsCard :value="stats.pending.toLocaleString('pt-BR')" label="Pendentes"
          iconBg="bg-yellow-100 text-yellow-600">
          <template #icon>⏳</template>
        </StatsCard>
      </section>

      <!-- Candidates -->
      <section class="space-y-5">
        <div class="space-y-4">
          <CandidateCard v-for="candidate in candidates" :key="candidate.id" :candidate="candidate"
            @participate="openModal" />
        </div>
      </section>

      <!-- Modal -->
      <VoteModal v-if="selected" :candidate="selected" @close="selected = null" />
    </template>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CandidateCard from '@/components/CandidateCard.vue'
import VoteModal from '@/components/VoteModal.vue'
import StatsCard from '@/components/StatsCard.vue'
import { getDashboard } from '@/services/dashboard'
import type { Candidate } from '@/types/Candidate'

const candidates = ref<Candidate[]>([])
const stats = ref({
  total: 0,
  confirmed: 0,
  pending: 0
})

const loading = ref(true)
const error = ref(false)

const selected = ref<Candidate | null>(null)

async function loadDashboard() {
  try {
    loading.value = true
    error.value = false

    const data = await getDashboard()

    const totalConfirmed = data.candidates.reduce((sum, c) => sum + c.confirmedVotes, 0) || 1

    data.candidates.map((c: Candidate) => (
      c.percentage = Math.round((c.confirmedVotes / totalConfirmed) * 100)
    ))

    candidates.value = data.candidates.sort((a, b) => b.confirmedVotes - a.confirmedVotes)

    stats.value = data.stats
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
}


function openModal(candidate: Candidate) {
  selected.value = candidate
}

onMounted(loadDashboard)
</script>

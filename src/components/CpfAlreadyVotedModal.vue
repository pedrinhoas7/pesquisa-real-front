<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
           flex items-center justify-center px-4"
  >
    <div
      class="bg-white w-full max-w-sm rounded-2xl
             shadow-xl border border-gray-100
             text-center px-6 py-8 space-y-6"
    >
      <!-- Icon -->
      <div
        class="mx-auto w-16 h-16 rounded-full
               bg-amber-100 text-amber-600
               flex items-center justify-center text-3xl"
      >
        !
      </div>

      <!-- Title -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900">
          CPF já utilizado
        </h2>
        <p class="text-sm text-gray-500 leading-relaxed">
          Já existe um voto registrado para este CPF.
          Você ainda pode apoiar a iniciativa com uma
          contribuição simbólica via PIX.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          class="w-full bg-emerald-600 hover:bg-emerald-700
                 transition text-white font-semibold
                 py-3 rounded-xl"
          @click="$emit('contribute')"
        >
          Contribuir com PIX
        </button>

        <button
          class="w-full text-sm text-gray-500
                 hover:text-gray-700 transition"
          @click="$emit('close')"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

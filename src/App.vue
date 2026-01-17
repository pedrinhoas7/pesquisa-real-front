<template>
  <div class="min-h-screen flex flex-col">
    <Header/>

    <main class="flex-1 py-8">
      <Home />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Home from '@/pages/Home.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import './assets/main.css'
</script>


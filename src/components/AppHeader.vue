<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <header class="app-header">
    <span class="clinic-name">{{ auth.user?.clinicName ?? 'Sapphira Privé' }}</span>
    <span class="header-date">{{ new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
  </header>
</template>

<style scoped>
.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 32px; border-bottom: 1px solid var(--border);
  background: var(--bg2);
}
.clinic-name { color: var(--gold); font-size: 15px; font-weight: 600; letter-spacing: 0.5px; }
.header-date { color: var(--dim); font-size: 13px; }
</style>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const auth  = useAuthStore()
const showLayout = computed(() => auth.isAuthenticated && !route.meta.public)
</script>

<template>
  <div v-if="showLayout" class="admin-layout">
    <AppSidebar />
    <div class="main-content">
      <AppHeader />
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
  <RouterView v-else />
</template>

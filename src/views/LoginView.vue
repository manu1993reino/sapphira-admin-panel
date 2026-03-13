<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()
const username = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = 'Introduce usuario y contraseña'
    return
  }
  loading.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message === '401'
      ? 'Usuario o contraseña incorrectos'
      : 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <p class="logo-title">Sapphira Privé</p>
        <p class="logo-sub">Panel de Administración</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">Usuario</label>
          <input v-model="username" class="form-input" type="text" placeholder="admin@miclinica" autocomplete="username" />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input v-model="password" class="form-input" type="password" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px" :disabled="loading">
          {{ loading ? 'Accediendo...' : 'Acceder' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); padding: 24px;
}
.login-card {
  width: 100%; max-width: 400px;
  background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 40px 36px;
}
.login-logo { text-align: center; margin-bottom: 32px; }
.logo-title { color: var(--gold); font-size: 22px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
.logo-sub   { color: var(--dim); font-size: 13px; }
</style>

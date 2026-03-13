<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { generateCodes, getCodes } from '@/services/api'

const auth      = useAuthStore()
const codes     = ref([])
const loading   = ref(false)
const error     = ref('')
const activeOnly = ref(false)

// Generate form
const qty     = ref(1)
const hours   = ref(72)
const genErr  = ref('')
const genOk   = ref('')
const genLoad = ref(false)

async function loadCodes() {
  loading.value = true
  error.value = ''
  try {
    codes.value = await getCodes(auth.token, activeOnly.value)
  } catch {
    error.value = 'Error al cargar códigos'
  } finally {
    loading.value = false
  }
}

onMounted(loadCodes)

async function handleGenerate() {
  genErr.value = ''
  genOk.value  = ''
  if (!qty.value || qty.value < 1 || qty.value > 100) {
    genErr.value = 'Cantidad entre 1 y 100'
    return
  }
  genLoad.value = true
  try {
    const newCodes = await generateCodes(auth.token, { quantity: Number(qty.value), expiresInHours: Number(hours.value) })
    genOk.value = `${newCodes.length} código(s) generado(s)`
    await loadCodes()
  } catch (e) {
    genErr.value = e.message || 'Error al generar'
  } finally {
    genLoad.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Códigos de vinculación</h1>
        <p class="page-subtitle">Genera y gestiona los códigos para nuevos clientes</p>
      </div>
    </div>

    <!-- Generar -->
    <div class="card" style="margin-bottom:20px">
      <p class="card-title">Generar nuevos códigos</p>
      <div v-if="genErr" class="alert alert-error">{{ genErr }}</div>
      <div v-if="genOk"  class="alert alert-success">{{ genOk }}</div>
      <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
        <div class="form-group" style="margin:0">
          <label class="form-label">Cantidad</label>
          <input v-model="qty" class="form-input" type="number" min="1" max="100" style="width:100px" />
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Validez (horas)</label>
          <input v-model="hours" class="form-input" type="number" min="1" style="width:120px" />
        </div>
        <button class="btn btn-primary" :disabled="genLoad" @click="handleGenerate">
          {{ genLoad ? 'Generando...' : 'Generar' }}
        </button>
      </div>
    </div>

    <!-- Lista -->
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <p class="card-title" style="margin:0">Códigos</p>
        <label style="display:flex;align-items:center;gap:8px;color:var(--dim);font-size:13px;cursor:pointer">
          <input type="checkbox" v-model="activeOnly" @change="loadCodes" />
          Solo activos
        </label>
      </div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="loading" style="color:var(--dim)">Cargando...</div>
      <div v-else-if="!codes.length" style="color:var(--dim)">No hay códigos</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Expira</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in codes" :key="c.id">
              <td><code style="font-size:15px;letter-spacing:2px;color:var(--gold)">{{ c.code }}</code></td>
              <td style="color:var(--dim)">{{ formatDate(c.expiresAt) }}</td>
              <td>
                <span v-if="c.used"    class="badge badge-gray">Usado</span>
                <span v-else-if="c.expired" class="badge badge-red">Expirado</span>
                <span v-else                class="badge badge-green">Activo</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

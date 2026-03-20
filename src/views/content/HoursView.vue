<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, updateHours } from '@/services/api'

const auth = useAuthStore()
const hours = ref([])
const loading = ref(false)
const error = ref('')
const saving = ref(false)
const success = ref('')

const defaultDays = [
  { dayLabel: 'Lunes', timeRange: '10:00 - 20:00', isClosed: false, sortOrder: 1 },
  { dayLabel: 'Martes', timeRange: '10:00 - 20:00', isClosed: false, sortOrder: 2 },
  { dayLabel: 'Miercoles', timeRange: '10:00 - 20:00', isClosed: false, sortOrder: 3 },
  { dayLabel: 'Jueves', timeRange: '10:00 - 20:00', isClosed: false, sortOrder: 4 },
  { dayLabel: 'Viernes', timeRange: '10:00 - 20:00', isClosed: false, sortOrder: 5 },
  { dayLabel: 'Sabado', timeRange: '10:00 - 14:00', isClosed: false, sortOrder: 6 },
  { dayLabel: 'Domingo', timeRange: '', isClosed: true, sortOrder: 7 },
]

async function load() {
  loading.value = true; error.value = ''
  try {
    const config = await getClinicConfig(auth.clinicId)
    hours.value = config.hours?.length ? config.hours.map((h, i) => ({ ...h, sortOrder: i + 1 })) : [...defaultDays]
  } catch { error.value = 'Error al cargar horarios' }
  finally { loading.value = false }
}
onMounted(load)

async function save() {
  saving.value = true; error.value = ''; success.value = ''
  try {
    const body = { hours: hours.value.map((h, i) => ({ ...h, sortOrder: i + 1 })) }
    await updateHours(body)
    success.value = 'Horarios guardados'
    setTimeout(() => success.value = '', 3000)
  } catch (e) { error.value = e.message || 'Error al guardar' }
  finally { saving.value = false }
}

function addRow() {
  hours.value.push({ dayLabel: '', timeRange: '', isClosed: false, sortOrder: hours.value.length + 1 })
}
function removeRow(i) { hours.value.splice(i, 1) }
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Horarios</h1><p class="page-subtitle">Horario de apertura de la clinica</p></div>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Guardando...' : 'Guardar cambios' }}</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Dia</th><th>Horario</th><th>Cerrado</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(h, i) in hours" :key="i">
              <td><input v-model="h.dayLabel" class="form-input" style="width:160px" /></td>
              <td><input v-model="h.timeRange" class="form-input" style="width:200px" placeholder="10:00 - 20:00" :disabled="h.isClosed" /></td>
              <td>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="checkbox" v-model="h.isClosed" />
                  <span style="color:var(--dim);font-size:13px">Cerrado</span>
                </label>
              </td>
              <td><button class="btn btn-sm btn-danger" @click="removeRow(i)" style="padding:4px 8px">✕</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-secondary" style="margin-top:16px" @click="addRow">+ Anadir fila</button>
    </div>
  </div>
</template>

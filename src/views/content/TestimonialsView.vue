<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createTestimonial, updateTestimonial, deleteTestimonial } from '@/services/api'

const auth = useAuthStore()
const testimonials = ref([])
const loading = ref(false)
const error = ref('')

const modal = ref(null)
const form = ref({})
const modalErr = ref('')
const saving = ref(false)

async function load() {
  loading.value = true; error.value = ''
  try {
    const config = await getClinicConfig(auth.clinicId)
    testimonials.value = config.testimonials || []
  } catch { error.value = 'Error al cargar testimonios' }
  finally { loading.value = false }
}
onMounted(load)

function openCreate() {
  form.value = { name: '', badge: '', text: '', rating: 5, treatment: '', dateLabel: '', sortOrder: 0 }
  modal.value = { mode: 'create' }; modalErr.value = ''
}
function openEdit(t) {
  form.value = { ...t }
  modal.value = { mode: 'edit', id: t.id }; modalErr.value = ''
}
async function submitForm() {
  if (!form.value.name?.trim()) { modalErr.value = 'El nombre es obligatorio'; return }
  saving.value = true; modalErr.value = ''
  try {
    const body = { ...form.value, rating: Number(form.value.rating) || 5, sortOrder: Number(form.value.sortOrder) || 0 }
    if (modal.value.mode === 'create') await createTestimonial(body)
    else await updateTestimonial(modal.value.id, body)
    await load(); modal.value = null
  } catch (e) { modalErr.value = e.message || 'Error' }
  finally { saving.value = false }
}
async function handleDelete(id) {
  if (!confirm('¿Eliminar este testimonio?')) return
  try { await deleteTestimonial(id); await load() } catch { error.value = 'Error al eliminar' }
}

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Testimonios</h1><p class="page-subtitle">Resenas de clientes</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo testimonio</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!testimonials.length" style="color:var(--dim)">No hay testimonios</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Cliente</th><th>Valoracion</th><th>Tratamiento</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="t in testimonials" :key="t.id">
              <td>
                <div style="font-weight:500">{{ t.name }}</div>
                <div v-if="t.text" style="color:var(--dim);font-size:12px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.text }}</div>
              </td>
              <td><span style="color:var(--gold);letter-spacing:2px">{{ stars(t.rating) }}</span></td>
              <td style="color:var(--dim)">{{ t.treatment || '—' }}</td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openEdit(t)">Editar</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(t.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal = null">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nuevo testimonio' : 'Editar testimonio' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Nombre *</label><input v-model="form.name" class="form-input" placeholder="Maria G." /></div>
          <div class="form-group"><label class="form-label">Badge</label><input v-model="form.badge" class="form-input" placeholder="Cliente VIP" /></div>
        </div>
        <div class="form-group"><label class="form-label">Texto</label><textarea v-model="form.text" class="form-input" rows="3" style="resize:vertical"></textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Valoracion</label>
            <select v-model="form.rating" class="form-input">
              <option v-for="n in 5" :key="n" :value="n">{{ stars(n) }}</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Tratamiento</label><input v-model="form.treatment" class="form-input" placeholder="Botox" /></div>
          <div class="form-group"><label class="form-label">Fecha</label><input v-model="form.dateLabel" class="form-input" placeholder="Marzo 2026" /></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="modal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

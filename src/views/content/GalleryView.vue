<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/api'

const auth = useAuthStore()
const items = ref([])
const loading = ref(false)
const error = ref('')

const modal = ref(null)
const form = ref({})
const modalErr = ref('')
const saving = ref(false)

async function load() {
  loading.value = true; error.value = ''
  try {
    const config = await getClinicConfig()
    items.value = config.gallery || []
  } catch { error.value = 'Error al cargar galeria' }
  finally { loading.value = false }
}
onMounted(load)

function openCreate() {
  form.value = { title: '', sessions: '', color: '#C8A96E', beforeImg: '', afterImg: '', sortOrder: 0 }
  modal.value = { mode: 'create' }; modalErr.value = ''
}
function openEdit(g) {
  form.value = { ...g }
  modal.value = { mode: 'edit', id: g.id }; modalErr.value = ''
}
async function submitForm() {
  if (!form.value.title?.trim()) { modalErr.value = 'El titulo es obligatorio'; return }
  saving.value = true; modalErr.value = ''
  try {
    const body = { ...form.value, sortOrder: Number(form.value.sortOrder) || 0 }
    if (modal.value.mode === 'create') await createGalleryItem(body)
    else await updateGalleryItem(modal.value.id, body)
    await load(); modal.value = null
  } catch (e) { modalErr.value = e.message || 'Error' }
  finally { saving.value = false }
}
async function handleDelete(id) {
  if (!confirm('¿Eliminar esta entrada?')) return
  try { await deleteGalleryItem(id); await load() } catch { error.value = 'Error al eliminar' }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Galeria</h1><p class="page-subtitle">Resultados antes y despues</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nueva entrada</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else>
      <div v-if="!items.length" class="card" style="color:var(--dim)">No hay entradas en la galeria</div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:16px">
        <div v-for="g in items" :key="g.id" class="card">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
            <div>
              <div style="font-weight:600">{{ g.title }}</div>
              <div v-if="g.sessions" style="color:var(--dim);font-size:13px">{{ g.sessions }}</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-secondary" @click="openEdit(g)">Editar</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(g.id)">Eliminar</button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <div style="color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Antes</div>
              <div v-if="g.beforeImg" style="border-radius:8px;overflow:hidden;aspect-ratio:4/3;background:var(--bg3)">
                <img :src="g.beforeImg" style="width:100%;height:100%;object-fit:cover" />
              </div>
              <div v-else style="border-radius:8px;aspect-ratio:4/3;background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:12px">Sin imagen</div>
            </div>
            <div>
              <div style="color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Despues</div>
              <div v-if="g.afterImg" style="border-radius:8px;overflow:hidden;aspect-ratio:4/3;background:var(--bg3)">
                <img :src="g.afterImg" style="width:100%;height:100%;object-fit:cover" />
              </div>
              <div v-else style="border-radius:8px;aspect-ratio:4/3;background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:12px">Sin imagen</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal = null">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nueva entrada' : 'Editar entrada' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Titulo *</label><input v-model="form.title" class="form-input" placeholder="Rejuvenecimiento facial" /></div>
          <div class="form-group"><label class="form-label">Sesiones</label><input v-model="form.sessions" class="form-input" placeholder="3 sesiones" /></div>
        </div>
        <div class="form-group"><label class="form-label">URL imagen ANTES</label><input v-model="form.beforeImg" class="form-input" placeholder="https://..." /></div>
        <div class="form-group"><label class="form-label">URL imagen DESPUES</label><input v-model="form.afterImg" class="form-input" placeholder="https://..." /></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Color</label><input v-model="form.color" class="form-input" type="color" style="height:44px;padding:4px" /></div>
          <div class="form-group"><label class="form-label">Orden</label><input v-model="form.sortOrder" class="form-input" type="number" /></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="modal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

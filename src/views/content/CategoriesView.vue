<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createCategory, updateCategory, deleteCategory, createTreatment, updateTreatment, deleteTreatment } from '@/services/api'

const auth = useAuthStore()
const categories = ref([])
const loading = ref(false)
const error = ref('')

// Category modal
const catModal = ref(null)
const catForm = ref({})
const catErr = ref('')
const catSaving = ref(false)

// Treatment modal
const treatModal = ref(null)
const treatForm = ref({})
const treatErr = ref('')
const treatSaving = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const config = await getClinicConfig()
    categories.value = config.categories || []
  } catch {
    error.value = 'Error al cargar categorias'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Categories ──
function openCreateCat() {
  catForm.value = { name: '', label: '', icon: '', color: '#C8A96E', isMedical: false, sortOrder: 0 }
  catModal.value = { mode: 'create' }
  catErr.value = ''
}
function openEditCat(c) {
  catForm.value = { ...c }
  catModal.value = { mode: 'edit', id: c.id }
  catErr.value = ''
}
async function submitCat() {
  if (!catForm.value.name?.trim()) { catErr.value = 'El nombre es obligatorio'; return }
  catSaving.value = true; catErr.value = ''
  try {
    const body = { ...catForm.value, sortOrder: Number(catForm.value.sortOrder) || 0 }
    if (catModal.value.mode === 'create') await createCategory(body)
    else await updateCategory(catModal.value.id, body)
    await load(); catModal.value = null
  } catch (e) { catErr.value = e.message || 'Error' }
  finally { catSaving.value = false }
}
async function handleDeleteCat(id) {
  if (!confirm('¿Eliminar esta categoria y sus tratamientos?')) return
  try { await deleteCategory(id); await load() } catch { error.value = 'Error al eliminar' }
}

// ── Treatments ──
function openCreateTreat(categoryId) {
  treatForm.value = { categoryId, name: '', slug: '', description: '', duration: '', isMedical: false, price: '', pointsValue: 0, popular: false, sortOrder: 0 }
  treatModal.value = { mode: 'create' }
  treatErr.value = ''
}
function openEditTreat(t, categoryId) {
  treatForm.value = { ...t, categoryId }
  treatModal.value = { mode: 'edit', id: t.id }
  treatErr.value = ''
}
async function submitTreat() {
  if (!treatForm.value.name?.trim()) { treatErr.value = 'El nombre es obligatorio'; return }
  treatSaving.value = true; treatErr.value = ''
  try {
    const body = { ...treatForm.value, sortOrder: Number(treatForm.value.sortOrder) || 0, pointsValue: Number(treatForm.value.pointsValue) || 0 }
    if (treatModal.value.mode === 'create') await createTreatment(body)
    else await updateTreatment(treatModal.value.id, body)
    await load(); treatModal.value = null
  } catch (e) { treatErr.value = e.message || 'Error' }
  finally { treatSaving.value = false }
}
async function handleDeleteTreat(id) {
  if (!confirm('¿Eliminar este tratamiento?')) return
  try { await deleteTreatment(id); await load() } catch { error.value = 'Error al eliminar' }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Categorias y Tratamientos</h1>
        <p class="page-subtitle">Organiza los servicios de la clinica</p>
      </div>
      <button class="btn btn-primary" @click="openCreateCat">+ Nueva categoria</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <template v-else>
      <div v-if="!categories.length" class="card" style="color:var(--dim)">No hay categorias creadas</div>

      <div v-for="cat in categories" :key="cat.id" class="card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px">
            <span v-if="cat.icon" style="font-size:20px">{{ cat.icon }}</span>
            <div>
              <span style="font-weight:600;font-size:16px">{{ cat.name }}</span>
              <span v-if="cat.label" class="badge badge-gold" style="margin-left:8px">{{ cat.label }}</span>
              <span v-if="cat.isMedical" class="badge badge-green" style="margin-left:4px">Medico</span>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" @click="openCreateTreat(cat.id)">+ Tratamiento</button>
            <button class="btn btn-sm btn-secondary" @click="openEditCat(cat)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="handleDeleteCat(cat.id)">Eliminar</button>
          </div>
        </div>

        <div v-if="cat.treatments?.length" class="table-wrap">
          <table>
            <thead><tr><th>Tratamiento</th><th>Duracion</th><th>Precio</th><th>Puntos</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="t in cat.treatments" :key="t.id">
                <td>
                  <div style="font-weight:500">{{ t.name }}</div>
                  <div v-if="t.description" style="color:var(--dim);font-size:12px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.description }}</div>
                </td>
                <td style="color:var(--dim)">{{ t.duration || '—' }}</td>
                <td style="color:var(--gold);font-weight:600">{{ t.price || '—' }}</td>
                <td>{{ t.pointsValue || '—' }}</td>
                <td>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-sm btn-secondary" @click="openEditTreat(t, cat.id)">Editar</button>
                    <button class="btn btn-sm btn-danger" @click="handleDeleteTreat(t.id)">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else style="color:var(--dim);font-size:13px">Sin tratamientos en esta categoria</div>
      </div>
    </template>

    <!-- Category modal -->
    <div v-if="catModal" class="modal-overlay" @click.self="catModal = null">
      <div class="modal">
        <h2 class="modal-title">{{ catModal.mode === 'create' ? 'Nueva categoria' : 'Editar categoria' }}</h2>
        <div v-if="catErr" class="alert alert-error">{{ catErr }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Nombre *</label><input v-model="catForm.name" class="form-input" placeholder="Medicina Estetica" /></div>
          <div class="form-group"><label class="form-label">Label</label><input v-model="catForm.label" class="form-input" placeholder="MEDICO" /></div>
          <div class="form-group"><label class="form-label">Icono</label><input v-model="catForm.icon" class="form-input" placeholder="💉" /></div>
          <div class="form-group"><label class="form-label">Color</label><input v-model="catForm.color" class="form-input" type="color" style="height:44px;padding:4px" /></div>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:16px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" v-model="catForm.isMedical" /><span class="form-label" style="margin:0">Categoria medica</span></label>
        </div>
        <div class="form-group"><label class="form-label">Orden</label><input v-model="catForm.sortOrder" class="form-input" type="number" style="width:100px" /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="catModal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="catSaving" @click="submitCat">{{ catSaving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>

    <!-- Treatment modal -->
    <div v-if="treatModal" class="modal-overlay" @click.self="treatModal = null">
      <div class="modal">
        <h2 class="modal-title">{{ treatModal.mode === 'create' ? 'Nuevo tratamiento' : 'Editar tratamiento' }}</h2>
        <div v-if="treatErr" class="alert alert-error">{{ treatErr }}</div>
        <div class="form-group"><label class="form-label">Nombre *</label><input v-model="treatForm.name" class="form-input" placeholder="Botox facial" /></div>
        <div class="form-group"><label class="form-label">Descripcion</label><textarea v-model="treatForm.description" class="form-input" rows="2" style="resize:vertical"></textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Duracion</label><input v-model="treatForm.duration" class="form-input" placeholder="30 min" /></div>
          <div class="form-group"><label class="form-label">Precio</label><input v-model="treatForm.price" class="form-input" placeholder="150€" /></div>
          <div class="form-group"><label class="form-label">Puntos</label><input v-model="treatForm.pointsValue" class="form-input" type="number" /></div>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:16px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" v-model="treatForm.popular" /><span class="form-label" style="margin:0">Popular</span></label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" v-model="treatForm.isMedical" /><span class="form-label" style="margin:0">Medico</span></label>
        </div>
        <div class="form-group"><label class="form-label">Orden</label><input v-model="treatForm.sortOrder" class="form-input" type="number" style="width:100px" /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="treatModal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="treatSaving" @click="submitTreat">{{ treatSaving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

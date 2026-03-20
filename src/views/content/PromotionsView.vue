<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createPromotion, updatePromotion, deletePromotion } from '@/services/api'

const auth = useAuthStore()
const promotions = ref([])
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
    promotions.value = config.promotions || []
  } catch { error.value = 'Error al cargar promociones' }
  finally { loading.value = false }
}
onMounted(load)

function openCreate() {
  form.value = { title: '', subtitle: '', description: '', emoji: '', oldPrice: '', newPrice: '', tag: '', color: '#C8A96E', ctaUrl: '', startDate: '', endDate: '', sortOrder: 0 }
  modal.value = { mode: 'create' }; modalErr.value = ''
}
function openEdit(p) {
  form.value = { ...p }
  modal.value = { mode: 'edit', id: p.id }; modalErr.value = ''
}
async function submitForm() {
  if (!form.value.title?.trim()) { modalErr.value = 'El titulo es obligatorio'; return }
  saving.value = true; modalErr.value = ''
  try {
    const body = { ...form.value, sortOrder: Number(form.value.sortOrder) || 0, startDate: form.value.startDate || null, endDate: form.value.endDate || null }
    if (modal.value.mode === 'create') await createPromotion(body)
    else await updatePromotion(modal.value.id, body)
    await load(); modal.value = null
  } catch (e) { modalErr.value = e.message || 'Error' }
  finally { saving.value = false }
}
async function handleDelete(id) {
  if (!confirm('¿Eliminar esta promocion?')) return
  try { await deletePromotion(id); await load() } catch { error.value = 'Error al eliminar' }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-ES') : '—' }
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Promociones</h1><p class="page-subtitle">Ofertas visibles en la app</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nueva promocion</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!promotions.length" style="color:var(--dim)">No hay promociones</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Promocion</th><th>Precio</th><th>Periodo</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="p in promotions" :key="p.id">
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <span v-if="p.emoji" style="font-size:20px">{{ p.emoji }}</span>
                  <div>
                    <div style="font-weight:500">{{ p.title }}</div>
                    <div v-if="p.subtitle" style="color:var(--dim);font-size:12px">{{ p.subtitle }}</div>
                  </div>
                  <span v-if="p.tag" class="badge badge-gold" style="margin-left:4px">{{ p.tag }}</span>
                </div>
              </td>
              <td>
                <span v-if="p.oldPrice" style="text-decoration:line-through;color:var(--dim);margin-right:6px">{{ p.oldPrice }}</span>
                <span v-if="p.newPrice" style="color:var(--gold);font-weight:600">{{ p.newPrice }}</span>
              </td>
              <td style="color:var(--dim);font-size:13px">{{ formatDate(p.startDate) }} — {{ formatDate(p.endDate) }}</td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openEdit(p)">Editar</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(p.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal = null">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nueva promocion' : 'Editar promocion' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:3fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Titulo *</label><input v-model="form.title" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Emoji</label><input v-model="form.emoji" class="form-input" placeholder="🎁" /></div>
        </div>
        <div class="form-group"><label class="form-label">Subtitulo</label><input v-model="form.subtitle" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Descripcion</label><textarea v-model="form.description" class="form-input" rows="2" style="resize:vertical"></textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Precio anterior</label><input v-model="form.oldPrice" class="form-input" placeholder="200€" /></div>
          <div class="form-group"><label class="form-label">Precio nuevo</label><input v-model="form.newPrice" class="form-input" placeholder="150€" /></div>
          <div class="form-group"><label class="form-label">Tag</label><input v-model="form.tag" class="form-input" placeholder="OFERTA" /></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Fecha inicio</label><input v-model="form.startDate" class="form-input" type="date" /></div>
          <div class="form-group"><label class="form-label">Fecha fin</label><input v-model="form.endDate" class="form-input" type="date" /></div>
        </div>
        <div class="form-group"><label class="form-label">URL CTA (WhatsApp, etc.)</label><input v-model="form.ctaUrl" class="form-input" placeholder="https://..." /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="modal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

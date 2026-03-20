<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createBlogPost, updateBlogPost, deleteBlogPost } from '@/services/api'

const auth = useAuthStore()
const posts = ref([])
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
    posts.value = config.blog || []
  } catch { error.value = 'Error al cargar blog' }
  finally { loading.value = false }
}
onMounted(load)

function openCreate() {
  form.value = { icon: '', categoryLabel: '', title: '', content: '', publishDate: '', color: '#C8A96E' }
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
    const body = { ...form.value, publishDate: form.value.publishDate || null }
    if (modal.value.mode === 'create') await createBlogPost(body)
    else await updateBlogPost(modal.value.id, body)
    await load(); modal.value = null
  } catch (e) { modalErr.value = e.message || 'Error' }
  finally { saving.value = false }
}
async function handleDelete(id) {
  if (!confirm('¿Eliminar este post?')) return
  try { await deleteBlogPost(id); await load() } catch { error.value = 'Error al eliminar' }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-ES') : '—' }
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Blog</h1><p class="page-subtitle">Articulos y consejos</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo post</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!posts.length" style="color:var(--dim)">No hay posts publicados</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Post</th><th>Categoria</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="p in posts" :key="p.id">
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <span v-if="p.icon" style="font-size:18px">{{ p.icon }}</span>
                  <span style="font-weight:500">{{ p.title }}</span>
                </div>
              </td>
              <td><span v-if="p.categoryLabel" class="badge badge-gold">{{ p.categoryLabel }}</span><span v-else style="color:var(--dim)">—</span></td>
              <td style="color:var(--dim)">{{ formatDate(p.publishDate) }}</td>
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
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nuevo post' : 'Editar post' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Icono</label><input v-model="form.icon" class="form-input" placeholder="📝" /></div>
          <div class="form-group"><label class="form-label">Categoria</label><input v-model="form.categoryLabel" class="form-input" placeholder="Consejos" /></div>
          <div class="form-group"><label class="form-label">Fecha</label><input v-model="form.publishDate" class="form-input" type="date" /></div>
        </div>
        <div class="form-group"><label class="form-label">Titulo *</label><input v-model="form.title" class="form-input" placeholder="5 tips para cuidar tu piel en verano" /></div>
        <div class="form-group"><label class="form-label">Contenido (HTML permitido)</label><textarea v-model="form.content" class="form-input" rows="8" style="resize:vertical;font-family:monospace;font-size:13px"></textarea></div>
        <div class="form-group"><label class="form-label">Color</label><input v-model="form.color" class="form-input" type="color" style="height:44px;padding:4px;width:80px" /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="modal = null">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

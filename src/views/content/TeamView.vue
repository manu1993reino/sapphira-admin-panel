<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, createTeamMember, updateTeamMember, deleteTeamMember, uploadImage } from '@/services/api'

const auth = useAuthStore()
const members = ref([])
const loading = ref(false)
const error = ref('')

const modal = ref(null)
const form = ref({})
const modalErr = ref('')
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const config = await getClinicConfig()
    members.value = config.team || []
  } catch {
    error.value = 'Error al cargar equipo'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openCreate() {
  form.value = { name: '', role: '', tag: '', initials: '', color: '#C8A96E', photoUrl: '', experience: '', bio: '', sortOrder: 0, specialties: '' }
  modal.value = { mode: 'create' }
  modalErr.value = ''
}

function openEdit(m) {
  form.value = { ...m, specialties: (m.specialties || []).map(s => s.name || s).join(', ') }
  modal.value = { mode: 'edit', id: m.id }
  modalErr.value = ''
}

function closeModal() { modal.value = null }

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  modalErr.value = ''
  try {
    const { url } = await uploadImage(file)
    form.value.photoUrl = url
  } catch (e) {
    modalErr.value = 'Error al subir imagen: ' + (e.message || 'desconocido')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removePhoto() {
  form.value.photoUrl = ''
}

async function submitForm() {
  if (!form.value.name?.trim()) { modalErr.value = 'El nombre es obligatorio'; return }
  saving.value = true
  modalErr.value = ''
  try {
    const body = {
      ...form.value,
      sortOrder: Number(form.value.sortOrder) || 0,
      specialties: form.value.specialties ? form.value.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    if (modal.value.mode === 'create') {
      await createTeamMember(body)
    } else {
      await updateTeamMember(modal.value.id, body)
    }
    await load()
    closeModal()
  } catch (e) {
    modalErr.value = e.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar este miembro?')) return
  try { await deleteTeamMember(id); await load() } catch { error.value = 'Error al eliminar' }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Equipo</h1>
        <p class="page-subtitle">Miembros del equipo de la clinica</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo miembro</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <div v-else class="card">
      <div v-if="!members.length" style="color:var(--dim)">No hay miembros del equipo</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Rol</th><th>Tag</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <img v-if="m.photoUrl" :src="m.photoUrl" :alt="m.name"
                    style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#222" />
                  <div v-else style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0"
                       :style="{ background: m.color || '#C8A96E' }">
                    {{ m.initials || m.name?.charAt(0) }}
                  </div>
                  <span style="font-weight:500">{{ m.name }}</span>
                </div>
              </td>
              <td style="color:var(--dim)">{{ m.role }}</td>
              <td><span v-if="m.tag" class="badge badge-gold">{{ m.tag }}</span></td>
              <td>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-sm btn-secondary" @click="openEdit(m)">Editar</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(m.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">{{ modal.mode === 'create' ? 'Nuevo miembro' : 'Editar miembro' }}</h2>
        <div v-if="modalErr" class="alert alert-error">{{ modalErr }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Nombre *</label><input v-model="form.name" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Rol</label><input v-model="form.role" class="form-input" placeholder="Directora medica" /></div>
          <div class="form-group"><label class="form-label">Tag</label><input v-model="form.tag" class="form-input" placeholder="Dra." /></div>
          <div class="form-group"><label class="form-label">Iniciales</label><input v-model="form.initials" class="form-input" placeholder="MC" /></div>
          <div class="form-group"><label class="form-label">Color</label><input v-model="form.color" class="form-input" type="color" style="height:44px;padding:4px" /></div>
          <div class="form-group"><label class="form-label">Orden</label><input v-model="form.sortOrder" class="form-input" type="number" /></div>
        </div>
        <div class="form-group">
          <label class="form-label">Foto</label>
          <div style="display:flex;align-items:center;gap:14px">
            <div v-if="form.photoUrl" style="position:relative">
              <img :src="form.photoUrl" alt="Foto" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);background:#222" />
              <button type="button" @click="removePhoto" style="position:absolute;top:-4px;right:-4px;width:22px;height:22px;border-radius:50%;background:#e74c3c;border:2px solid var(--bg);color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1" title="Quitar foto">&times;</button>
            </div>
            <div v-else style="width:72px;height:72px;border-radius:50%;border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:11px;text-align:center">
              Sin foto
            </div>
            <div>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="handleFileUpload" />
              <button type="button" class="btn btn-sm btn-secondary" :disabled="uploading" @click="fileInput?.click()">
                {{ uploading ? 'Subiendo...' : (form.photoUrl ? 'Cambiar' : 'Subir foto') }}
              </button>
              <p style="color:var(--dim);font-size:11px;margin:6px 0 0">JPG, PNG o WebP. Máx 5 MB.</p>
            </div>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Experiencia</label><input v-model="form.experience" class="form-input" placeholder="15 anos de experiencia" /></div>
        <div class="form-group"><label class="form-label">Bio</label><textarea v-model="form.bio" class="form-input" rows="3" style="resize:vertical"></textarea></div>
        <div class="form-group"><label class="form-label">Especialidades (separadas por coma)</label><input v-model="form.specialties" class="form-input" placeholder="Medicina estetica, Laser" /></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitForm">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

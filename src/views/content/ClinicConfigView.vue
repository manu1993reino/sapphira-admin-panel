<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getClinicConfig, updateClinicConfig } from '@/services/api'

const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const saving = ref(false)
const success = ref('')

const form = ref({
  name: '', shortName: '', tagline: '', location: '', city: '',
  themeColor: '#C8A96E', bgColor: '#0F0F0F', logoUrl: '',
  phone: '', phoneIntl: '', email: '', webUrl: '',
  whatsappUrl: '', instagramUrl: '', igHandle: '', facebookUrl: '',
  mapsUrl: '', flowwwUrl: '', reviewUrl: '',
  financeEnabled: false, financeTitle: '', financeSubtitle: '', financeWaText: '',
})

async function load() {
  loading.value = true; error.value = ''
  try {
    const config = await getClinicConfig()
    const b = config.brand || {}
    const c = config.contact || {}
    const f = config.finance || {}
    form.value = {
      name: b.name || '', shortName: b.shortName || '', tagline: b.tagline || '',
      location: b.location || '', city: b.city || '',
      themeColor: b.themeColor || '#C8A96E', bgColor: b.bgColor || '#0F0F0F', logoUrl: b.logoUrl || '',
      phone: c.phone || '', phoneIntl: c.phoneIntl || '', email: c.email || '', webUrl: c.webUrl || '',
      whatsappUrl: c.whatsappUrl || '', instagramUrl: c.instagramUrl || '', igHandle: c.igHandle || '',
      facebookUrl: c.facebookUrl || '', mapsUrl: c.mapsUrl || '', flowwwUrl: c.flowwwUrl || '', reviewUrl: c.reviewUrl || '',
      financeEnabled: f.enabled || false, financeTitle: f.title || '', financeSubtitle: f.subtitle || '', financeWaText: f.whatsappText || '',
    }
  } catch { error.value = 'Error al cargar configuracion' }
  finally { loading.value = false }
}
onMounted(load)

async function save() {
  saving.value = true; error.value = ''; success.value = ''
  try {
    await updateClinicConfig(form.value)
    success.value = 'Configuracion guardada'
    setTimeout(() => success.value = '', 3000)
  } catch (e) { error.value = e.message || 'Error al guardar' }
  finally { saving.value = false }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><h1 class="page-title">Configuracion de clinica</h1><p class="page-subtitle">Datos generales, contacto y financiacion</p></div>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Guardando...' : 'Guardar cambios' }}</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>
    <div v-if="loading" style="color:var(--dim)">Cargando...</div>

    <template v-else>
      <!-- Marca -->
      <div class="card" style="margin-bottom:20px">
        <p class="card-title">Marca</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Nombre completo</label><input v-model="form.name" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Nombre corto</label><input v-model="form.shortName" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Tagline</label><input v-model="form.tagline" class="form-input" placeholder="Tu clinica de confianza" /></div>
          <div class="form-group"><label class="form-label">Ciudad</label><input v-model="form.city" class="form-input" /></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">Ubicacion</label><input v-model="form.location" class="form-input" placeholder="Calle ejemplo 123, Madrid" /></div>
        </div>
      </div>

      <!-- Contacto -->
      <div class="card" style="margin-bottom:20px">
        <p class="card-title">Contacto</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label class="form-label">Telefono</label><input v-model="form.phone" class="form-input" placeholder="912 345 678" /></div>
          <div class="form-group"><label class="form-label">Telefono intl.</label><input v-model="form.phoneIntl" class="form-input" placeholder="+34912345678" /></div>
          <div class="form-group"><label class="form-label">Email</label><input v-model="form.email" class="form-input" type="email" /></div>
          <div class="form-group"><label class="form-label">Web</label><input v-model="form.webUrl" class="form-input" placeholder="https://..." /></div>
          <div class="form-group"><label class="form-label">WhatsApp URL</label><input v-model="form.whatsappUrl" class="form-input" placeholder="https://wa.me/..." /></div>
          <div class="form-group"><label class="form-label">Instagram URL</label><input v-model="form.instagramUrl" class="form-input" placeholder="https://instagram.com/..." /></div>
          <div class="form-group"><label class="form-label">Instagram handle</label><input v-model="form.igHandle" class="form-input" placeholder="@miclinica" /></div>
          <div class="form-group"><label class="form-label">Facebook URL</label><input v-model="form.facebookUrl" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Google Maps URL</label><input v-model="form.mapsUrl" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Flowww URL (reservas)</label><input v-model="form.flowwwUrl" class="form-input" /></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">URL resenas Google</label><input v-model="form.reviewUrl" class="form-input" /></div>
        </div>
      </div>

      <!-- Financiacion -->
      <div class="card">
        <p class="card-title">Financiacion</p>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" v-model="form.financeEnabled" />
            <span class="form-label" style="margin:0">Mostrar seccion de financiacion en la app</span>
          </label>
        </div>
        <template v-if="form.financeEnabled">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group"><label class="form-label">Titulo</label><input v-model="form.financeTitle" class="form-input" placeholder="Financiacion disponible" /></div>
            <div class="form-group"><label class="form-label">Subtitulo</label><input v-model="form.financeSubtitle" class="form-input" placeholder="Hasta 12 meses sin intereses" /></div>
          </div>
          <div class="form-group"><label class="form-label">Texto WhatsApp</label><input v-model="form.financeWaText" class="form-input" placeholder="Hola, me gustaria informacion sobre financiacion" /></div>
        </template>
      </div>
    </template>
  </div>
</template>

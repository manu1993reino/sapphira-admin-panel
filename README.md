# Sapphira Privé — Panel de Administración

Panel web para la gestión del programa de fidelización **Sapphira Privé**. Acceso exclusivo para administradores de clínica y superadmins.

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | Vue 3 (Composition API) |
| Build | Vite |
| Estado | Pinia |
| Routing | Vue Router 4 |

## Requisitos

- Node.js 18+
- Backend `sapphira-api` corriendo en `localhost:8080`

## Arranque local

1. Instala dependencias y arranca:
   ```bash
   npm install
   npm run dev
   ```

El panel estará disponible en `http://localhost:5174`.

## Acceso

Credenciales de administrador gestionadas por el equipo de Valore Digital. El panel diferencia automáticamente entre dos roles:

| Rol | Acceso |
|-----|--------|
| `CLINIC_ADMIN` | Gestión de su clínica: clientes, puntos, códigos, recompensas |
| `SUPERADMIN` | Acceso total + gestión de clínicas y administradores |

## Funcionalidades

- **Dashboard** — Estadísticas de actividad de la clínica
- **Clientes** — Búsqueda y gestión de puntos (asignar / restar)
- **Códigos** — Generación de códigos de vinculación en lote
- **Recompensas** — CRUD del catálogo de canjes
- **Clínicas** *(solo SUPERADMIN)* — Crear y activar/desactivar clínicas
- **Administradores** *(solo SUPERADMIN)* — Crear admins y resetear contraseñas

## Estructura

```
src/
├── stores/         # Pinia — auth.js
├── services/       # api.js — fetch centralizado
├── router/         # Vue Router con guards de rol
├── components/     # AppSidebar, AppHeader
├── views/          # Vistas por sección
│   └── superadmin/ # Vistas exclusivas SUPERADMIN
└── styles/         # global.css — dark theme
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend |

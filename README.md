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

- **Dashboard** — Estadísticas de actividad (diferenciado por rol)
- **Clientes** — Búsqueda y gestión de puntos (asignar / restar con modal)
- **Códigos** — Generación de códigos de vinculación en lote + listado con estados
- **Recompensas** — CRUD del catálogo de canjes
- **Canjes** — Listado de canjes pendientes, marcar como usado
- **CMS completo** — 8 vistas de contenido:
  - Config clínica (datos generales + financiación + Google Place ID)
  - Equipo, Categorías, Promociones, Testimonios, Galería, Blog, Horarios
- **Clínicas** *(solo SUPERADMIN)* — Crear y activar/desactivar clínicas
- **Administradores** *(solo SUPERADMIN)* — Crear admins y resetear contraseñas

## Estructura

```
src/
├── stores/         # Pinia — auth.js (user info + role, NO token)
├── services/       # api.js — fetch centralizado con credentials:'include'
├── router/         # Vue Router con guards: requiresAuth + superOnly
├── components/     # AppSidebar, AppHeader
├── views/          # Vistas principales (6)
│   ├── content/    # CMS de la clínica (8 vistas)
│   └── superadmin/ # Vistas exclusivas SUPERADMIN (2)
└── styles/         # global.css — dark theme (#0F0F0F + #C8A96E)
```

## Autenticación

El panel usa cookies HttpOnly (`sapphira_admin_access`) gestionadas por el backend. En localStorage solo se guardan datos no sensibles (role, clinicId) para routing guards. El token nunca se almacena en el cliente.

## Notas

- No requiere `.env` — el proxy de Vite redirige `/api` a `localhost:8080`
- En producción, Nginx hace el proxy inverso
- Dark theme con CSS variables, sin librerías UI externas

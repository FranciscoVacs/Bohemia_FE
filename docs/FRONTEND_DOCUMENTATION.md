# Bohemia Frontend - Documentación Técnica

## Índice

1. [Información General](#información-general)
2. [Arquitectura](#arquitectura)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración](#configuración)
5. [Rutas](#rutas)
6. [Modelos](#modelos)
7. [Servicios](#servicios)
8. [Componentes](#componentes)
9. [Guards e Interceptors](#guards-e-interceptors)
10. [Panel de Administración](#panel-de-administración)

---

## Información General

- **Framework**: Angular 19+ (Standalone Components)
- **Estilos**: Tailwind CSS v4
- **Fuentes**: Anton (display), Inter (sans)
- **Iconos**: Material Symbols Outlined
- **Estado**: Angular Signals

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        App Root                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Navbar    │  │  AuthModal  │  │   Router Outlet     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                              │               │
│                    ┌─────────────────────────┴───────┐       │
│                    │                                 │       │
│              ┌─────▼─────┐                   ┌──────▼──────┐│
│              │   Public   │                   │    Admin    ││
│              │   Routes   │                   │   Routes    ││
│              └───────────┘                   └─────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
Usuario → Login → AuthService → API Backend
                      ↓
              Token en localStorage
                      ↓
              AuthInterceptor agrega
              header Authorization
                      ↓
              Peticiones autenticadas
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── admin/                    # Módulo de administración
│   │   ├── components/           # Componentes del admin
│   │   │   ├── admin-navbar/
│   │   │   ├── event-form/
│   │   │   ├── event-list/
│   │   │   ├── gallery-manager/
│   │   │   └── ticket-config/
│   │   ├── guards/               # Guards de rutas
│   │   │   └── admin.guard.ts
│   │   ├── pages/                # Páginas del admin
│   │   │   └── event-management/
│   │   ├── services/             # Servicios del admin
│   │   │   ├── admin-event.service.ts
│   │   │   ├── dj.service.ts
│   │   │   ├── gallery.service.ts
│   │   │   ├── location.service.ts
│   │   │   └── ticket-type.service.ts
│   │   └── admin.routes.ts
│   ├── auth-modal/               # Modal de login/registro
│   ├── event-card/               # Card de evento
│   ├── galeria/                  # Página de galería pública
│   ├── hero/                     # Sección hero
│   ├── home/                     # Página principal
│   ├── interceptors/             # HTTP Interceptors
│   │   └── auth.interceptor.ts
│   ├── models/                   # Interfaces TypeScript
│   ├── navbar/                   # Barra de navegación
│   ├── pipes/                    # Pipes personalizados
│   ├── services/                 # Servicios globales
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   └── modal.service.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
└── styles.css
```

---

## Configuración

### Environment (Development)

```typescript
// src/environments/environment.development.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
};
```

### App Config

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled'
    })),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```

---

## Rutas

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `HomeComponent` | Página principal con hero y eventos |
| `/galeria` | `GaleriaComponent` | Galería pública de fotos |

### Rutas de Administración (Protegidas)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/admin` | `EventManagementComponent` | Dashboard principal del admin |
| `/admin/eventos/crear` | `EventFormComponent` | Crear nuevo evento |
| `/admin/eventos/:id/editar` | `EventFormComponent` | Editar evento existente |
| `/admin/eventos/:id/tickets` | `TicketConfigComponent` | Configurar tipos de tickets |
| `/admin/eventos/:id/galeria` | `GalleryManagerComponent` | Gestionar galería del evento |

> **Nota**: Todas las rutas `/admin/*` están protegidas por `adminGuard`

---

## Modelos

### User

```typescript
interface User {
  id: number;
  email: string;
  userName: string;
  userSurname: string;
  birthDate: string;
  isAdmin: boolean;
}
```

### Event (Público)

```typescript
interface Event {
    id: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    eventDescription: string;
    minAge: number;
    coverPhoto: string;
    ticketsOnSale: number;
    location?: Location;
    dj?: Dj;
    ticketTypes?: TicketType[];
}
```

### AdminEvent (Panel Admin)

```typescript
interface AdminEvent {
    id: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    eventDescription: string;
    minAge: number;
    coverPhoto: string;
    location: {
        locationName: string;
        address: string;
        city: {
            cityName: string;
        };
    };
    dj: {
        djApodo: string;
    };
    ticketTypes?: AdminTicketType[];
    isGalleryPublished: boolean;
    isPublished: boolean;
}
```

### TicketType

```typescript
interface TicketType {
  id: number;
  ticketTypeName: string;
  beginDatetime: string;
  finishDatetime: string;
  price: number;
  maxQuantity: number;
  availableTickets: number;
  event?: Event;
}

interface AdminCreateTicketType {
  ticketTypeName: string;
  beginDatetime: string | null;
  finishDatetime: string | null;
  price: number;
  maxQuantity: number;
  event: number | null;
  saleMode?: string;
  isManuallyActivated?: boolean;
}
```

### Auth

```typescript
interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    userName: string;
    userSurname: string;
    email: string;
    password: string;
    birthDate: string;
}
```

### Location & DJ

```typescript
interface City {
    id: number;
    cityName: string;
}

interface Location {
    id: number;
    locationName: string;
    address: string;
    maxCapacity: number;
    city: City;
}

interface Dj {
    id: number;
    djName: string;
    djSurname: string;
    djApodo: string;
}
```

### GalleryImage

```typescript
interface GalleryImage {
    id: number;
    cloudinaryUrl: string;
    publicId: string;
    originalName: string;
    createdAt?: string;
}
```

---

## Servicios

### AuthService

Maneja la autenticación de usuarios.

| Método | Tipo | Descripción |
|--------|------|-------------|
| `login(credentials)` | `Observable<ApiResponse<User>>` | Inicia sesión |
| `register(data)` | `Observable<ApiResponse<User>>` | Registra nuevo usuario |
| `loadCurrentUser()` | `Observable<ApiResponse<User>>` | Carga usuario actual |
| `logout()` | `void` | Cierra sesión |

**Signals expuestos:**
- `currentUser` - Usuario actual (readonly)
- `token` - Token JWT (readonly)
- `isAuthenticated` - Computed boolean
- `isAdmin` - Computed boolean

**Endpoints:**
```
POST /api/user/login     → Login
POST /api/user/register  → Registro
GET  /api/user/me        → Usuario actual
```

---

### ModalService

Controla el estado del modal de autenticación.

| Método | Descripción |
|--------|-------------|
| `openLogin()` | Abre modal en vista login |
| `openRegister()` | Abre modal en vista registro |
| `close()` | Cierra el modal |
| `switchView()` | Alterna entre login/registro |

**Signals:**
- `isOpen` - Estado del modal
- `currentView` - 'LOGIN' o 'REGISTER'

---

### EventService (Público)

Servicio para obtener eventos públicos.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getFutureEvents()` | `GET /api/event/future` | Eventos futuros |
| `getEventById(id)` | `GET /api/event/:id` | Evento por ID |
| `getTicketTypes(eventId)` | `GET /api/event/:id/ticketType` | Tipos de tickets |

---

### AdminEventService

Servicio para gestión de eventos (solo admin).

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getAllEvents()` | `GET /api/event/admin` | Todos los eventos |
| `getEventById(id)` | `GET /api/event/:id` | Evento por ID |
| `createEvent(formData)` | `POST /api/event/crear` | Crear evento |
| `updateEvent(id, formData)` | `PATCH /api/event/:id` | Actualizar evento |
| `deleteEvent(id)` | `DELETE /api/event/:id` | Eliminar evento |
| `updateGalleryStatus(id, isPublished)` | `PATCH /api/event/:id/gallery-status` | Estado galería |
| `publishEvent(id)` | `PATCH /api/event/:id/publish` | Publicar evento |

---

### GalleryService

Gestión de fotos de galería.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getByEventIdAdmin(eventId)` | `GET /api/event-photos/gallery/admin/:id` | Fotos (admin) |
| `uploadImages(eventId, files)` | `POST /api/event-photos/upload/:id` | Subir fotos |
| `deleteImage(imageId)` | `DELETE /api/event-photos/:id` | Eliminar foto |
| `deleteAllByEventId(eventId)` | `DELETE /api/event-photos/event/:id` | Eliminar todas |
| `updateGalleryStatus(eventId, isPublished)` | `PATCH /api/event/:id/gallery-status` | Estado galería |

---

### TicketTypeService

Gestión de tipos de tickets.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getTicketTypes(eventId)` | `GET /api/event/:id/ticketType` | Obtener tipos |
| `createTicketType(eventId, data)` | `POST /api/event/:id/ticketType` | Crear tipo |
| `updateTicketType(eventId, ticketTypeId, data)` | `PATCH /api/event/:id/ticketType/:ticketTypeId` | Actualizar |
| `deleteTicketType(eventId, ticketTypeId)` | `DELETE /api/event/:id/ticketType/:ticketTypeId` | Eliminar |

---

### LocationService

Obtener ubicaciones disponibles.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getAll()` | `GET /api/location` | Todas las ubicaciones |
| `getById(id)` | `GET /api/location/:id` | Ubicación por ID |

---

### DjService

Obtener DJs disponibles.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getAll()` | `GET /api/dj` | Todos los DJs |
| `getById(id)` | `GET /api/dj/:id` | DJ por ID |

---

## Componentes

### Públicos

| Componente | Selector | Descripción |
|------------|----------|-------------|
| `NavbarComponent` | `app-navbar` | Barra de navegación principal |
| `HeroComponent` | `app-hero` | Sección hero de la landing |
| `HomeComponent` | `app-home` | Página principal |
| `EventCardComponent` | `app-event-card` | Tarjeta de evento |
| `GaleriaComponent` | `app-galeria` | Galería pública de fotos |
| `AuthModalComponent` | `app-auth-modal` | Modal login/registro |

### Administración

| Componente | Selector | Descripción |
|------------|----------|-------------|
| `AdminNavbarComponent` | `app-admin-navbar` | Navbar del admin |
| `EventManagementComponent` | `app-event-management` | Dashboard admin |
| `EventListComponent` | `app-event-list` | Listado de eventos |
| `EventFormComponent` | `app-event-form` | Formulario crear/editar evento |
| `TicketConfigComponent` | `app-ticket-config` | Configurar tickets |
| `GalleryManagerComponent` | `app-gallery-manager` | Gestionar galería |

---

## Guards e Interceptors

### AuthInterceptor

Interceptor funcional que agrega el token JWT a todas las peticiones HTTP.

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(clonedReq);
    }
    return next(req);
};
```

### AdminGuard

Guard funcional que protege las rutas de administración.

```typescript
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isAdmin()) {
        return true;
    }

    router.navigate(['/']);
    return false;
};
```

**Condiciones de acceso:**
1. Usuario debe estar autenticado (`isAuthenticated`)
2. Usuario debe ser admin (`isAdmin`)

Si no cumple, redirige a `/`

---

## Panel de Administración

### Flujo de Navegación

```
/admin (Dashboard)
    │
    ├── Crear Evento ──→ /admin/eventos/crear
    │                         │
    │                         ▼
    │                    EventFormComponent
    │                         │
    │                    (Guardar)
    │                         │
    │                         ▼
    │                    Redirige a
    │                    /admin/eventos/:id/tickets
    │
    ├── Editar Evento ──→ /admin/eventos/:id/editar
    │
    ├── Config Tickets ──→ /admin/eventos/:id/tickets
    │
    └── Galería ──→ /admin/eventos/:id/galeria
```

### EventListComponent

Lista todos los eventos con funcionalidades:

**Filtros:**
- Búsqueda por nombre
- Ciudad
- Ubicación
- Mes (en filtros adicionales)
- Año (en filtros adicionales)

**Ordenamiento:**
- Por fecha (asc/desc)
- Por nombre (asc/desc)

**Acciones por evento:**

| Acción | Método | Destino |
|--------|--------|---------|
| Ver estadísticas | `viewStats(event)` | `console.log` (TODO) |
| Ver galería | `viewGallery(event)` | `/admin/eventos/:id/galeria` |
| Editar | `editEvent(event)` | `/admin/eventos/:id/editar` |
| Eliminar | `deleteEvent(event)` | `DELETE /api/event/:id` |

**Vista responsive:**
- Desktop: Tabla con columnas
- Mobile: Cards individuales

### EventFormComponent

Formulario para crear/editar eventos.

**Campos:**
- Nombre del evento
- Descripción
- Fecha inicio/fin
- Edad mínima
- Ubicación (select)
- DJ (select)
- Foto de portada (upload)
- Estado publicado

### TicketConfigComponent

Configuración de tipos de tickets para un evento.

**Operaciones:**
- Crear tipo de ticket
- Editar tipo existente
- Eliminar tipo
- Configurar precios, cantidades, fechas de venta

### GalleryManagerComponent

Gestión de fotos del evento.

**Funcionalidades:**
- Subir múltiples fotos
- Preview de fotos subidas
- Eliminar fotos individuales
- Eliminar todas las fotos
- Publicar/despublicar galería

---

## Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `primary` | `#CCFF00` | Acentos, botones principales |
| `secondary` | `#00E0FF` | Acentos secundarios |
| `surface-light` | `#121212` | Fondos de cards |
| `surface-lighter` | `#1E1E1E` | Fondos elevados |

---

## Scripts de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
ng serve

# Build de producción
ng build --configuration=production

# Ejecutar tests
ng test
```

---

## Notas Adicionales

### Manejo de Estado

La aplicación utiliza **Angular Signals** para el manejo de estado reactivo:

```typescript
// Estado privado (mutable)
private _currentUser = signal<User | null>(null);

// Estado público (readonly)
public readonly currentUser = this._currentUser.asReadonly();

// Estado computado
public readonly isAuthenticated = computed(() => this._currentUser() !== null);
```

### Lazy Loading

Las rutas de administración se cargan de forma lazy:

```typescript
{
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
}
```

Cada componente del admin también usa lazy loading:

```typescript
loadComponent: () => import('./components/event-form/event-form.component')
    .then(m => m.EventFormComponent)
```

### Respuesta API Estándar

Todas las respuestas del backend siguen este formato:

```typescript
interface ApiResponse<T> {
    success?: boolean;
    message?: string;
    data: T;
}
```

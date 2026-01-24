# 📚 Documentación Completa de la API - Bohemia Backend

## 🌟 Información General

**Base URL:** `http://localhost:3000/api`
**Versión:** 2.2
**Autenticación:** JWT Bearer Token
**Última actualización:** Enero 2026

### 🔐 Tipos de Permisos
- **🔓 Público:** No requiere autenticación
- **🔒 Autenticado:** Requiere token JWT válido
- **👑 Admin:** Requiere token JWT válido + permisos de administrador
- **👤 Propietario:** Solo el propietario del recurso o admin

### 📦 Estructura de Respuesta Estándar

Todas las respuestas de la API siguen esta estructura:

```json
{
  "message": "Descripción de la operación",
  "data": { } // objeto o array con los datos
}
```

**Ejemplos de respuestas:**

```json
// GET /api/event (lista)
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "eventName": "Fiesta Bohemia",
      "beginDatetime": "2026-02-14T20:00:00.000Z",
      ...
    }
  ]
}

// GET /api/event/:id (único)
{
  "message": "Item found",
  "data": {
    "id": 1,
    "eventName": "Fiesta Bohemia",
    ...
  }
}

// POST (crear)
{
  "message": "Item created",
  "data": { ... }
}

// PATCH (actualizar)
{
  "message": "Item updated",
  "data": { ... }
}

// DELETE (eliminar)
{
  "message": "Item deleted"
}
```

### 🚀 Cambios Principales v2.2
- **📸 Renombrado `/api/event-images` → `/api/event-photos`**
- **🎨 Nuevo estado de galería (`galleryStatus: PUBLISHED | ARCHIVED`)**
- **🔓 Endpoints públicos para galerías: `/galleries` y `/gallery/:eventId`**
- **📐 Validación de dimensiones para cover photo: 1000x800 px exactos**
- **📦 Upload de hasta 50 fotos por subida**

---

## 🔐 Autenticación

### Registrar Usuario
**POST** `/user/register`
- **Permisos:** 🔓 Público
- **Propósito:** Crear una nueva cuenta de usuario
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "userName": "string",
  "userSurname": "string",
  "email": "string",
  "password": "string (mín 8 caracteres, mayúscula, minúscula y número)",
  "birthDate": "YYYY-MM-DD HH:MM:SS"
}
```

**Response:**
```json
{
  "message": "User created",
  "data": {
    "id": 1,
    "userName": "Juan",
    "userSurname": "Pérez",
    "email": "juan@email.com",
    "birthDate": "1990-05-15 00:00:00",
    "isAdmin": false
  }
}
```

### Login
**POST** `/user/login`
- **Permisos:** 🔓 Público
- **Propósito:** Autenticar usuario y obtener token JWT
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "juan@email.com",
    "isAdmin": false
  }
}
```
- **Headers de Respuesta:** `token: Bearer <jwt_token>`

---

## 👤 Gestión del Usuario Actual (Endpoints /me)

### Obtener Mi Información
**GET** `/user/me`
- **Permisos:** 🔒 Autenticado
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Item found",
  "data": {
    "id": 1,
    "userName": "Juan",
    "userSurname": "Pérez",
    "email": "juan@email.com",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "isAdmin": false
  }
}
```

### Obtener Mis Compras
**GET** `/user/me/purchases`
- **Permisos:** 🔒 Autenticado

**Response:**
```json
{
  "message": "Purchases found",
  "data": [
    {
      "id": 1,
      "purchaseDate": "2026-01-15T10:30:00.000Z",
      "ticketQuantity": 2,
      "totalPrice": 5000
    }
  ]
}
```

### Ver Tickets de una Compra Mía
**GET** `/user/me/purchases/:id/tickets`
- **Permisos:** 🔒 Autenticado
- **Parámetros:** `id` (ID de compra)

### Actualizar Mi Información
**PATCH** `/user/me`
- **Permisos:** 🔒 Autenticado
- **Content-Type:** `application/json`

### Eliminar Mi Cuenta
**DELETE** `/user/me`
- **Permisos:** 🔒 Autenticado

---

## 👥 Gestión de Usuarios (Solo Admin)

### Listar Todos los Usuarios
**GET** `/user`
- **Permisos:** 🔒 Autenticado + 👑 Admin

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "userName": "Juan",
      "userSurname": "Pérez",
      "email": "juan@email.com",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "isAdmin": false
    }
  ]
}
```

### Crear Usuario Manualmente
**POST** `/user`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

### Obtener Usuario por ID
**GET** `/user/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Actualizar Usuario por ID
**PATCH** `/user/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)
- **Content-Type:** `application/json`

### Eliminar Usuario por ID
**DELETE** `/user/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

---

## 🎉 Gestión de Eventos

### Listar Eventos Futuros
**GET** `/event/future`
- **Permisos:** 🔓 Público
- **Propósito:** Obtener solo eventos que no han terminado (futuros y en curso)

**Response:**
```json
{
  "message": "Eventos futuros obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "eventName": "Fiesta Bohemia",
      "beginDatetime": "2026-02-14T20:00:00.000Z",
      "finishDatetime": "2026-02-15T04:00:00.000Z",
      "eventDescription": "La mejor fiesta del año",
      "minAge": 18,
      "coverPhoto": "http://localhost:3000/public/uploads/1234_foto.jpg",
      "ticketsOnSale": 100,
      "location": { "id": 1, "locationName": "Club Bohemia", ... },
      "dj": { "id": 1, "djName": "DJ", "djApodo": "Beats", ... }
    }
  ],
  "count": 1,
  "note": "Incluye eventos en curso y futuros (hasta que terminen)"
}
```

### Obtener Evento por ID
**GET** `/event/:id`
- **Permisos:** 🔓 Público
- **Parámetros:** `id` (número)

**Response:**
```json
{
  "message": "Item found",
  "data": {
    "id": 1,
    "eventName": "Fiesta Bohemia",
    "beginDatetime": "2026-02-14T20:00:00.000Z",
    "finishDatetime": "2026-02-15T04:00:00.000Z",
    "eventDescription": "La mejor fiesta del año",
    "minAge": 18,
    "coverPhoto": "http://localhost:3000/public/uploads/1234_foto.jpg",
    "ticketsOnSale": 100,
    "location": { ... },
    "dj": { ... }
  }
}
```

### Listar Todos los Eventos
**GET** `/event`
- **Permisos:** 🔒 Autenticado + 👑 Admin

### Crear Evento
**POST** `/event`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `multipart/form-data`
- **Archivo:** `cover_photo` (imagen jpg/jpeg/png, máx 5MB) - **REQUERIDO**

**Request Body (form-data):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `eventName` | string | Nombre del evento (máx 100 caracteres) |
| `beginDatetime` | string | Fecha inicio `YYYY-MM-DD HH:MM:SS` (debe ser futura) |
| `finishDatetime` | string | Fecha fin `YYYY-MM-DD HH:MM:SS` (debe ser posterior a beginDatetime) |
| `eventDescription` | string | Descripción del evento (máx 100 caracteres) |
| `minAge` | number | Edad mínima requerida |
| `location` | number | ID de la ubicación |
| `dj` | number | ID del DJ |
| `coverPhoto` | file | Imagen de portada (jpg/jpeg/png) - **Debe ser exactamente 1000x800 px** |

**Response:**
```json
{
  "message": "Evento creado exitosamente",
  "data": {
    "id": 1,
    "eventName": "Fiesta Bohemia",
    "beginDatetime": "2026-02-14T20:00:00.000Z",
    "finishDatetime": "2026-02-15T04:00:00.000Z",
    "eventDescription": "La mejor fiesta del año",
    "minAge": 18,
    "coverPhoto": "http://localhost:3000/public/uploads/1705312345_foto.jpg",
    "ticketsOnSale": 0,
    "location": 1,
    "dj": 1
  }
}
```

### Actualizar Evento
**PATCH** `/event/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `multipart/form-data`
- **Archivo:** `cover_photo` (opcional - nueva imagen de portada)
- **Parámetros:** `id` (número)

### Eliminar Evento
**DELETE** `/event/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Actualizar Estado de Galería
**PATCH** `/event/:id/gallery-status`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)
- **Propósito:** Cambiar el estado de la galería entre PUBLISHED y ARCHIVED

**Request Body:**
```json
{
  "galleryStatus": "PUBLISHED" // o "ARCHIVED"
}
```

**Response:**
```json
{
  "message": "Gallery status updated",
  "data": {
    "id": 1,
    "galleryStatus": "PUBLISHED"
  }
}
```

> **Nota:** Por defecto, los eventos nuevos tienen `galleryStatus: ARCHIVED`. Solo las galerías con estado `PUBLISHED` son visibles para usuarios públicos.

---

## 🎫 Gestión de Tipos de Entrada

### Listar Tipos de Entrada de un Evento
**GET** `/event/:eventId/ticketType`
- **Permisos:** 🔓 Público
- **Parámetros:** `eventId` (ID del evento)

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "ticketTypeName": "General",
      "beginDatetime": "2026-01-01T00:00:00.000Z",
      "finishDatetime": "2026-02-14T18:00:00.000Z",
      "price": 2500,
      "maxQuantity": 100,
      "availableTickets": 85,
      "event": 1
    },
    {
      "id": 2,
      "ticketTypeName": "VIP",
      "beginDatetime": "2026-01-01T00:00:00.000Z",
      "finishDatetime": "2026-02-14T18:00:00.000Z",
      "price": 5000,
      "maxQuantity": 20,
      "availableTickets": 15,
      "event": 1
    }
  ]
}
```

### Obtener Tipo de Entrada por ID
**GET** `/event/:eventId/ticketType/:id`
- **Permisos:** 🔓 Público
- **Parámetros:** `eventId`, `id`

### Crear Tipo de Entrada
**POST** `/event/:eventId/ticketType`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "ticketTypeName": "string (máx 100 caracteres)",
  "beginDatetime": "YYYY-MM-DD HH:MM:SS",
  "finishDatetime": "YYYY-MM-DD HH:MM:SS",
  "price": "number (entero positivo)",
  "maxQuantity": "number (entero positivo)",
  "event": "number (ID del evento)"
}
```

**Response:**
```json
{
  "message": "Item created",
  "data": {
    "id": 1,
    "ticketTypeName": "General",
    "beginDatetime": "2026-01-01T00:00:00.000Z",
    "finishDatetime": "2026-02-14T18:00:00.000Z",
    "price": 2500,
    "maxQuantity": 100,
    "availableTickets": 100,
    "event": 1
  }
}
```

### Actualizar Tipo de Entrada
**PATCH** `/event/:eventId/ticketType/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `eventId`, `id`

### Eliminar Tipo de Entrada
**DELETE** `/event/:eventId/ticketType/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `eventId`, `id`

---

## 🛒 Gestión de Compras

### Realizar Compra
**POST** `/purchase`
- **Permisos:** 🔒 Autenticado
- **Content-Type:** `application/json`
- **⚠️ Estado:** Validación de esquema deshabilitada temporalmente

**Request Body:**
```json
{
  "ticketTypeId": "number",
  "ticketQuantity": "number",
  "userId": "number"
}
```

**Response:**
```json
{
  "message": "Purchase created successfully",
  "data": {
    "purchaseId": 1,
    "ticketNumbers": 2,
    "totalPrice": 5500,
    "paymentStatus": "approved"
  }
}
```

> **Nota:** La compra genera los tickets inmediatamente con estado `approved`.

### Descargar PDF de Ticket
**GET** `/purchase/:purchaseId/ticket/:ticketId`
- **Permisos:** 🔒 Autenticado + 👤 Propietario
- **Parámetros:** `purchaseId`, `ticketId`
- **Respuesta:** Archivo PDF
- **Headers de Respuesta:** 
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename=ticket.pdf`

---

## 🛒 Gestión de Compras (Solo Admin)

### Listar Todas las Compras
**GET** `/purchase`
- **Permisos:** 🔒 Autenticado + 👑 Admin

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "purchaseDate": "2026-01-15T10:30:00.000Z",
      "ticketQuantity": 2,
      "totalPrice": 5000,
      "ticketType": { ... },
      "user": { ... }
    }
  ]
}
```

### Obtener Compra por ID
**GET** `/purchase/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (ID de compra)

### Actualizar Compra
**PATCH** `/purchase/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Eliminar Compra
**DELETE** `/purchase/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

---

## 🎫 Gestión de Tickets (Solo Admin)

### Listar Todos los Tickets
**GET** `/ticket`
- **Permisos:** 🔒 Autenticado + 👑 Admin

### Obtener Ticket por ID
**GET** `/ticket/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Crear Ticket Manualmente
**POST** `/ticket`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

### Actualizar Ticket
**PATCH** `/ticket/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Eliminar Ticket
**DELETE** `/ticket/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

**📝 Nota:** Los usuarios regulares acceden a sus tickets a través de `/user/me/purchases/:id/tickets`

---

## 🏢 Gestión de Ubicaciones

### Listar Ubicaciones
**GET** `/location`
- **Permisos:** 🔓 Público

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "locationName": "Club Bohemia",
      "address": "Av. Corrientes 1234",
      "maxCapacity": 500,
      "city": {
        "id": 1,
        "cityName": "Buenos Aires",
        "province": "Buenos Aires",
        "zipCode": 1000
      }
    }
  ]
}
```

### Obtener Ubicación por ID
**GET** `/location/:id`
- **Permisos:** 🔓 Público
- **Parámetros:** `id` (número)

### Crear Ubicación
**POST** `/location`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "locationName": "string (máx 100 caracteres)",
  "address": "string (máx 100 caracteres, único)",
  "maxCapacity": "number (entero positivo)",
  "city": "number (ID de ciudad)"
}
```

**Response:**
```json
{
  "message": "Item created",
  "data": {
    "id": 1,
    "locationName": "Club Bohemia",
    "address": "Av. Corrientes 1234",
    "maxCapacity": 500,
    "city": 1
  }
}
```

### Actualizar Ubicación
**PATCH** `/location/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Eliminar Ubicación
**DELETE** `/location/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

---

## 🏙️ Gestión de Ciudades

### Listar Ciudades
**GET** `/city`
- **Permisos:** 🔓 Público

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "cityName": "Buenos Aires",
      "province": "Buenos Aires",
      "zipCode": 1000
    },
    {
      "id": 2,
      "cityName": "Córdoba",
      "province": "Córdoba",
      "zipCode": 5000
    }
  ]
}
```

### Obtener Ciudad por ID
**GET** `/city/:id`
- **Permisos:** 🔓 Público
- **Parámetros:** `id` (número)

### Crear Ciudad
**POST** `/city`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "cityName": "string (máx 100 caracteres, único)",
  "province": "string (máx 100 caracteres)",
  "zipCode": "number (entero positivo)"
}
```

**Response:**
```json
{
  "message": "Item created",
  "data": {
    "id": 1,
    "cityName": "Buenos Aires",
    "province": "Buenos Aires",
    "zipCode": 1000
  }
}
```

### Actualizar Ciudad
**PATCH** `/city/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Eliminar Ciudad
**DELETE** `/city/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

---

## 🎧 Gestión de DJs

### Listar DJs
**GET** `/dj`
- **Permisos:** 🔓 Público

**Response:**
```json
{
  "message": "Find all items",
  "data": [
    {
      "id": 1,
      "djName": "Carlos",
      "djSurname": "González",
      "djApodo": "DJ Beats"
    }
  ]
}
```

### Obtener DJ por ID
**GET** `/dj/:id`
- **Permisos:** 🔓 Público
- **Parámetros:** `id` (número)

### Crear DJ
**POST** `/dj`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "djName": "string (máx 100 caracteres)",
  "djSurname": "string (máx 100 caracteres)",
  "djApodo": "string"
}
```

**Response:**
```json
{
  "message": "Item created",
  "data": {
    "id": 1,
    "djName": "Carlos",
    "djSurname": "González",
    "djApodo": "DJ Beats"
  }
}
```

### Actualizar DJ
**PATCH** `/dj/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

### Eliminar DJ
**DELETE** `/dj/:id`
- **Permisos:** 🔒 Autenticado + 👑 Admin
- **Parámetros:** `id` (número)

---

## 📸 Event Photos (Fotos de Eventos)
**Base URL:** `/api/event-photos`

### Listar Eventos con Galerías Publicadas
**GET** `/event-photos/galleries`
- **Permisos:** 🔓 Público
- **Propósito:** Obtener lista de eventos que tienen galerías publicadas

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "eventName": "Fiesta Bohemia",
      "beginDatetime": "2026-02-14T20:00:00.000Z",
      "finishDatetime": "2026-02-15T04:00:00.000Z",
      "coverPhoto": "http://localhost:3000/public/uploads/foto.jpg",
      "location": { "locationName": "Club Bohemia", "address": "..." },
      "dj": { "djApodo": "DJ Beats" }
    }
  ]
}
```

### Obtener Fotos de un Evento (Autenticado)
**GET** `/event-photos/gallery/:eventId`
- **Permisos:** 🔓 Autenticado (solo galerías PUBLISHED)
- **Parámetros:** `eventId` (number)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "publicId": "events/evento-name/photos-123456789",
      "originalName": "foto1.jpg",
      "event": 1
    }
  ]
}
```

### Subir Fotos a Evento
**POST** `/event-photos/upload/:eventId`
- **Permisos:** 👑 Admin
- **Content-Type:** `multipart/form-data`
- **Body:** `photos` (files[]) - Hasta 50 fotos (máx. 15MB cada una)
- **Tipos permitidos:** jpg, jpeg, png, webp
- **Almacenamiento:** Cloudinary en carpeta `events/{eventName}/`

**Response:**
```json
{
  "success": true,
  "message": "5 fotos subidas exitosamente",
  "data": [...]
}
```

### Listar Todas las Fotos
**GET** `/event-photos/`
- **Permisos:** 👑 Admin

### Actualizar Foto
**PUT** `/event-photos/:id`
- **Permisos:** 👑 Admin

### Eliminar Foto Específica
**DELETE** `/event-photos/:id`
- **Permisos:** 👑 Admin

### Eliminar Todas las Fotos de un Evento
**DELETE** `/event-photos/event/:eventId`
- **Permisos:** 👑 Admin

**Response:**
```json
{
  "success": true,
  "message": "15 fotos eliminadas exitosamente"
}
```

---

## 🔄 Flujos de Usuario Típicos

### 📱 Usuario Regular

1. **Registro/Login**
   ```
   POST /user/register → POST /user/login
   ```

2. **Ver eventos y comprar**
   ```
   GET /event/future → GET /event/:eventId/ticketType → POST /purchase
   ```

3. **Gestionar mi cuenta**
   ```
   GET /user/me → PATCH /user/me
   ```

4. **Ver mis compras**
   ```
   GET /user/me/purchases → GET /user/me/purchases/:id/tickets
   ```

5. **Descargar ticket**
   ```
   GET /purchase/:purchaseId/ticket/:ticketId
   ```

### 👑 Administrador

1. **Gestión de contenido**
   ```
   POST /city → POST /location → POST /dj → POST /event → POST /event/:eventId/ticketType
   ```

2. **Gestión de usuarios**
   ```
   GET /user → GET /user/:id → PATCH /user/:id
   ```

3. **Gestión de compras**
   ```
   GET /purchase → GET /purchase/:id
   ```

---

## 🚨 Manejo de Errores

### Estructura de Respuesta de Error

Todas las respuestas de error siguen esta estructura:

```json
{
  "message": "Descripción del error",
  "statusCode": 400,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

### Códigos de Estado HTTP

| Código | Tipo | Descripción |
|--------|------|-------------|
| **400** | Bad Request | Datos de entrada inválidos o malformados |
| **401** | Unauthorized | Token JWT faltante, inválido o expirado |
| **403** | Forbidden | Sin permisos suficientes (ej: no es admin) |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto de datos (ej: email duplicado) |
| **500** | Internal Server Error | Error interno del servidor |

---

### Ejemplos de Errores por Tipo

#### 🔴 Error de Validación (Zod) - 400
Cuando los datos enviados no cumplen con el schema de validación:

```json
{
  "message": "Validation error",
  "statusCode": 400,
  "details": [
    {
      "field": "body.eventName",
      "message": "El nombre del evento no puede exceder 100 caracteres"
    },
    {
      "field": "body.beginDatetime",
      "message": "La fecha y hora de comienzo debe ser futura"
    }
  ],
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

#### 🔴 Error de Autenticación - 401
Cuando no se proporciona token o es inválido:

```json
{
  "message": "Required token",
  "statusCode": 401,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

```json
{
  "message": "Unauthorized",
  "statusCode": 401,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

#### 🔴 Error de Permisos - 403
Cuando el usuario no tiene permisos de admin:

```json
{
  "message": "Access denied: Admin only",
  "statusCode": 403,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

#### 🔴 Error de Recurso No Encontrado - 404
Cuando se busca un recurso que no existe:

```json
{
  "message": "Event with id 999 not found",
  "statusCode": 404,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event/999",
  "method": "GET"
}
```

#### 🔴 Error de Conflicto - 409
Cuando hay datos duplicados (ej: email ya registrado):

```json
{
  "message": "Duplicate entry found",
  "statusCode": 409,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/user/register",
  "method": "POST"
}
```

#### 🔴 Error de Archivo - 400
Cuando hay problemas con la subida de archivos:

```json
{
  "message": "Please upload a file, jpg, jpeg or png",
  "statusCode": 400,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

```json
{
  "message": "Max file size 5MB",
  "statusCode": 400,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

#### 🔴 Error de Base de Datos - 400/409
Cuando hay errores relacionados con la base de datos:

```json
{
  "message": "Referenced record does not exist",
  "statusCode": 400,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

```json
{
  "message": "Cannot delete: record is referenced by other records",
  "statusCode": 409,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/location/1",
  "method": "DELETE"
}
```

#### 🔴 Error Interno del Servidor - 500
Cuando ocurre un error inesperado:

```json
{
  "message": "An error occurred",
  "statusCode": 500,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "path": "/api/event",
  "method": "POST"
}
```

---

### Tipos de Errores Específicos

| Clase de Error | Código | Uso |
|----------------|--------|-----|
| `ValidationError` | 400 | Datos de entrada inválidos |
| `BadRequestError` | 400 | Solicitud mal formada |
| `UnauthorizedError` | 401 | Sin autenticación |
| `ForbiddenError` | 403 | Sin permisos |
| `NotFoundError` | 404 | Recurso no existe |
| `ConflictError` | 409 | Datos duplicados |
| `InternalServerError` | 500 | Error del servidor |

---

## 📋 Notas de Seguridad

### ✅ Implementado
- **JWT Authentication** en todas las rutas protegidas
- **Verificación de propiedad** en recursos de usuario
- **Separación admin/usuario** en endpoints
- **Validación de esquemas** con Zod
- **Verificación de propietario** para descargas de PDF

### 🔐 Headers Requeridos

**Para rutas autenticadas (JSON):**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Para rutas con archivos:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

---

## 🔧 Información Técnica

### Autenticación JWT
- **Header:** `Authorization: Bearer <token>`
- **Expiración:** 1 hora
- **Payload:** `{id, email, isAdmin}`

### Subida de Archivos (Eventos)
- **Campo:** `cover_photo`
- **Formato:** `multipart/form-data`
- **Almacenamiento:** `/public/uploads/`
- **Tipos permitidos:** jpg, jpeg, png
- **Tamaño máximo:** 5MB

### Generación de PDFs
- **Biblioteca:** PDFKit + QRCode
- **Incluye:** QR único, datos del evento, ticket info
- **Seguridad:** Solo propietario o admin

---

## 📝 Endpoints sin validación temporal
- `POST /purchase` (schema comentado)
- `GET /purchase/:purchaseId/ticket/:ticketId` (schema comentado)

---

## 🚧 Funcionalidades Pendientes

### Mejoras Sugeridas
- Implementar rate limiting
- Agregar logs de auditoría
- Notificaciones por email automáticas
- Sistema de roles más granular

---

**🎯 Documentación actualizada - API v2.2**
**📅 Última actualización: Enero 2026**

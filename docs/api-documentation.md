# Documentación de la API (Bohemia Frontend)

Esta documentación detalla los endpoints consumidos por el frontend de Bohemia, extraídos a partir de los servicios de Angular (`src/app/services` y `src/app/admin/services`).

Todas las peticiones a rutas protegidas deben incluir el token de autenticación en la cabecera:
```http
Authorization: Bearer <TOKEN>
```

---

## 1. Autenticación y Usuario

### Iniciar Sesión (Login)
Inicia sesión y obtiene el token del usuario y sus datos.

* **Endpoint:** `POST /user/login`
* **Request Body (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "miPassword123"
    }
    ```
* **Success Response (200 OK):**
    El token se recibe a través del header de la respuesta: `token`.
    ```json
    {
      "data": {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isAdmin": false
      }
    }
    ```

### Registrarse (Register)
Crea una nueva cuenta de usuario.

* **Endpoint:** `POST /user/register`
* **Request Body (JSON):** Contiene los datos requeridos para el registro (`RegisterData`).
* **Success Response (201 Created):** Retorna los datos del usuario creado y el token en los headers.

### Cargar Usuario Actual (Me)
Obtiene la información del usuario actualmente autenticado usando su token.

* **Endpoint:** `GET /user/me`
* **Autenticación:** Requerida
* **Success Response (200 OK):** Retorna el objeto `User`.

### Actualizar Perfil
Permite actualizar partes del perfil del usuario logueado.

* **Endpoint:** `PATCH /user/me`
* **Autenticación:** Requerida
* **Request Body (JSON):** Fragmento con datos a actualizar, e.g. `{"firstName": "Nuevo nombre"}`
* **Success Response (200 OK):** Retorna el `User` actualizado.

### Obtener Compras del Usuario
Obtiene el historial de compras realizadas por el usuario actual.

* **Endpoint:** `GET /user/me/purchases`
* **Autenticación:** Requerida
* **Success Response (200 OK):**
    ```json
    {
      "message": "success",
      "data": [ ...lista de compras ]
    }
    ```

---

## 2. Eventos (Usuario Final)

### Listar Eventos Futuros
* **Endpoint:** `GET /event/future`
* **Descripción:** Obtiene una lista de los eventos publicados que aún no han pasado.

### Obtener Evento por ID
* **Endpoint:** `GET /event/{id}`
* **Descripción:** Obtiene un evento específico junto a toda su información pública.

### Obtener Tipos de Entrada Públicos
* **Endpoint:** `GET /event/{eventId}/ticketTypes`
* **Descripción:** Lista los tipos de entradas (TicketTypes) disponibles para el evento especificado.

---

## 3. Proceso de Compra

### Crear Compra
Inicia el proceso de compra de entradas en el backend local.

* **Endpoint:** `POST /purchase`
* **Autenticación:** Requerida
* **Request Body:** Datos de los tickets, cantidades, información de asistentes (`CreatePurchaseDTO`).

### Obtener Compra por ID
* **Endpoint:** `GET /purchase/{id}`
* **Autenticación:** Requerida

### Crear Preferencia de MercadoPago
* **Endpoint:** `POST /purchase/create_preference`
* **Autenticación:** Requerida
* **Request Body:** `{"id": purchaseId}`
* **Success Response (200 OK):** `{"init_point": "URL_DE_PAGO_MP"}`

### Verificar Pago
* **Endpoint:** `GET /purchase/verify/{paymentId}`
* **Descripción:** Llama al backend para validar y asentar el pago contra MercadoPago exitosamente a través del PaymentID referenciado.

### Descargar Ticket Válido (PDF)
* **Endpoint:** `GET /purchase/{purchaseId}/ticket/{ticketId}`
* **Response:** Un stream/Blob del archivo PDF correspondiente a la entrada adquirida.

---

## 4. Panel de Administración (Requiere Admin)

### Eventos (Admin)
* `GET /event/admin` - Lista todos los eventos, incluyendo los ocultos y borrados.
* `GET /event/admin/{id}` - Obtiene un evento ignorando si está publicado o no.
* `POST /event/crear` - Crea un evento. Maneja `FormData` debido al envío de imágenes/flyers.
* `PATCH /event/{id}` - Modifica un evento existente (usa `FormData`).
* `DELETE /event/{id}` - Elimina un evento.
* `PATCH /event/{id}/publish` - Publica un evento para ser visible al público (`isPublished: true`).
* `PATCH /event/{id}/gallery-status` - Actualiza si la galería del evento está visible o no.
* `GET /event/{eventId}/stats?limit={limit}` - Obtiene las estadísticas de ventas y asistencias para un evento (dashboard administrativo).

### Tipos de Entradas (Ticket Types / Admin)
* `GET /event/{eventId}/ticketType` - Información total de las entradas administradas de un evento.
* `POST /event/{eventId}/ticketType` - Agrega un nuevo tipo/tanda de entradas (e.g., Lote 1).
* `PATCH /event/{eventId}/ticketType/{ticketTypeId}` - Modifica las características de un tipo de ticket.
* `PATCH /event/{eventId}/ticketType/{ticketTypeId}/close` - Cierra anticipadamente el rango de ventas enviando el sobrante a la cola del próximo lote activo.
* `DELETE /event/{eventId}/ticketType/{ticketTypeId}` - Elimina el bloque/tipo de ticket.

### Recursos (Locaciones y DJs / Admin)
* `GET /location` - Retorna todas las locaciones y sus límites de capacidad predefinidos.
* `GET /location/{id}` - Regresa detalle de locación en específico.
* `GET /dj` - Devuelve la lista completa de DJ con data extendida de apodos, nombres, etc.
* `GET /dj/{id}` - Idem arriba, pero singular.

---

## Documentación General de Respuestas
El backend envuelve la mayoría de sus retornos en un formato estandarizado `ApiResponse<T>`:

```json
{
  "message": "Mensaje de éxito o detalle del error",
  "data": { ... } // La carga de información real será enrutada en este nodo.
}
```

## Manejo Típico de Errores (Error Responses)
- **400 Bad Request:** Validaciones fallidas o datos incompletos aportados en el body.
- **401 Unauthorized:** Intento de acceso a ruta protegida sin Bearer token, token inválido o vencido.
- **403 Forbidden:** Intento de usuario estándar de acceder a un endpoint con roles requeridos (e.g. rutas de Admin).
- **404 Not Found:** Entidad (evento, compra) inexistente o eliminada.
- **500 Internal Server Error:** Falla inesperada del servidor, típicamente atrapada en los `catchError` observables de los servicios de Angular.

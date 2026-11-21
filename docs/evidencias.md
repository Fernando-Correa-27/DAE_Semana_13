# Evidencias de ejecución — GLAB-S12 «Servicios Web»

Fecha de las pruebas: 12 de noviembre de 2026.

## 1. Entorno comprobado

| Herramienta | Versión |
|---|---|
| Python | 3.15.2 |
| Django | 6.1.3 |
| Django REST Framework | 3.16 |
| django-cors-headers | 4.7 o superior |
| Node.js | 26.13.1 |
| npm | 11.20.0 |
| Vite | 8.3.5 |
| React | 19.3.1 |
| Axios | 1.21.1 |
| react-router-dom | 7.18.5 |
| Playwright | 1.64.1 |

## 2. Rutas reales de la API

| Recurso | Ruta | Autenticación | Paginación |
|---|---|---|---|
| Base | `GET /api/` | Token obligatorio | — |
| Exámenes | `/api/exams/` | Token obligatorio | `PAGE_SIZE = 5`, respuesta `{count, next, previous, results}` |
| Preguntas | `/api/questions/` | Token obligatorio | Igual |
| Opciones | `/api/options/` | Token obligatorio | Igual |
| Contrato | `/api/schema/` | Público | — |
| Documentación | `/api/docs/` | Público | — |

El recurso `Exam` tiene `id`, `title`, `created_at` y `question_count`. Solo `title` es obligatorio y editable; `id`, `created_at` y `question_count` son de solo lectura.

## 3. Prueba de CORS con curl

El token se obtuvo con `python manage.py seed_quiz --show-tokens` y se usó en la variable `$TOKEN`. No se documenta su valor.

### 3.1 API base sin token

```powershell
curl.exe -s -o NUL -w "GET /api/ -> %{http_code}`n" http://127.0.0.1:8000/api/
```

Resultado:

```text
GET /api/ -> 401
```

### 3.2 Listado con token

```powershell
curl.exe -s -o NUL -w "GET /api/exams/ -> %{http_code}`n" `
  -H "Authorization: Token $TOKEN" http://127.0.0.1:8000/api/exams/
```

Resultado:

```text
GET /api/exams/ -> 200
```

### 3.3 Origen autorizado

```powershell
curl.exe -s -D - -o NUL `
  -H "Origin: http://localhost:5173" `
  -H "Authorization: Token $TOKEN" `
  http://127.0.0.1:8000/api/exams/
```

Resultado relevante:

```http
HTTP/1.1 200 OK
access-control-allow-origin: http://localhost:5173
```

### 3.4 Origen no autorizado

```powershell
curl.exe -s -D - -o NUL `
  -H "Origin: http://evil.example" `
  -H "Authorization: Token $TOKEN" `
  http://127.0.0.1:8000/api/exams/
```

Resultado relevante:

```http
HTTP/1.1 200 OK
```

No aparece `access-control-allow-origin`, por lo que el navegador bloquea la lectura de la respuesta.

### 3.5 Preflight OPTIONS autorizado

```powershell
curl.exe -s -D - -o NUL -X OPTIONS `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: GET" `
  -H "Access-Control-Request-Headers: authorization,content-type" `
  http://127.0.0.1:8000/api/exams/
```

Resultado relevante:

```http
HTTP/1.1 200 OK
access-control-allow-origin: http://localhost:5173
access-control-allow-headers: accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with
access-control-allow-methods: DELETE, GET, OPTIONS, PATCH, POST, PUT
access-control-max-age: 86400
```

### 3.6 Preflight OPTIONS desde un origen no autorizado

```powershell
curl.exe -s -D - -o NUL -X OPTIONS `
  -H "Origin: http://evil.example" `
  -H "Access-Control-Request-Method: GET" `
  http://127.0.0.1:8000/api/exams/
```

Resultado relevante:

```http
HTTP/1.1 200 OK
```

Sin cabeceras `Access-Control-Allow-*`.

## 4. Error de CORS provocado en el navegador

Se reinició Django con un origen distinto:

```powershell
$env:CORS_ALLOWED_ORIGINS = "http://localhost:9999"
python manage.py runserver 127.0.0.1:8000 --noreload
```

Mensaje capturado por Playwright en la consola del navegador:

```text
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/exams/' from origin
'http://localhost:5173' has been blocked by CORS policy: Response to preflight
request doesn't pass access control check: No 'Access-Control-Allow-Origin'
header is present on the requested resource.
```

La interfaz mostró el estado de error de conexión, no una pantalla en blanco. Después se restauró el origen correcto y se comprobó de nuevo `200` con `Access-Control-Allow-Origin: http://localhost:5173`.

## 5. Error de validación provocado desde el formulario

Se envió el formulario de alta con el título vacío. La API respondió `400` y la interfaz mostró el mensaje por campo:

```text
Este campo no puede estar en blanco.
```

Captura: `docs/capturas/03-error-validacion.png`.

## 6. Servidor apagado con React abierto

Se detuvo el proceso que escuchaba en el puerto `8000` y se recargó `/exams`. La interfaz mostró:

```text
NO SE PUDO CONECTAR CON EL SERVIDOR
No se pudo conectar con el servidor
Comprueba que el backend de Django esté en marcha y que la API sea accesible.
Reintentar
```

Captura: `docs/capturas/06-error-sin-conexion.png`.

## 7. Pruebas automatizadas

### 7.1 Paginación real

Se crearon cuatro exámenes temporales (seis en total) y se abrió `/exams` con Playwright:

```text
first page rows: 5
next enabled: true
second page rows: 1
previous enabled: true
```

Después se eliminaron los cuatro exámenes temporales y la base volvió a los dos exámenes de ejemplo. Captura: `docs/capturas/08-paginacion.png`.

### Backend

```powershell
python manage.py test
```

Resultado:

```text
Ran 372 tests in 23.248s
OK
```

Incluye 7 pruebas nuevas de CORS en `quiz/tests/test_cors.py`.

### Frontend

```powershell
npm test
```

Resultado:

```text
Test Files  11 passed (11)
Tests       58 passed (58)
```

### Build

```powershell
npm run build
```

Resultado:

```text
vite v8.3.5 building client environment for production...
✓ 180 modules transformed.
✓ built in 580ms
```

### Lint

```powershell
npm run lint
```

Resultado: sin errores ni advertencias (código de salida `0`).

## 8. Capturas disponibles

| Archivo | Contenido |
|---|---|
| `docs/capturas/01-estado-carga.png` | Esqueleto de carga de la tabla |
| `docs/capturas/02-estado-datos.png` | Tabla con los exámenes de la API |
| `docs/capturas/03-error-validacion.png` | Error 400 del campo `title` |
| `docs/capturas/04-listado-con-nuevo-examen.png` | Alta exitosa visible sin recargar |
| `docs/capturas/05-listado-tras-eliminar.png` | Listado después del borrado |
| `docs/capturas/06-error-sin-conexion.png` | Error sin conexión con Django apagado |
| `docs/capturas/07-error-cors.png` | Error de CORS con origen no autorizado |
| `docs/capturas/08-paginacion.png` | Paginación con Anterior y Siguiente |

Pendiente de captura manual: estructura del proyecto en el editor (`docs/estructura.txt` contiene el árbol de referencia).

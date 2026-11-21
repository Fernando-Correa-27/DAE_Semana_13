# DAE S12 — Servicios Web

**Repositorio:** https://github.com/Fernando-Correa-27/DAE_Semana_12

Integración de la API REST de cuestionarios del **laboratorio 8** (Django + Django REST Framework) con la aplicación React de la **cartelera de cine** del laboratorio 11. El resultado es un único repositorio con dos lados: `backend/` y `frontend/`.

La sección nueva consume el recurso **exámenes** desde React con Axios: listar, crear y eliminar, con estados de carga, datos y error, validación por campo y paginación. La cartelera de cine se conserva; solo se amplió el menú de navegación.

## Estructura

```text
dae-s12-servicios-web/
├── backend/     API Django REST (copia del laboratorio 8)
├── frontend/    React + Vite (copia del laboratorio 11)
├── docs/        evidencias, capturas y árbol del proyecto
├── README.md
└── ENTREGABLE.md
```

El árbol detallado está en `docs/estructura.txt`.

## Requisitos

| Herramienta | Versión usada |
|---|---|
| Python | 3.15.2 |
| Node.js | 26.13.1 |
| npm | 11.20.0 |

Dependencias Python en `backend/requirements.txt`; dependencias Node en `frontend/package.json`.

## Backend: puesta en marcha

Desde la raíz del repositorio:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_quiz --show-tokens
```

> Si PowerShell bloquea la activación del entorno virtual, se puede usar directamente `.\.venv\Scripts\python.exe` en lugar de `python`.

`seed_quiz --show-tokens` crea los datos de ejemplo y muestra dos tokens:

- **Token de la persona** (`profe`): puede leer, crear, modificar y eliminar. Es el que debe usar el frontend.
- **Token del agente** (`agente`): puede leer, crear y modificar, pero no eliminar.

Los tokens son secretos locales: no se copian al repositorio.

### Variables de entorno del backend

| Variable | Valor por defecto | Uso |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Orígenes exactos autorizados, separados por comas. Nunca `*`. |
| `DJANGO_DEBUG` | `1` | `0` para desactivar el modo de desarrollo. |
| `DJANGO_SECRET_KEY` | — | Obligatoria si `DJANGO_DEBUG=0`. |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,testserver` | Hosts permitidos; obligatoria si `DJANGO_DEBUG=0`. |

Ejemplo en PowerShell:

```powershell
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
```

### Arrancar la API

```powershell
python manage.py runserver 127.0.0.1:8000
```

Direcciones reales:

| Recurso | Dirección |
|---|---|
| Base | `http://127.0.0.1:8000/api/` |
| Exámenes | `http://127.0.0.1:8000/api/exams/` |
| Preguntas | `http://127.0.0.1:8000/api/questions/` |
| Opciones | `http://127.0.0.1:8000/api/options/` |
| Contrato OpenAPI | `http://127.0.0.1:8000/api/schema/` |
| Documentación | `http://127.0.0.1:8000/api/docs/` |

Todas las rutas de recursos exigen `Authorization: Token <token>`. La paginación es de 5 elementos y devuelve `{count, next, previous, results}`.

## Frontend: puesta en marcha

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Editar `frontend/.env` y poner el token de la persona:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_TOKEN=el-token-que-imprime-seed_quiz
```

Arrancar Vite:

```powershell
npm run dev
```

La aplicación queda en **http://localhost:5173**:

| Ruta | Pantalla |
|---|---|
| `/` | Cartelera de cine del laboratorio 11 |
| `/exams` | Listado paginado de exámenes |
| `/exams/new` | Formulario de alta de examen |

### Variables de entorno del frontend

| Variable | Valor por defecto | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api` | Dirección base única de Axios. |
| `VITE_API_TOKEN` | — | Token de la API; se envía como `Authorization: Token ...`. |
| `VITE_APP_TITLE` | `Cartelera de Cine` | Título visible de la cabecera. |

> El token de Vite se incrusta en el paquete del navegador. Es aceptable para este laboratorio local, pero en producción no debe exponerse un token permanente: conviene usar un backend intermedio o tokens de corta duración.

## CORS: qué origen espera cada lado

- El navegador abre React en `http://localhost:5173`.
- Django autoriza **solo** los orígenes exactos de `CORS_ALLOWED_ORIGINS`; por defecto, `http://localhost:5173`.
- No se usa `CORS_ALLOW_ALL_ORIGINS` ni el comodín `*`.
- `CORS_ALLOW_CREDENTIALS = False` porque la autenticación viaja en la cabecera `Authorization`, no en cookies.
- Si Vite se abre como `http://127.0.0.1:5173`, hay que añadir ese origen exacto a la variable.

El middleware de CORS está justo después de `SecurityMiddleware` y antes de los demás. La configuración está en `backend/config/settings.py`.

## Comportamiento de la pantalla de exámenes

Al entrar en `/exams` se ejecuta un `GET` dentro de `useEffect` contra `/api/exams/` con el token configurado.

| Estado | Qué se muestra |
|---|---|
| Carga | Esqueleto de tabla con filas animadas y aviso accesible «Cargando exámenes…». |
| Datos | Tabla con ID, título, número de preguntas, fecha y acciones. Si hay más de una página, botones **Anterior** y **Siguiente** usando `previous` y `next`. |
| Error | Panel con título específico y botón **Reintentar**. Si no hubo respuesta: «No se pudo conectar con el servidor». Si hubo respuesta HTTP: código (`HTTP 400`, `HTTP 401`, etc.) y detalle devuelto por la API. |
| Vacío | Mensaje «No hay exámenes registrados» y enlace para crear el primero. |

El borrado pide confirmación, deshabilita solo la fila afectada mientras la petición está en curso y recarga la página actual de la lista sin recargar el navegador. El alta usa entradas controladas, `preventDefault`, `POST` con JSON y navegación al listado; el nuevo registro se busca en las páginas para que quede visible aunque no esté en la primera.

## Pruebas y evidencias

```powershell
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
npm run build
npm run lint
```

Resultados de la última ejecución:

- Backend: **372 pruebas OK** (incluye 7 de CORS en `quiz/tests/test_cors.py`).
- Frontend: **58 pruebas OK** en 11 archivos.
- `npm run build`: correcto.
- `npm run lint`: sin errores ni advertencias.

Las pruebas de CORS con `curl`, el error de CORS provocado, el error de validación, el servidor apagado y las capturas están documentados en `docs/evidencias.md` y `docs/capturas/`.

Para repetir las capturas con Playwright:

```powershell
cd frontend
npx playwright install chromium
node scripts/capture-s12-evidence.mjs
```

El script guarda las imágenes en `docs/capturas/` y usa `http://localhost:5173` como origen. Para el modo de error sin conexión, se ejecuta `node scripts/capture-s12-evidence.mjs error` con Django apagado; para el modo de CORS, `node scripts/capture-s12-evidence.mjs cors` con un origen no autorizado.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `401 Unauthorized` | Token ausente o incorrecto | Revisar `VITE_API_TOKEN` y reiniciar Vite. |
| Error de CORS en la consola | Origen no listado | Añadir el origen exacto a `CORS_ALLOWED_ORIGINS` y reiniciar Django. |
| «No se pudo conectar con el servidor» | Django apagado o dirección incorrecta | Arrancar `runserver` y revisar `VITE_API_BASE_URL`. |
| El formulario muestra «Este campo no puede estar en blanco» | La API respondió 400 | Es el comportamiento esperado con el título vacío. |
| El nuevo examen no aparece | Se está mirando otra página | La pantalla busca la página que contiene el registro creado. |

## Decisiones tomadas

- Se añadió `react-router-dom` porque el proyecto de React no tenía enrutado.
- Se extrajo `useTheme` para compartir el tema entre la cartelera y las páginas de exámenes sin duplicar lógica.
- La cabecera oculta el contador de favoritos fuera de la cartelera para no mostrar un dato engañoso.
- El token se entrega por variable de entorno de Vite y solo se versiona `.env.example`.
- Se añadieron pruebas de CORS en el backend y pruebas unitarias del formulario y del normalizador de errores en el frontend.

## Pendiente manual

- Captura de la estructura del proyecto en el editor. El árbol de referencia está en `docs/estructura.txt`.

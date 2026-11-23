# DAE Semana 13 — Catálogo de comercio electrónico

Aplicación de comercio electrónico del **Laboratorio 13**, construida sobre el proyecto de la semana 12. El repositorio reúne dos proyectos que se hablan por HTTP:

- **Servidor (`backend/`)**: API REST en Django + Django REST Framework. Añade la app `catalog` con categorías y productos, imágenes servidas desde `MEDIA_ROOT`, admin de Django y datos semilla reproducibles.
- **Cliente (`frontend/`)**: aplicación React + Vite. Consume la API mediante una capa de servicios con Axios y ofrece catálogo, filtro por categoría, alta, edición y borrado sin recargar la página.

La API de cuestionarios de la semana 12 se conserva y sigue funcionando con su autenticación por token. El catálogo es de solo lectura pública para el cliente (sin token), de modo que la práctica no depende de credenciales.

## Reparto de responsabilidades

| Lado | Responsabilidad | Puerto por defecto |
|---|---|---|
| Django (`backend/`) | Modelos, migraciones, admin, serializadores, vistas, filtro `?category=`, imágenes y datos semilla | `8000` |
| React (`frontend/`) | Rutas, componentes, estados de carga/error/vacío, formularios y llamadas HTTP | `5173` |

El cliente espera la API en `http://127.0.0.1:8000/api`. El servidor solo acepta peticiones del origen exacto del cliente, `http://localhost:5173` (sin comodín). Si Vite arranca en otro puerto, hay que declararlo en `CORS_ALLOWED_ORIGINS`.

## Estructura de carpetas

```text
DAE_Semana_13/
├── backend/
│   ├── catalog/
│   │   ├── management/commands/seed_catalog.py   # 3 categorías + 9 productos
│   │   ├── migrations/                           # migraciones versionadas
│   │   ├── seed_images/                          # imágenes originales generadas con Pillow
│   │   ├── tests/test_api.py                     # pruebas de la API del catálogo
│   │   ├── admin.py
│   │   ├── models.py                             # Category 1—N Product
│   │   ├── serializers.py                        # categoría anidada + category_id de escritura
│   │   ├── urls.py                               # DefaultRouter
│   │   └── views.py                              # ModelViewSet, filtro y select_related
│   ├── config/                                   # settings, urls, middleware CSP
│   ├── media/                                    # imágenes subidas (ignorado por git)
│   ├── quiz/                                     # app de la semana 12 (se conserva)
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── scripts/capture-s13-evidence.mjs          # capturas de evidencia con Playwright
│   ├── src/
│   │   ├── components/                           # CatalogLayout, ProductCard, ProductForm…
│   │   ├── hooks/                                # useProducts, useCategories, useProduct
│   │   ├── pages/                                # CatalogPage, ProductCreatePage, ProductEditPage
│   │   ├── services/                             # apiClient, productService, categoryService
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── entregable/
│   ├── capturas/                                 # evidencia numerada 01–14
│   ├── diagrama-catalogo.png
│   └── ENTREGABLE.md
└── README.md
```

## Requisitos

| Herramienta | Versión usada |
|---|---|
| Python | 3.15.2 |
| Django | 6.1.3 |
| Node.js | 26.13.1 |
| npm | 11.20.0 |

Las dependencias de Python están en `backend/requirements.txt` (incluye **Pillow** para `ImageField` y para generar las imágenes semilla). Las de Node están en `frontend/package.json`.

## Servidor: puesta en marcha

Desde la raíz del repositorio:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver 127.0.0.1:8000
```

Si PowerShell bloquea la activación del entorno virtual, se puede usar directamente `.\.venv\Scripts\python.exe` en lugar de `python`.

La API queda en `http://127.0.0.1:8000/api/` y el admin en `http://127.0.0.1:8000/admin/`. Para entrar al admin hace falta un superusuario:

```powershell
python manage.py createsuperuser
```

### Datos semilla

`seed_catalog` crea **3 categorías** (Tecnología, Hogar y Accesorios) y **9 productos** con precio, existencias e imagen. El comando es idempotente: si se ejecuta otra vez, actualiza los mismos registros en lugar de duplicarlos.

- Las imágenes se generan con **Pillow** en `backend/catalog/seed_images/` y se versionan en git.
- Al ejecutar el comando se copian a `backend/media/products/`, que es el `MEDIA_ROOT` local.
- En modo `DEBUG=1`, Django sirve `/media/` mediante `static()` en `config/urls.py`.

La API de cuestionarios de la semana 12 se puede sembrar aparte con `python manage.py seed_quiz --show-tokens` (opcional para este laboratorio).

### Variables de entorno del servidor

| Variable | Valor por defecto | Uso |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Orígenes exactos separados por comas. El comodín `*` está prohibido. |
| `DJANGO_DEBUG` | `1` | `0` para desactivar el modo de desarrollo. |
| `DJANGO_SECRET_KEY` | — | Obligatoria si `DJANGO_DEBUG=0`. En desarrollo se usa `.secret_key`, ignorado por git. |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,testserver` | Obligatoria si `DJANGO_DEBUG=0`. |

Hay un `backend/.env.example` con los valores de referencia. No se guardan credenciales en el repositorio.

## Cliente: puesta en marcha

En otra terminal, desde la raíz:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Vite sirve la aplicación en `http://localhost:5173`. El archivo `frontend/.env` (ignorado por git) define:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_TOKEN=opcional-solo-para-la-api-de-examenes
```

`VITE_API_TOKEN` solo es necesario para la sección de exámenes de la semana 12. El catálogo no lo usa.

### Rutas del cliente

| Ruta | Pantalla |
|---|---|
| `/` | Cartelera de cine (semana 11) |
| `/exams` | Exámenes (semana 12) |
| `/catalog` | Catálogo de productos |
| `/catalog/new` | Alta de producto |
| `/catalog/:id/edit` | Edición de producto |

## API del catálogo

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/categories/` | Lista completa de categorías (sin paginar, para el desplegable). |
| `POST` | `/api/categories/` | Crea una categoría. |
| `GET` | `/api/categories/{id}/` | Detalle de una categoría. |
| `PUT/PATCH` | `/api/categories/{id}/` | Actualiza una categoría. |
| `DELETE` | `/api/categories/{id}/` | Elimina una categoría. |
| `GET` | `/api/products/` | Lista paginada de productos con la categoría anidada. |
| `GET` | `/api/products/?category={id}` | Filtra por categoría. |
| `POST` | `/api/products/` | Crea un producto (multipart si incluye imagen). |
| `GET` | `/api/products/{id}/` | Detalle de un producto. |
| `PUT/PATCH` | `/api/products/{id}/` | Actualiza un producto. |
| `DELETE` | `/api/products/{id}/` | Elimina un producto. |

Cada producto se devuelve con `category: {id, name, description}` en la misma respuesta. Para escribir se envía `category_id`, un campo de solo escritura. El listado usa `PageNumberPagination` con `PAGE_SIZE = 5`.

## Pruebas y calidad

```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe manage.py test

# Frontend
cd frontend
npm run test
npm run lint
npm run build
```

Las capturas de evidencia se generan con Playwright desde `frontend/`:

```powershell
node scripts/capture-s13-evidence.mjs catalog
node scripts/capture-s13-evidence.mjs api
$env:S13_ADMIN_USER="admin"; $env:S13_ADMIN_PASSWORD="…"; node scripts/capture-s13-evidence.mjs admin
node scripts/capture-s13-evidence.mjs error   # con Django apagado
```

## Entregable

- `entregable/ENTREGABLE.md`: diagrama del catálogo, tabla de la API y explicación de cada captura.
- `entregable/diagrama-catalogo.png`: diagrama exportado como imagen.
- `entregable/capturas/`: evidencia numerada del admin, la API, el catálogo, los estados, el alta, la edición, el borrado y la estructura del proyecto en VS Code.

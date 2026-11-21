# 🎬 Cartelera de Cine

Proyecto académico de ReactJS — **DAE Semana 11: Comunicación entre
componentes**.

Aplicación de cartelera de cine con película destacada, búsqueda integrada en el
banner, filtros combinados, favoritos persistentes, detalle de película en una
ventana modal accesible y un carrusel de próximos estrenos con estados de carga,
error y reintento.

## Tecnologías

- **Vite** — build y servidor de desarrollo.
- **React 19** — componentes funcionales y hooks.
- **prop-types** — validación de props en desarrollo.
- **CSS nativo** — tokens, BEM y diseño responsive mobile-first.
- **react-hot-toast 2.6.1** — avisos emergentes al marcar o quitar favoritas.
- **Swiper 14.4.0** — carrusel de estrenos con navegación y paginación.
- **Vitest + Testing Library + jsdom** — pruebas de componentes y hooks.
- **Playwright** — capturas de evidencia en un navegador real.

## Características

- **8 películas** con datos locales, pósteres WebP, sinopsis, clasificación,
  puntuación, géneros, horarios y tráiler.
- **Componente `Button` reutilizable** con variantes `primary`, `secondary` y
  `ghost`, tamaños, modo icono y ancho completo. Se reutiliza en el banner, las
  tarjetas, el buscador, la cabecera, los estados vacíos y el reintento.
- **Patrón adaptador** en `src/utils/movieAdapter.js`: la cartelera y los
  estrenos se normalizan a un mismo modelo, con valores por defecto, valoración
  numérica, arreglos seguros, imagen de respaldo y conservación exacta de los
  `id` para no romper las favoritas guardadas.
- **Favoritos controlados desde `App`**: el estado guarda únicamente IDs y
  `MovieCard` no tiene estado propio.
- **Persistencia en `localStorage`** con lectura perezosa, escritura tolerante a
  errores y recuperación ante datos corruptos.
- **Toast en el dueño del estado**: `handleToggleFavorite` calcula si la película
  era favorita antes de actualizar, muestra un mensaje en español y usa un `id`
  estable para no duplicar avisos en `StrictMode`.
- **Búsqueda controlada** mediante `MovieSearch`, integrada en el banner junto a
  las llamadas a la acción.
- **Debounce de 300 ms** con `useDebounce` para no filtrar en cada pulsación.
  Solo el valor retardado alimenta el filtrado.
- **`useWindowSize` compartido**: un único lugar define los puntos de corte de
  1, 2, 3 y 4 columnas. `MovieList` los aplica con la variable CSS
  `--movie-columns` y `PremieresSection` los usa como `slidesPerView` del
  carrusel.
- **Estrenos con estados completos**: esqueletos con shimmer y `aria-busy`,
  carrusel con datos, mensaje de error con `role="alert"` y botón «Reintentar»,
  y estado vacío reutilizable. `PremieresSection` es dueña del estado; `App` no
  lo conoce.
- **Contador de favoritas elevado**: `favoritesCount` se deriva de
  `favoriteIds.length` en `App` y `Header` recibe solo el número, mostrado en un
  badge accesible.
- **«Limpiar filtro» en el banner**: visible solo con filtros activos; vacía el
  texto y el género, restaura la cartelera y devuelve el foco al buscador.
- **`MovieDetailModal`**: portal en `document.body`, fondo atenuado, scroll
  interno, cierre con X/Escape/fondo, retorno de foco, bloqueo del scroll,
  trampa de foco, `aria-modal` y `aria-labelledby`, póster con `aspect-ratio` y
  fallback, metadatos separados, fecha en español de Perú, chips de géneros y
  horarios, y tráiler validado o mensaje de disponibilidad.
- **Tema claro/oscuro** y diseño responsive probado a 360, 768 y 1280 px.

## Arquitectura

```text
src/
├── components/
│   ├── Button/            → Botón reutilizable y sus variantes
│   ├── EmptyState/        → Estado vacío anunciado con aria-live
│   ├── Footer/            → Pie de página
│   ├── Header/            → Marca, navegación, contador y cambio de tema
│   ├── Hero/              → Banner, carrusel y búsqueda
│   ├── MovieCard/         → Tarjeta sin estado propio
│   ├── MovieDetailModal/  → Detalle accesible en portal
│   ├── MovieList/         → Grid responsive, filtro de género y contador
│   ├── MovieSearch/       → Input de búsqueda controlado
│   ├── PremiereCard/      → Tarjeta de estreno sin estado
│   ├── PremiereSkeleton/  → Esqueleto con shimmer y aria-busy
│   └── PremieresSection/  → Carga, error, carrusel y reintento
├── data/
│   ├── cartelera.js       → Datos adaptados de las películas
│   └── premieres.js       → Seis estrenos en formato externo
├── hooks/
│   ├── useDebounce.js     → Retraso reutilizable de valores
│   ├── usePremieres.js    → Petición simulada, estados y reintento
│   └── useWindowSize.js   → Breakpoints compartidos y tamaño con debounce
├── services/
│   └── premieresService.js → fetchPremieres con retardo y error de desarrollo
├── styles/
│   ├── variables.css      → Tokens de diseño, toast y esqueleto
│   ├── reset.css          → Normalización
│   ├── base.css           → Tipografía, utilidades y shimmer
│   └── component-overrides.css
├── test/
│   └── setup.js           → Configuración de Testing Library
├── utils/
│   ├── constants.js       → Textos de interfaz (claves en inglés)
│   ├── favorites.js       → Lectura y escritura segura de favoritas
│   ├── formatters.js      → Fechas es-PE y validación de tráileres
│   └── movieAdapter.js    → Adaptadores puros para cartelera y estrenos
├── App.jsx                → Estado compartido y composición principal
└── main.jsx               → Punto de entrada
```

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

La aplicación queda disponible en la URL que imprime Vite (por defecto
`http://localhost:5173`).

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run lint       # oxlint
npm test           # pruebas con Vitest
npm run build      # build de producción
npm run preview    # sirve el build
```

## Cómo probar los estados de los estrenos

1. Ejecuta `npm run dev` y abre `http://localhost:5173`.
2. **Carga:** durante los primeros 1,5 s aparecen cuatro esqueletos con shimmer
   y el texto accesible «Cargando estrenos…».
3. **Datos:** al terminar la petición se muestran seis tarjetas en un carrusel
   con flechas, paginación y `slidesPerView` según el ancho de la ventana.
4. **Error:** en modo desarrollo abre
   `http://localhost:5173/?premieres=error`. La sección muestra el mensaje de
   error y el botón «Reintentar». Mientras el parámetro siga en la URL, el
   reintento vuelve a fallar; quita el parámetro (o vuelve a `/`) y pulsa
   «Reintentar» para comprobar la recuperación.
5. **Reintento:** al pulsar «Reintentar» se vuelve a ver la carga antes de
   mostrar los datos o el error.
6. **Responsive:** cambia el ancho de la ventana a 360, 768 y 1280 px; la
   cartelera y el carrusel comparten los mismos puntos de corte.

El parámetro `?premieres=error` solo funciona con `import.meta.env.DEV`; no
afecta al build de producción.

## Pruebas

Las pruebas cubren:

- Apertura y contenido del detalle de película.
- Cierre con botón, Escape y clic en el fondo.
- Retorno de foco al elemento que abrió el modal.
- Bloqueo y restauración del scroll del fondo.
- Ausencia de tráiler y rechazo de URLs no seguras.
- Fallback del póster cuando la imagen falla.
- Comportamiento controlado de `MovieSearch`, `EmptyState` y `useDebounce`.
- Retardo, reinicio y limpieza de `useDebounce`.
- Breakpoints compartidos, retardo de `resize` y limpieza de `useWindowSize`.
- Estados `loading`, `success`, `error`, reintento y cancelación de
  `usePremieres`.
- Normalización, valores por defecto, límites de valoración y conservación de
  `id` en `movieAdapter`.
- Formato de fecha `es-PE` y validación de URLs de tráiler.

## Accesibilidad

- HTML semántico y landmarks (`header`, `main`, `footer`, `section`).
- Etiquetas accesibles en todos los controles.
- Foco visible y navegación completa por teclado.
- Modal con foco atrapado, cierre con Escape y retorno de foco.
- `aria-live` para el contador, los resultados y el estado vacío.
- Esqueletos con `aria-busy` y texto accesible de carga.
- Error de estrenos con `role="alert"` y reintento mediante un botón real.
- Carrusel con mensajes de navegación y paginación traducidos al español.
- Iconos decorativos con `aria-hidden="true"` y tamaño explícito.
- Respeto a `prefers-reduced-motion`.

## Alcance del laboratorio

El proyecto es una aplicación frontend: no incluye backend Django ni requiere
variables de entorno. Por eso `python manage.py check` y
`makemigrations --check` no aplican. El archivo `.env.example` documenta un
override opcional del título de la aplicación y no contiene secretos.

Los pasos de los laboratorios 9 a 11 se reflejan en los commits del repositorio.
El laboratorio 11 agrega el adaptador, los toasts, los hooks compartidos, el
carrusel de estrenos, el contador elevado y la limpieza de filtros desde el
banner.

## Evidencia

- Laboratorio 11: capturas en [`docs/evidence/`](docs/evidence/) y entregable en
  [`docs/ENTREGABLE-LAB11.md`](docs/ENTREGABLE-LAB11.md).
- Laboratorio 10: capturas en [`docs/lab-10/evidence/`](docs/lab-10/evidence/) y
  entregable en [`docs/lab-10/deliverable.md`](docs/lab-10/deliverable.md).

## Datos y créditos

Los datos y las imágenes se usan con fines educativos. Consulta
[`CREDITS.md`](CREDITS.md) para las atribuciones.

## Autor

Fernando Correa — Fernando-Correa-27

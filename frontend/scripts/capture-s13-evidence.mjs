/**
 * Captures the week 13 evidence with Playwright.
 *
 * Usage (from frontend/):
 *   node scripts/capture-s13-evidence.mjs catalog
 *   node scripts/capture-s13-evidence.mjs api
 *   S13_ADMIN_USER=... S13_ADMIN_PASSWORD=... node scripts/capture-s13-evidence.mjs admin
 *   node scripts/capture-s13-evidence.mjs error   # run with Django stopped
 *
 * The catalog phase creates, edits and deletes one demo product so the
 * screenshots show the three operations without a full page reload.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const WEB_BASE = process.env.S13_WEB_BASE || 'http://localhost:5173'
const API_BASE = process.env.S13_API_BASE || 'http://127.0.0.1:8000/api'
const OUT_DIR = path.resolve(process.cwd(), '..', 'entregable', 'capturas')
const VIEWPORT = { width: 1440, height: 1200 }
const DEMO_PREFIX = 'Audífonos Demo S13'

const phase = process.argv[2] || 'catalog'

async function newPage(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'es-PE',
    colorScheme: 'light',
  })
  return { context, page: await context.newPage() }
}

async function shot(page, name) {
  // A full-page capture with a sticky header must start at the top, otherwise
  // the header is painted over the section title at the current scroll offset.
  await page.evaluate(() => window.scrollTo(0, 0))
  // Park the pointer so hover styles do not highlight a random card.
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
  await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true })
  console.log(`captured ${name}`)
}

async function cleanupDemoProducts() {
  let url = `${API_BASE}/products/?page=1`
  while (url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`API answered ${response.status} while cleaning demo data`)
    const data = await response.json()
    for (const product of data.results) {
      if (product.name.startsWith(DEMO_PREFIX)) {
        await fetch(`${API_BASE}/products/${product.id}/`, { method: 'DELETE' })
      }
    }
    url = data.next
  }
}

async function captureCatalog(browser) {
  await cleanupDemoProducts()
  const { context, page } = await newPage(browser)

  await page.goto(`${WEB_BASE}/catalog`)
  await page.waitForSelector('.product-card')
  await shot(page, '05-catalogo-completo.png')

  const filterResponse = page.waitForResponse(
    (response) => response.url().includes('/api/products/') && response.status() === 200,
  )
  await page.selectOption('#catalog-category', { label: 'Hogar' })
  await filterResponse
  await page.waitForTimeout(300)
  await shot(page, '06-catalogo-filtrado.png')

  await page.selectOption('#catalog-category', { label: 'Todas las categorías' })
  await page.waitForTimeout(300)
  await context.close()

  const loading = await newPage(browser)
  await loading.page.route('**/api/products/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    await route.continue()
  })
  await loading.page.goto(`${WEB_BASE}/catalog`, { waitUntil: 'domcontentloaded' })
  await loading.page.waitForSelector('.catalog-skeleton')
  await shot(loading.page, '07-estado-carga.png')
  await loading.context.close()

  const form = await newPage(browser)
  await form.page.goto(`${WEB_BASE}/catalog/new`)
  await form.page.waitForSelector('#product-name')
  const validationResponse = form.page.waitForResponse(
    (response) => response.url().includes('/api/products/') && response.status() === 400,
  )
  await form.page.click('button[type="submit"]')
  await validationResponse
  await form.page.waitForSelector('.product-form__field-error')
  await form.page.waitForTimeout(300)
  await shot(form.page, '09-formulario-error-validacion.png')

  await form.page.fill('#product-name', DEMO_PREFIX)
  await form.page.fill('#product-description', 'Producto de demostración creado desde el formulario.')
  await form.page.selectOption('#product-category', { label: 'Tecnología' })
  await form.page.fill('#product-price', '129.90')
  await form.page.fill('#product-stock', '7')
  await form.page.setInputFiles(
    '#product-image',
    path.resolve(process.cwd(), '..', 'backend', 'catalog', 'seed_images', 'parlante-orbit.jpg'),
  )
  const created = form.page.waitForURL('**/catalog')
  await form.page.click('button[type="submit"]')
  await created
  await form.page.waitForSelector(`.product-card:has-text("${DEMO_PREFIX}")`)
  await form.page.waitForTimeout(500)
  await shot(form.page, '10-catalogo-producto-creado.png')

  const editLink = form.page.locator(`.product-card:has-text("${DEMO_PREFIX}") a:has-text("Editar")`)
  await editLink.click()
  await form.page.waitForSelector('#product-name')
  await form.page.waitForTimeout(300)
  await shot(form.page, '11-formulario-edicion.png')

  await form.page.fill('#product-name', `${DEMO_PREFIX} Pro`)
  await form.page.fill('#product-price', '139.90')
  const updated = form.page.waitForURL('**/catalog')
  await form.page.click('button[type="submit"]')
  await updated
  await form.page.waitForSelector(`.product-card:has-text("${DEMO_PREFIX} Pro")`)
  await form.page.waitForTimeout(500)
  await shot(form.page, '12-catalogo-editado.png')

  form.page.once('dialog', (dialog) => dialog.accept())
  const deleted = form.page.waitForResponse(
    (response) => response.url().includes('/api/products/') && response.status() === 204,
  )
  await form.page
    .locator(`.product-card:has-text("${DEMO_PREFIX} Pro") button:has-text("Eliminar")`)
    .click()
  await deleted
  await form.page.waitForSelector(`.product-card:has-text("${DEMO_PREFIX} Pro")`, {
    state: 'detached',
  })
  await form.page.waitForTimeout(500)
  await shot(form.page, '13-catalogo-eliminado.png')

  await context.close()
}

async function captureApi(browser) {
  const { context, page } = await newPage(browser)
  await page.goto(`${API_BASE}/products/?format=json`)
  await shot(page, '03-api-productos.png')
  await page.goto(`${API_BASE}/categories/?format=json`)
  await shot(page, '04-api-categorias.png')
  await context.close()
}

async function captureAdmin(browser) {
  const username = process.env.S13_ADMIN_USER
  const password = process.env.S13_ADMIN_PASSWORD
  if (!username || !password) {
    throw new Error('Set S13_ADMIN_USER and S13_ADMIN_PASSWORD to capture the admin screens.')
  }

  const { context, page } = await newPage(browser)
  await page.goto('http://127.0.0.1:8000/admin/login/?next=/admin/')
  await page.fill('#id_username', username)
  await page.fill('#id_password', password)
  await page.click('input[type="submit"]')
  await page.waitForURL('**/admin/')

  await page.goto('http://127.0.0.1:8000/admin/catalog/category/')
  await page.waitForSelector('#result_list')
  await shot(page, '01-admin-categorias.png')

  await page.goto('http://127.0.0.1:8000/admin/catalog/product/?category__id__exact=1')
  await page.waitForSelector('#result_list')
  await shot(page, '02-admin-productos.png')
  await context.close()
}

async function captureError(browser) {
  const { context, page } = await newPage(browser)
  await page.goto(`${WEB_BASE}/catalog`)
  await page.waitForSelector('.catalog-error')
  await shot(page, '08-estado-error.png')
  await context.close()
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch()
try {
  if (phase === 'catalog') await captureCatalog(browser)
  else if (phase === 'api') await captureApi(browser)
  else if (phase === 'admin') await captureAdmin(browser)
  else if (phase === 'error') await captureError(browser)
  else throw new Error(`Unknown phase: ${phase}`)
} finally {
  await browser.close()
}

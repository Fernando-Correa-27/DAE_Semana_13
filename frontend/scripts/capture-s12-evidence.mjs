import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const baseUrl = process.env.EVIDENCE_URL || 'http://localhost:5173'
const outputDir = '../docs/capturas'
const mode = process.argv[2] || 'main'
const examTitle = 'Examen de prueba S12'

mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  colorScheme: 'dark',
})
const page = await context.newPage()
const messages = []

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    messages.push(`${message.type()}: ${message.text()}`)
  }
})
page.on('pageerror', (error) => messages.push(`pageerror: ${error.message}`))

async function screenshot(name) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `${outputDir}/${name}`, fullPage: true })
  console.log(`saved ${outputDir}/${name}`)
}

if (mode === 'main') {
  // Loading state: hold the API response long enough to see the skeleton.
  await page.route(/\/api\/exams\//, async (route) => {
    if (route.request().method() === 'GET') {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
    await route.continue()
  })
  await page.goto(`${baseUrl}/exams`, { waitUntil: 'domcontentloaded' })
  await page.locator('.exams-skeleton').waitFor({ state: 'visible' })
  await screenshot('01-estado-carga.png')
  await page.locator('.exams-table').waitFor({ state: 'visible' })
  await page.unroute(/\/api\/exams\//)

  // Data state.
  await screenshot('02-estado-datos.png')

  // Create: empty submit first, so the API answers 400 and the field error is shown.
  await page.goto(`${baseUrl}/exams/new`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Crear examen' }).click()
  await page.locator('.exam-form__field-error').waitFor({ state: 'visible' })
  const fieldError = await page.locator('.exam-form__field-error').innerText()
  console.log(`validation field error: ${fieldError}`)
  await screenshot('03-error-validacion.png')

  // Successful create, then back to the listing with the new row.
  await page.locator('#exam-title').fill(examTitle)
  await page.getByRole('button', { name: 'Crear examen' }).click()
  await page.waitForURL(`${baseUrl}/exams`)
  await page.getByText(examTitle, { exact: true }).first().waitFor({ state: 'visible' })
  console.log(`created row visible: ${examTitle}`)
  await screenshot('04-listado-con-nuevo-examen.png')

  // Delete the row created above; the list refreshes without a page reload.
  page.on('dialog', (dialog) => dialog.accept())
  const row = page.locator('tr', { hasText: examTitle }).first()
  await row.getByRole('button', { name: `Eliminar: ${examTitle}` }).click()
  await page.getByText(examTitle, { exact: true }).first().waitFor({ state: 'detached' })
  console.log(`deleted row: ${examTitle}`)
  await screenshot('05-listado-tras-eliminar.png')
} else if (mode === 'pagination') {
  await page.goto(`${baseUrl}/exams`, { waitUntil: 'domcontentloaded' })
  await page.locator('.exams-table').waitFor({ state: 'visible' })
  const nextButton = page.getByRole('button', { name: 'Siguiente' })
  const previousButton = page.getByRole('button', { name: 'Anterior' })
  const firstPageRows = await page.locator('.exams-table tbody tr').count()
  console.log(`first page rows: ${firstPageRows}`)
  console.log(`next enabled: ${await nextButton.isEnabled()}`)
  await screenshot('08-paginacion.png')
  const secondPageResponse = page.waitForResponse(
    (response) => response.url().includes('/api/exams/') && response.url().includes('page=2'),
  )
  await nextButton.click()
  await secondPageResponse
  await page.locator('.exams-table').waitFor({ state: 'visible' })
  await page.waitForTimeout(300)
  const secondPageRows = await page.locator('.exams-table tbody tr').count()
  console.log(`second page rows: ${secondPageRows}`)
  console.log(`previous enabled: ${await previousButton.isEnabled()}`)
} else {
  await page.goto(`${baseUrl}/exams`, { waitUntil: 'domcontentloaded' })
  await page.locator('.exams-error').waitFor({ state: 'visible' })
  const errorText = await page.locator('.exams-error').innerText()
  console.log(`error panel: ${errorText.replace(/\s+/g, ' ')}`)
  await screenshot(mode === 'cors' ? '07-error-cors.png' : '06-error-sin-conexion.png')
}

await browser.close()
console.log(messages.length > 0 ? messages.join('\n') : 'No console errors or warnings.')

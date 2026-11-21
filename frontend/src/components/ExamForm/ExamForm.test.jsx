import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ExamForm from './ExamForm'

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <ExamForm onSubmit={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('ExamForm', () => {
  it('submits the controlled title without a browser reload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.type(screen.getByLabelText('Título del examen'), 'Examen parcial')
    await user.click(screen.getByRole('button', { name: 'Crear examen' }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Examen parcial' })
  })

  it('shows the per-field message returned by the API', () => {
    renderForm({
      fieldErrors: { title: 'Este campo no puede estar en blanco.' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este campo no puede estar en blanco.',
    )
  })

  it('disables the submit button while the request is running', () => {
    renderForm({ isSubmitting: true })

    expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import UserLogin from '@/pages/user/UserLogin'

describe('UserLogin', () => {
  it('renderiza campos e botão', () => {
    render(
      <MemoryRouter>
        <UserLogin />
      </MemoryRouter>
    )

    expect(screen.getByText('TROCASSATO')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByText('E-mail')).toBeInTheDocument()
    expect(screen.getByText('Senha')).toBeInTheDocument()
  })
})

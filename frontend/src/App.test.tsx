import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.title': 'Family Task Planner',
        'app.welcome': 'Welcome to your family task planner! This is where you\'ll manage all your family\'s tasks and activities.'
      }
      return translations[key] || key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}))

describe('App', () => {
  it('renders app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /family task planner/i })).toBeInTheDocument()
  })

  it('renders language selector buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FR' })).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/welcome to your family task planner/i)).toBeInTheDocument()
  })

  it('has proper CSS classes', () => {
    render(<App />)
    const appElement = screen.getByRole('heading', { name: /family task planner/i }).closest('.app')
    expect(appElement).toHaveClass('app')
  })
})

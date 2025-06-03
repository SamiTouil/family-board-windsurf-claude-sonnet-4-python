import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock the useAuth hook
vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    error: null
  })
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.title': 'Family Task Planner',
        'auth.loginTitle': 'Sign In',
        'auth.loginButton': 'Sign In',
        'auth.signupTitle': 'Create Account',
        'auth.signupButton': 'Create Account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.firstName': 'First Name',
        'auth.lastName': 'Last Name',
        'auth.confirmPassword': 'Confirm Password',
        'auth.switchToSignup': 'Don\'t have an account? Sign up',
        'auth.switchToSignIn': 'Already have an account? Sign in'
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
  it('renders auth page when not authenticated', () => {
    render(<App />)
    // Should render the auth page since isAuthenticated is false
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
  })

  it('renders sign in form by default', () => {
    render(<App />)
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign In')
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('renders language selector', () => {
    render(<App />)
    expect(screen.getByTestId('lang-en-button')).toBeInTheDocument()
    expect(screen.getByTestId('lang-fr-button')).toBeInTheDocument()
  })

  it('renders app title', () => {
    render(<App />)
    expect(screen.getByText('Family Task Planner')).toBeInTheDocument()
  })
})

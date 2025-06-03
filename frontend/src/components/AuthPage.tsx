import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import './AuthPage.css'

interface FormData {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  confirmPassword?: string
}

export function AuthPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { login, signup, loading, error, clearError } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      errors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid')
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.passwordRequired')
    } else if (formData.password.length < 8) {
      errors.password = t('auth.passwordTooShort')
    }

    // Signup-specific validation
    if (isSignup) {
      if (!formData.firstName) {
        errors.firstName = t('auth.firstNameRequired')
      }
      if (!formData.lastName) {
        errors.lastName = t('auth.lastNameRequired')
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = t('auth.passwordRequired')
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('auth.passwordsNoMatch')
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear auth error when user starts typing
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isSignup) {
        await signup({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      } else {
        await login({
          email: formData.email,
          password: formData.password
        })
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const switchMode = (): void => {
    setIsSignup(!isSignup)
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: '',
    })
    setFormErrors({})
    clearError()
  }

  return (
    <div className="auth-page" data-testid="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="header-content">
            <h1 className="app-title" data-testid="app-title">{t('app.title')}</h1>
            <h2 className="auth-mode-title">{isSignup ? t('auth.signupTitle') : t('auth.loginTitle')}</h2>
          </div>
          <div className="language-selector">
            <button 
              onClick={() => changeLanguage('en')}
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              type="button"
              data-testid="lang-en-button"
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('fr')}
              className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
              type="button"
              data-testid="lang-fr-button"
            >
              FR
            </button>
          </div>
        </div>

        <div className="auth-form-container">
          {error && (
            <div className="auth-error" data-testid="auth-error">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form" noValidate data-testid="auth-form">
            {isSignup && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" data-testid="firstName-label">{t('auth.firstName')}</label>
                  <input
                    id="firstName"
                    data-testid="firstName-input"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && (
                    <span className="error-message" data-testid="firstName-error">
                      {formErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" data-testid="lastName-label">{t('auth.lastName')}</label>
                  <input
                    id="lastName"
                    data-testid="lastName-input"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && (
                    <span className="error-message" data-testid="lastName-error">
                      {formErrors.lastName}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" data-testid="email-label">{t('auth.email')}</label>
              <input
                id="email"
                data-testid="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <span className="error-message" data-testid="email-error">
                  {formErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" data-testid="password-label">{t('auth.password')}</label>
              <div className="password-input-container">
                <input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={formErrors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  data-testid="password-toggle"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.password && (
                <span className="error-message" data-testid="password-error">
                  {formErrors.password}
                </span>
              )}
            </div>

            {isSignup && (
              <div className="form-group">
                <label htmlFor="confirmPassword" data-testid="confirmPassword-label">{t('auth.confirmPassword')}</label>
                <div className="password-input-container">
                  <input
                    id="confirmPassword"
                    data-testid="confirmPassword-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={formErrors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="error-message" data-testid="confirmPassword-error">
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              data-testid="submit-button"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading 
                ? t('common.loading')
                : isSignup 
                  ? t('auth.signupButton') 
                  : t('auth.loginButton')
              }
            </button>
          </form>

          <div className="auth-switch">
            <button
              type="button"
              data-testid="switch-mode-button"
              className="switch-mode-btn"
              onClick={switchMode}
            >
              {isSignup ? t('auth.switchToLogin') : t('auth.switchToSignup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

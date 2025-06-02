import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import './App.css'

function AppContent(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  const handleAuthSuccess = () => {
    // Refresh auth state after successful login/signup
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage onSuccess={handleAuthSuccess} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{t('app.title')}</h1>
        <div className="header-controls">
          <div className="user-info">
            <span>Welcome, {user?.first_name}!</span>
            <button onClick={logout} className="logout-btn">
              {t('auth.logout')}
            </button>
          </div>
          <div className="language-selector">
            <button 
              onClick={() => changeLanguage('en')}
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('fr')}
              className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
            >
              FR
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="content-placeholder">
          <p>{t('app.welcome')}</p>
        </div>
      </main>
    </div>
  )
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

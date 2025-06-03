import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

export function Dashboard(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  const handleLogout = (): void => {
    logout()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="app-title">{t('app.title')}</h1>
          <div className="header-actions">
            <div className="language-selector">
              <button 
                onClick={() => changeLanguage('en')}
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                type="button"
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('fr')}
                className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                type="button"
              >
                FR
              </button>
            </div>
            <div className="user-menu">
              <span className="user-name" data-testid="user-name">
                {user?.first_name} {user?.last_name}
              </span>
              <button 
                onClick={handleLogout}
                className="logout-btn"
                data-testid="logout-button"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>
            {t('app.welcome')}
          </h2>
          <p className="user-greeting">
            Welcome back, {user?.first_name}! 👋
          </p>
        </div>

        <div className="content-placeholder">
          <div className="placeholder-card">
            <h3>🚀 Coming Soon</h3>
            <p>Family task management features will be available here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

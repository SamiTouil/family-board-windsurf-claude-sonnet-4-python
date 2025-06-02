import { useTranslation } from 'react-i18next'
import './App.css'

function App(): JSX.Element {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{t('app.title')}</h1>
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
      </header>
      <main className="app-main">
        <div className="content-placeholder">
          <p>{t('app.welcome')}</p>
        </div>
      </main>
    </div>
  )
}

export default App

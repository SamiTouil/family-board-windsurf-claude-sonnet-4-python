import { useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/AuthPage'
import { Dashboard } from './components/Dashboard'
import './App.css'

function App(): JSX.Element {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />
}

export default App

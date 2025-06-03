import { createContext, useContext, useReducer, useEffect } from 'react'
import { authApi, tokenManager } from '../services/api'
import type { AuthState, LoginRequest, SignupRequest } from '../types/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthState['user']; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app start
  useEffect(() => {
    const token = tokenManager.getToken()
    if (token) {
      // Verify token is still valid by fetching current user
      authApi.getCurrentUser()
        .then((user) => {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          })
        })
        .catch(() => {
          // Token is invalid, remove it
          tokenManager.removeToken()
        })
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authApi.login(credentials)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token
        }
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw error
    }
  }

  const signup = async (userData: SignupRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authApi.signup(userData)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token
        }
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Signup failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw error
    }
  }

  const logout = (): void => {
    authApi.logout()
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
